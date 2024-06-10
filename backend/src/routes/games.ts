import { Router } from 'express'
import { authMiddleware } from '../middleware'
import { BASE_LAMPORTS, DICE_MULTIPLIER } from '../config'
import prisma from '../prisma'

const gamesRouter = Router()

gamesRouter.post('/dice', authMiddleware, async (req, res) => {
  try {
    const { betAmount, rollUnder } = req.body
    const localUser = res.locals.user

    if (betAmount < 0) {
      return res
        .status(400)
        .send({ message: 'Bet Amount must be greater than 0' })
    }
    if (betAmount > 100000 * BASE_LAMPORTS) {
      return res
        .status(400)
        .send({ message: 'Bet Amount must be less than 100000' })
    }
    if (rollUnder < 2) {
      return res
        .status(400)
        .send({ message: 'Roll Under must be greater than 2' })
    }
    if (rollUnder > 98) {
      return res
        .status(400)
        .send({ message: 'Roll Under must be less than 98' })
    }
    let user = await prisma.user.findFirst({
      where: {
        walletAddress: localUser.walletAddress,
      },
    })
    if (!user) {
      return res.status(400).send({ message: 'User not found' })
    }
    let userLocked = user?.Locked
    let tries = 10
    while (userLocked && tries > 0) {
      console.log('Waiting for user to unlock', 10 - tries)
      await new Promise((resolve) => setTimeout(resolve, 4000))
      const tempUser = await prisma.user.findFirst({
        where: {
          walletAddress: user?.walletAddress,
        },
      })
      if (!tempUser) {
        return res.status(404).json({
          message: 'User not found',
          status: false,
        })
      }
      userLocked = user?.Locked!
      tries--
    }
    if (userLocked) {
      return res.status(400).json({
        message: 'User is locked',
        status: false,
      })
    }
    user = await prisma.user.update({
      where: {
        walletAddress: user.walletAddress,
      },
      data: {
        Locked: true,
      },
    })

    if (user.walletBalance < betAmount) {
      return res.status(400).send({ message: 'Insufficient Balance' })
    }
    const winChance = 100 - rollUnder
    const multiplier = parseFloat((DICE_MULTIPLIER / winChance).toFixed(4))
    const winAmount = betAmount * multiplier
    const win = Math.random() * 100 < winChance
    const newBalance = win
      ? parseInt(user.walletBalance) - betAmount + winAmount
      : parseInt(user.walletBalance) - betAmount
    const data = await prisma.$transaction([
      prisma.game.create({
        data: {
          userId: user.id,
          gameType: 'DICE',
          multiplier: multiplier.toString(),
          betAmount: betAmount.toString(),
          winAmount: winAmount.toString(),
          winChance: winChance.toString(),
          rollUnder: rollUnder.toString(),
          win,
        },
      }), 
      prisma.user.update({
        where: {
          walletAddress: user.walletAddress,
        },
        data: {
          walletBalance: newBalance.toString(),
          Locked: false,
        },
      }),
    ])
    const game = data[0]
    return res.status(200).json({
      message: 'Game played successfully',
      status: true,
      game,
      user: {
        walletBalance: newBalance,
      },
    })
  } catch (e) {
    console.error(e)
    res.status(500).send({ message: 'Internal Server Error' })
  }
})

export default gamesRouter
