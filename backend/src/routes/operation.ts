import { Router } from 'express'
import {
  calculateTransactionFee,
  getTransactionWithRetry,
} from '../utils/connection'
import { authMiddleware } from '../middleware'
import prisma from '../prisma'
import {
  BASE_LAMPORTS,
  CONVENIENCE_FEE_PERCENTAGE,
  RPC_URL,
  VAULT_WALLET,
  connection,
} from '../config'
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { $Enums } from '@prisma/client'

const operationRouter = Router()

operationRouter.post('/pre-deposit', authMiddleware, async (req, res) => {
  try {
    const { lamports } = req.body
    const senderUser = res.locals.user
    if (!lamports) {
      return res.status(400).json({
        message: 'Amount is required',
        status: false,
      })
    }

    if (lamports <= 0) {
      return res.status(400).json({
        message: 'Invalid amount',
        status: false,
      })
    }

    const sender = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    if (!sender) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      })
    }

    const operation = await prisma.operationTransaction.create({
      data: {
        amount: lamports.toString(),
        signature: '',
        status: 'PENDING',
        userId: sender.id,
        operation: 'PREDEPOSIT',
      },
    })

    return res.status(200).json({
      message: 'Pre-Deposited',
      status: true,
      operation: {
        id: operation.id,
        amount: operation.amount,
        createdAt: operation.createdAt,
      },
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: 'Txn Error',
      status: false,
    })
  }
})

operationRouter.post('/deposit', authMiddleware, async (req, res) => {
  try {
    const { lamports, signature, operationTransactionId } = req.body
    const senderUser = res.locals.user

    if (!lamports || !signature) {
      return res.status(400).json({
        message: 'Amount and Signature is required',
        status: false,
      })
    }

    const depositer = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    if (!depositer) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      })
    }

    let depositerLocked = depositer?.Locked
    let tries = 10
    while (depositerLocked && tries > 0) {
      console.log('Waiting for user to unlock', 10 - tries)
      await new Promise((resolve) => setTimeout(resolve, 4000))
      const tempDepositor = await prisma.user.findFirst({
        where: {
          walletAddress: senderUser.walletAddress,
        },
      })
      if (!tempDepositor) {
        return res.status(404).json({
          message: 'User not found',
          status: false,
        })
      }
      depositerLocked = tempDepositor?.Locked!
      tries--
    }

    if (depositerLocked) {
      return res.status(400).json({
        message: 'User is locked',
        status: false,
      })
    }

    const operation = await prisma.operationTransaction.findFirst({
      where: {
        id: operationTransactionId,
      },
    })

    if (!operation) {
      return res.status(404).json({
        message: 'Operation not found',
        status: false,
      })
    }

    if (operation.status !== 'PENDING') {
      return res.status(400).json({
        message: 'Invalid Operation',
        status: false,
      })
    }

    if (operation.operation !== 'PREDEPOSIT') {
      return res.status(400).json({
        message: 'Invalid Operation',
        status: false,
      })
    }

    if (parseInt(operation.amount) !== lamports) {
      return res.status(400).json({
        message: 'Invalid Amount',
        status: false,
      })
    }

    const data = await prisma.$transaction([
      prisma.user.update({
        where: {
          id: depositer?.id,
        },
        data: {
          Locked: true,
        },
      }),
      prisma.operationTransaction.update({
        where: {
          id: operationTransactionId,
        },
        data: {
          signature,
          operation: 'DEPOSIT',
        },
      }),
    ])

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
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: depositer?.id,
          },
          data: {
            Locked: false,
          },
        }),
        prisma.operationTransaction.update({
          where: {
            id: data[1].id,
          },
          data: {
            status: 'FAILED',
          },
        }),
      ])
      return res.status(400).json({
        message: 'Invalid Transaction',
        status: false,
      })
    }

    if (
      transaction?.transaction.message.getAccountKeys().get(1)?.toString() !==
      VAULT_WALLET().publicKey.toString()
    ) {
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: depositer?.id,
          },
          data: {
            Locked: false,
          },
        }),
        prisma.operationTransaction.update({
          where: {
            id: data[1].id,
          },
          data: {
            status: 'FAILED',
          },
        }),
      ])
      return res.status(411).json({
        message: 'Transaction sent to wrong address',
        status: false,
      })
    }

    if (
      transaction?.transaction.message.getAccountKeys().get(0)?.toString() !==
      depositer?.walletAddress
    ) {
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: depositer?.id,
          },
          data: {
            Locked: false,
          },
        }),
        prisma.operationTransaction.update({
          where: {
            id: data[1].id,
          },
          data: {
            status: 'FAILED',
          },
        }),
      ])
      return res.status(411).json({
        message: 'Transaction sent to wrong address',
        status: false,
      })
    }

    const newUser = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    if (!newUser) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: depositer?.id,
        },
        data: {
          Locked: false,
          walletBalance: (
            parseInt(newUser?.walletBalance!) + parseInt(lamports)
          ).toString(),
        },
      }),
      prisma.operationTransaction.update({
        where: {
          id: data[1].id,
        },
        data: {
          status: 'COMPLETED',
        },
      }),
    ])

    const user = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    return res.status(200).json({
      message: 'Deposited',
      status: true,
      user: {
        walletBalance: user?.walletBalance,
        walletAddress: user?.walletAddress,
        id: user?.Locked,
        upiId: user?.upiId,
        craetedAt: user?.createdAt,
        updatedAt: user?.updatedAt,
      },
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: 'Txn Error',
      status: false,
    })
  }
})

