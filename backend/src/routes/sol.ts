import { Router } from 'express'
import web3, { PublicKey } from '@solana/web3.js'
import { authMiddleware } from '../middleware'
import { Connection } from '@solana/web3.js'
import { RPC_URL } from '../config'
import { getWallet } from '../utils/wallet'
import prisma from '../prisma'

const solRouter = Router()

const connection = new Connection(RPC_URL ?? '')

solRouter.get('/sol', authMiddleware, async (req, res) => {
  try {
    const senderUser = res.locals.user
    const sender = await prisma.user.findFirst({
      where: {
        walletAddress: senderUser.walletAddress,
      },
    })

    if (!sender) {
      return res.status(401).json({
        message: 'No user',
        status: false,
      })
    }

    const claimedSol = await prisma.claimedSol.findFirst({
      where: {
        walletAddress: sender.walletAddress,
      },
    })

    if (claimedSol) {
      return res.status(200).json({
        message: 'Already claimed',
        status: false,
      })
    }

    const adminWallet = await getWallet()
    if (!adminWallet) {
      return res.status(500).json({
        message: 'Txn Error',
        status: false,
      })
    }
    const txn = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: adminWallet?.publicKey!,
        toPubkey: new PublicKey(sender?.walletAddress!),
        lamports: 1000000000,
      }),
    )
    await connection.sendTransaction(txn, [adminWallet!])
    await prisma.claimedSol.create({
      data: {
        walletAddress: sender.walletAddress,
        userId: sender.id,
      },
    })
    return res.json({
      message: 'Claimed 1 SOL',
      status: true,
    })
  } catch (e) {
    console.log(e)
    return res
      .status(500)
      .json({ message: 'Something went wrong', status: false })
  }
})

export default solRouter
