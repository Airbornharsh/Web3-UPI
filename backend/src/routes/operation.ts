import { Router } from 'express'
import { getTransactionWithRetry } from '../utils/connection'
import { authMiddleware } from '../middleware'
import prisma from '../prisma'
import { VAULT_WALLET } from '../config'

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
        success: false,
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
        success: false,
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

operationRouter.post('/withraw', async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Withrawed',
      status: true,
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
