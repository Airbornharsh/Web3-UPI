import { Router } from 'express'
import prisma from '../prisma'
import { authMiddleware } from '../middleware'
import { Connection, PublicKey } from '@solana/web3.js'
import { RPC_URL } from '../config'
import { getTransactionWithRetry } from '../utils/connection'

const txnRouter = Router()

const connection = new Connection(RPC_URL ?? '')

txnRouter.get('/upiId', authMiddleware, async (req, res) => {
  try {
    const { upiId } = req.query
    const query = req.query

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

    const modifiedUsers = users.map((user) => {
      return {
        id: user.id,
        walletAddress: user.walletAddress,
        upiId: user.upiId,
      }
    })

    res.json({ message: 'User List', users: modifiedUsers })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

txnRouter.post('/send', authMiddleware, async (req, res) => {
  try {
    const { lamports, upiId, walletAddress, signature } = req.body
    const senderUser = res.locals.user

    console.log(req.body)

    if (!lamports || !upiId) {
      return res.status(400).json({ message: 'Amount and UPI ID is required' })
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
        amount: lamports,
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
          Status: 'FAILED',
        },
      })
      return res.status(411).json({
        message: 'Transaction signature/amount incorrect',
        success: false,
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
          Status: 'FAILED',
        },
      })
      return res.status(411).json({
        message: 'Transaction sent to wrong address',
        success: false,
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
          Status: 'FAILED',
        },
      })
      return res.status(411).json({
        message: 'Transaction sent to wrong address',
        success: false,
      })
    }

    await prisma.transaction.update({
      where: {
        id: txn.id,
      },
      data: {
        Status: 'COMPLETED',
      },
    })

    return res.json({ message: 'Transaction successful', success: true })
  } catch (e) {
    console.log(e)
    return res
      .status(500)
      .json({ message: 'Something went wrong', success: false })
  }
})

export default txnRouter