operationRouter.post('/iswithdraw', authMiddleware, async (req, res) => {
  try {
    const { lamports } = req.body
    const user = res.locals.user

    if (!lamports) {
      return res.status(400).json({
        message: 'Amount is required',
        status: false,
      })
    }

    const withdrawer = await prisma.user.findFirst({
      where: {
        walletAddress: user.walletAddress,
      },
    })

    if (!withdrawer) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      })
    }

    const serverTxnFee = (await calculateTransactionFee()) * BASE_LAMPORTS
    const withdrawerLamports = Math.floor(
      (100 * (parseInt(lamports) - serverTxnFee)) /
        (100 + CONVENIENCE_FEE_PERCENTAGE),
    )

    if (withdrawerLamports <= 0) {
      return res.status(400).json({
        message: 'Invalid amount',
        status: false,
      })
    }

    if (parseInt(withdrawer.walletBalance) < lamports) {
      return res.status(400).json({
        message: 'Insufficient balance',
        status: false,
      })
    }

    return res.status(200).json({
      message: 'Withdrawable',
      status: true,
      lamports: withdrawerLamports,
      fees:
        serverTxnFee +
        Math.floor((withdrawerLamports * CONVENIENCE_FEE_PERCENTAGE) / 100),
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: 'Txn Error',
      status: false,
    })
  }
})

