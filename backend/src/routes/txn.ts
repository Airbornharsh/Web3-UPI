import { Router } from 'express'
import prisma from '../prisma'
import { authMiddleware } from '../middleware'
import bcrypt from 'bcrypt'
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import {
  BASE_LAMPORTS,
  CONVENIENCE_FEE_PERCENTAGE,
  RPC_URL,
  VAULT_WALLET,
} from '../config'
import {
  calculateTransactionFee,
  getTransactionWithRetry,
} from '../utils/connection'
import { $Enums } from '@prisma/client'

const txnRouter = Router()

const connection = new Connection(RPC_URL ?? '')

txnRouter.get('/upiId', authMiddleware, async (req, res) => {
  try {
    const { upiId } = req.query
    const query = req.query

    if (!upiId) {
      return res.status(400).json({ message: 'UPI ID is required' })
    }

    const page = query.page ? parseInt(query.page as string) : 1
    const limit = query.limit ? parseInt(query.limit as string) : 10
    const users = await prisma.user.findMany({
      where: {
        upiId: {
          contains: upiId ? upiId.toString() : '',
        },
        NOT: {
          walletAddress: res.locals.user.walletAddress,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' })
    }

    res.json({ message: 'User List', users })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

txnRouter.post('/send/wallet-1', authMiddleware, async (req, res) => {
  try {
    const { lamports, upiId, walletAddress, signature } = req.body
    const senderUser = res.locals.user

    console.log(req.body)

    if (!lamports || !upiId) {
      return res.status(400).json({ message: 'Amount and UPI ID is required' })
    }

    if (lamports <= 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' })
    }

    if (lamports < 20000000) {
      return res
        .status(400)
        .json({ message: 'Amount should be more than 0.02 sol' })
    }

    const sender = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' })
    }

    const receiver = await prisma.user.findFirst({
      where: {
        upiId,
        walletAddress,
      },
    })

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (receiver.walletAddress === sender.walletAddress) {
      return res
        .status(400)
        .json({ message: 'You cannot send money to yourself' })
    }

    const txn = await prisma.transaction.create({
      data: {
        amount: lamports.toString(),
        senderId: sender.id,
        recieverId: receiver.id,
        signature,
      },
    })

    const transaction = await getTransactionWithRetry(signature, {
      maxSupportedTransactionVersion: 1,
    })

    if (
      (transaction?.meta?.postBalances[1] ?? 0) -
        (transaction?.meta?.preBalances[1] ?? 0) !==
        lamports &&
      (transaction?.meta?.preBalances[0] ?? 0) -
        (transaction?.meta?.postBalances[0] ?? 0) !==
        lamports
    ) {
      await prisma.transaction.update({
        where: {
          id: txn.id,
        },
        data: {
          status: 'FAILED',
        },
      })
      return res.status(411).json({
        message: 'Transaction signature/amount incorrect',
        status: false,
      })
    }

    if (
      transaction?.transaction.message.getAccountKeys().get(1)?.toString() !==
      receiver.walletAddress
    ) {
      await prisma.transaction.update({
        where: {
          id: txn.id,
        },
        data: {
          status: 'FAILED',
        },
      })
      return res.status(411).json({
        message: 'Transaction sent to wrong address',
        status: false,
      })
    }

    if (
      transaction?.transaction.message.getAccountKeys().get(0)?.toString() !==
      sender.walletAddress
    ) {
      await prisma.transaction.update({
        where: {
          id: txn.id,
        },
        data: {
          status: 'FAILED',
        },
      })
      return res.status(411).json({
        message: 'Transaction sent to wrong address',
        status: false,
      })
    }

    await prisma.transaction.update({
      where: {
        id: txn.id,
      },
      data: {
        status: 'COMPLETED',
      },
    })

    return res.json({ message: 'Transaction successful', status: true })
  } catch (e) {
    console.log(e)
    return res
      .status(500)
      .json({ message: 'Something went wrong', status: false })
  }
})

txnRouter.post('/send/wallet-2', authMiddleware, async (req, res) => {
  try {
    const { lamports, upiId, walletAddress, pin } = req.body
    const senderUser = res.locals.user

    console.log(req.body)

    if (!lamports || !upiId) {
      return res.status(400).json({ message: 'Amount and UPI ID is required' })
    }

    if (lamports <= 0) {
      return res.status(400).json({ message: 'Amount cannot be negative' })
    }

    if (lamports < 20000000) {
      return res
        .status(400)
        .json({ message: 'Amount should be more than 0.02 sol' })
    }

    let sender = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' })
    }

    const hashedPin = await bcrypt.compare(pin, sender.pin)

    if (!hashedPin) {
      return res.status(401).json({ message: 'Incorrect pin' })
    }

    const receiver = await prisma.user.findFirst({
      where: {
        upiId,
        walletAddress,
      },
    })

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (receiver.walletAddress === sender.walletAddress) {
      return res
        .status(400)
        .json({ message: 'You cannot send money to yourself' })
    }

    const serverTxnFee = (await calculateTransactionFee()) * BASE_LAMPORTS
    const withdrawerLamports = Math.floor(
      (100 * (parseInt(lamports) - serverTxnFee)) /
        (100 + CONVENIENCE_FEE_PERCENTAGE),
    )
    const fee =
      serverTxnFee +
      Math.floor((withdrawerLamports * CONVENIENCE_FEE_PERCENTAGE) / 100)
    const withdrawOperation = await prisma.operationTransaction.create({
      data: {
        amount: withdrawerLamports.toString(),
        fee: fee.toString(),
        status: 'PENDING',
        userId: sender.id,
        toId: receiver.id,
        operation: 'WITHDRAW',
        signature: '',
      },
    })

    const data = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: lamports.toString(),
          senderId: sender.id,
          recieverId: receiver.id,
          wallet: 'WALLET2',
          status: 'PENDING',
          operationTransactionId: withdrawOperation.id,
        },
      }),
      prisma.user.findFirst({
        where: {
          walletAddress: sender.walletAddress,
        },
      }),
    ])
    const txn = data[0]
    sender = data[1]

    let withdrawerLocked = sender?.Locked
    let tries = 10
    while (withdrawerLocked && tries > 0) {
      console.log('Waiting for user to unlock', 10 - tries)
      await new Promise((resolve) => setTimeout(resolve, 4000))
      const tempwithdrawer = await prisma.user.findFirst({
        where: {
          walletAddress: senderUser.walletAddress,
        },
      })
      if (!tempwithdrawer) {
        return res.status(404).json({
          message: 'User not found',
          status: false,
        })
      }
      withdrawerLocked = tempwithdrawer?.Locked!
      tries--
    }

    if (withdrawerLocked) {
      await prisma.operationTransaction.update({
        where: {
          id: withdrawOperation.id,
        },
        data: {
          status: 'FAILED',
        },
      })
      return res.status(400).json({
        message: 'User is locked',
        status: false,
      })
    }

    await prisma.user.update({
      where: {
        id: sender?.id,
      },
      data: {
        Locked: true,
      },
    })

    sender = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    if (parseInt(sender?.walletBalance!) < parseInt(lamports)) {
      await prisma.$transaction([
        prisma.operationTransaction.update({
          where: {
            id: withdrawOperation.id,
          },
          data: {
            status: 'FAILED',
          },
        }),
        prisma.transaction.update({
          where: {
            id: txn.id,
          },
          data: {
            status: 'FAILED',
          },
        }),
        prisma.user.update({
          where: {
            id: sender?.id,
          },
          data: {
            Locked: false,
          },
        }),
      ])
      return res.status(400).json({
        message: 'Insufficient balance',
        status: false,
      })
    }

    const wallet = VAULT_WALLET()

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey(receiver.walletAddress),
        lamports: withdrawerLamports,
      }),
    )

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      wallet,
    ])

    const txn2 = await getTransactionWithRetry(signature, {
      maxSupportedTransactionVersion: 1,
    })

    if (
      (txn2?.meta?.postBalances[1] ?? 0) - (txn2?.meta?.preBalances[1] ?? 0) !==
        withdrawerLamports &&
      (txn2?.meta?.preBalances[0] ?? 0) - (txn2?.meta?.postBalances[0] ?? 0) !==
        withdrawerLamports
    ) {
      await prisma.$transaction([
        prisma.operationTransaction.update({
          where: {
            id: withdrawOperation.id,
          },
          data: {
            status: 'FAILED',
          },
        }),
        prisma.transaction.update({
          where: {
            id: txn.id,
          },
          data: {
            status: 'FAILED',
          },
        }),
        prisma.user.update({
          where: {
            id: sender?.id,
          },
          data: {
            Locked: false,
          },
        }),
      ])
      return res.status(411).json({
        message: 'Transaction signature/amount incorrect',
        status: false,
      })
    }

    await prisma.$transaction([
      prisma.operationTransaction.update({
        where: {
          id: withdrawOperation.id,
        },
        data: {
          status: 'COMPLETED',
          signature,
        },
      }),
      prisma.transaction.update({
        where: {
          id: txn.id,
        },
        data: {
          status: 'COMPLETED',
        },
      }),
      prisma.user.update({
        where: {
          id: sender?.id,
        },
        data: {
          Locked: false,
          walletBalance: (
            parseInt(sender?.walletBalance!) - lamports
          ).toString(),
        },
      }),
    ])

    sender = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    return res.status(200).json({
      message: 'Transaction successful',
      status: true,
      user: {
        walletBalance: sender?.walletBalance,
        walletAddress: sender?.walletAddress,
        id: sender?.id,
        upiId: sender?.upiId,
        craetedAt: sender?.createdAt,
        updatedAt: sender?.updatedAt,
      },
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

txnRouter.get('/history', authMiddleware, async (req, res) => {
  try {
    const query = req.query
    const page = query.page ? parseInt(query.page as string) : 1
    const limit = query.limit ? parseInt(query.limit as string) : 10
    const status = (query.status ? query.status : 'COMPLETED') as
      | $Enums.Status
      | 'ALL'
    const order = (query.order ? query.order : 'desc') as 'asc' | 'desc'
    const user = res.locals.user

    const userData = await prisma.user.findFirst({
      where: {
        walletAddress: user.walletAddress,
      },
    })

    if (!userData) {
      return res.status(404).json({ message: 'User not found' })
    }

    let whereObject: any = {
      OR: [
        {
          senderId: userData.id,
        },
        {
          recieverId: userData.id,
        },
      ],
    }

    if (status !== 'ALL') {
      whereObject = {
        ...whereObject,
        status,
      }
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        ...whereObject,
      },
      include: {
        receiver: {
          select: {
            walletAddress: true,
            upiId: true,
            name: true,
            id: true,
          },
        },
        sender: {
          select: {
            walletAddress: true,
            upiId: true,
            name: true,
            id: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: order,
      },
    })

    const totalCount = await prisma.transaction.count({
      where: {
        ...whereObject,
      },
    })

    const totalPages = Math.ceil(totalCount / limit)
    const currentPage = page
    const firstPage = 1
    const lastPage = totalPages

    res.json({
      message: 'Transaction List',
      status: true,
      transactions,
      totalPages,
      currentPage,
      firstPage,
      lastPage,
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default txnRouter
