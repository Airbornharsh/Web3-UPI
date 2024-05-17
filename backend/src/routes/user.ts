import { Router } from 'express'
import { authMiddleware } from '../middleware'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userRouter = Router()

userRouter.post('/wallet-check', async (req, res) => {
  try {
    const prisma = new PrismaClient()
    const { walletAddress } = req.body

    const user = await prisma.user.findFirst({
      where: {
        walletAddress,
      },
    })

    if (user) {
      return res.json({
        message: 'User Found',
        userExists: true,
        user: {
          name: user.name,
          upiId: user.upiId,
        },
      })
    } else {
      return res.json({ message: 'User not found', userExists: false })
    }
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Something went wrong' })
  }
})

userRouter.post('/upi-check', async (req, res) => {
  try {
    const prisma = new PrismaClient()
    const { walletAddress, upiId } = req.body

    const user = await prisma.user.findFirst({
      where: {
        upiId,
      },
    })

    if (user) {
      return res.json({
        message: 'User Found',
        userExists: true,
        user: {
          name: user.name,
          walletAddress: user.walletAddress,
        },
      })
    } else {
      return res.json({ message: 'User not found', userExists: false })
    }
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Something went wrong' })
  }
})

userRouter.post('/create-user', async (req, res) => {
  try {
    const prisma = new PrismaClient()
    const { name, walletAddress, upiId, pin } = req.body

    const tempUser = await prisma.user.findFirst({
      where: {
        OR: [{ upiId }, { walletAddress }],
      },
    })

    if (tempUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const hashedPin = await bcrypt.hash(pin, 10)

    const user = await prisma.user.create({
      data: {
        name,
        walletAddress,
        upiId,
        pin: hashedPin,
      },
    })

    const token = jwt.sign(
      { walletAddress, upiId },
      process.env.JWT_SECRET ?? '',
    )

    res.json({
      user: {
        ...user,
        pin: undefined,
      },
      token,
    })
  } catch (e: any) {
    console.log(e)
    res.status(500).json({ message: e.message })
  }
})

userRouter.post('/login', async (req, res) => {
  try {
    const prisma = new PrismaClient()
    const { walletAddress, pin } = req.body

    const user = await prisma.user.findFirst({
      where: {
        walletAddress,
      },
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    res.json({ user })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Something went wrong' })
  }
})

userRouter.get(
  '/:upiId',
  (req, res, next) => {
    authMiddleware(req, res, next)
  },
  async (req, res) => {
    try {
      const prisma = new PrismaClient()
      const { upiId } = req.params

      const user = await prisma.user.findFirst({
        where: {
          upiId,
        },
      })

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      res.json({ user })
    } catch (e) {
      console.log(e)
      res.status(500).json({ message: 'Something went wrong' })
    }
  },
)

export default userRouter