operationRouter.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const { lamports } = req.body
    const senderUser = res.locals.user

    if (!lamports) {
      return res.status(400).json({
        message: 'Amount is required',
        status: false,
      })
    }

    if (lamports <= 0) {
      return res.status(400).json({
        message: 'Invalid amount',
        status: false,
      })
    }

    const withdrawer = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    if (!withdrawer) {
      return res.status(404).json({
        message: 'User not found',
        status: false,
      })
    }

    const serverTxnFee = (await calculateTransactionFee()) * BASE_LAMPORTS
    const withdrawerLamports = Math.floor(
      (100 * (parseInt(lamports) - serverTxnFee)) /
        (100 + CONVENIENCE_FEE_PERCENTAGE),
    )
    const fee =
      serverTxnFee +
      Math.floor((withdrawerLamports * CONVENIENCE_FEE_PERCENTAGE) / 100)

    if (withdrawerLamports <= 0) {
      return res.status(400).json({
        message: 'Invalid amount',
        status: false,
      })
    }

    const withdrawOperation = await prisma.operationTransaction.create({
      data: {
        amount: withdrawerLamports.toString(),
        fee: fee.toString(),
        signature: '',
        status: 'PENDING',
        userId: withdrawer.id,
        operation: 'WITHDRAW',
      },
    })

    let withdrawerLocked = withdrawer?.Locked
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
        id: withdrawer.id,
      },
      data: {
        Locked: true,
      },
    })

    const newWithdrawer = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    if (!newWithdrawer) {
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: withdrawer.id,
          },
          data: {
            Locked: false,
          },
        }),
        prisma.operationTransaction.update({
          where: {
            id: withdrawOperation.id,
          },
          data: {
            status: 'FAILED',
          },
        }),
      ])
      return res.status(404).json({
        message: 'User not found',
        status: false,
      })
    }

    if (parseInt(newWithdrawer.walletBalance) < parseInt(lamports)) {
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: withdrawer.id,
          },
          data: {
            Locked: false,
          },
        }),
        prisma.operationTransaction.update({
          where: {
            id: withdrawOperation.id,
          },
          data: {
            status: 'FAILED',
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
        toPubkey: new PublicKey(withdrawer.walletAddress),
        lamports: withdrawerLamports,
      }),
    )
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      wallet,
    ])

    const txn = await getTransactionWithRetry(signature, {
      maxSupportedTransactionVersion: 1,
    })

    if (
      (txn?.meta?.postBalances[1] ?? 0) - (txn?.meta?.preBalances[1] ?? 0) !==
      withdrawerLamports
    ) {
      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: withdrawer.id,
          },
          data: {
            Locked: false,
          },
        }),
        prisma.operationTransaction.update({
          where: {
            id: withdrawOperation.id,
          },
          data: {
            status: 'FAILED',
          },
        }),
      ])
      return res.status(400).json({
        message: 'Invalid Transaction',
        status: false,
      })
    }

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: withdrawer.id,
        },
        data: {
          Locked: false,
          walletBalance: (
            parseInt(newWithdrawer.walletBalance) - lamports
          ).toString(),
        },
      }),
      prisma.operationTransaction.update({
        where: {
          id: withdrawOperation.id,
        },
        data: {
          status: 'COMPLETED',
          signature,
        },
      }),
    ])

    const user = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    return res.status(200).json({
      message: 'withdrawed',
      status: true,
      user: {
        walletBalance: user?.walletBalance,
        walletAddress: user?.walletAddress,
        id: user?.Locked,
        upiId: user?.upiId,
        craetedAt: user?.createdAt,
        updatedAt: user?.updatedAt,
      },
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: 'Txn Error',
      status: false,
    })
  }
})

operationRouter.get('/history', authMiddleware, async (req, res) => {
  try {
    const query = req.query
    const page = query.page ? parseInt(query.page as string) : 1
    const limit = query.limit ? parseInt(query.limit as string) : 10
    let operation = query.operation ? query.operation : 'ALL'
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
      userId: userData.id,
    }

    if (status !== 'ALL') {
      whereObject = {
        ...whereObject,
        status,
      }
    }

    if (operation === 'ALL') {
      whereObject = {
        ...whereObject,
        OR: [
          {
            operation: 'DEPOSIT',
          },
          {
            operation: 'PREDEPOSIT',
          },
          {
            operation: 'WITHDRAW',
          },
        ],
      }
    } else if (operation === 'DEPOSIT') {
      whereObject = {
        ...whereObject,
        OR: [
          {
            operation: 'DEPOSIT',
          },
          {
            operation: 'PREDEPOSIT',
          },
        ],
      }
    } else if (operation === 'WITHDRAW') {
      whereObject = {
        ...whereObject,
        operation: 'WITHDRAW',
      }
    } else {
      return res.status(400).json({
        message: 'Invalid operation',
        status: false,
      })
    }

    const transactions = await prisma.operationTransaction.findMany({
      where: {
        ...whereObject,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: order,
      },
    })

    const totalCount = await prisma.operationTransaction.count({
      where: {
        ...whereObject,
      },
    })

    const totalPages = Math.ceil(totalCount / limit)
    const currentPage = page
    const firstPage = 1
    const lastPage = totalPages

    return res.status(200).json({
      message: 'Transactions',
      status: true,
      transactions,
      totalPages,
      currentPage,
      firstPage,
      lastPage,
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: 'Txn Error',
      status: false,
    })
  }
})

export default operationRouter
