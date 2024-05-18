import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { authMiddleware } from '../middleware'
import prisma from '../prisma'

const userRouter = Router()

userRouter.post('/wallet-check', async (req, res) => {
  try {
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
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

userRouter.post('/upi-check', async (req, res) => {
  try {
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
      { walletAddress, upiId, name: user.name },
      process.env.JWT_SECRET ?? '',
    )

    return res.json({
      user: {
        ...user,
        pin: undefined,
      },
      token,
    })
  } catch (e: any) {
    console.log(e)
    return res.status(500).json({ message: e.message })
  }
})

userRouter.post('/sign-in', async (req, res) => {
  try {
    const { walletAddress, pin } = req.body

    const user = await prisma.user.findFirst({
      where: {
        walletAddress,
      },
    })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const match = await bcrypt.compare(pin, user.pin)

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { walletAddress: user.walletAddress, upiId: user.upiId, name: user.name },
      process.env.JWT_SECRET ?? '',
    )

    return res.json({
      user: {
        ...user,
        pin: undefined,
      },
      token,
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

userRouter.get('/check-auth', authMiddleware, async (req, res) => {
  try {
    const user = res.locals.user

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    return res.json({
      message: 'Valid User',
      userValid: true,
      user: {
        walletAddress: user.walletAddress,
        upiId: user.upiId,
        name: user.name,
      },
    })
  } catch (e) {
    console.log(e)
    return res.status(401).json({ message: 'Unauthorized', userValid: false })
  }
})

userRouter.get('/:upiId', async (req, res) => {
  try {
    const { upiId } = req.params

    const user = await prisma.user.findFirst({
      where: {
        upiId,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.json({ user })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: 'Something went wrong' })
  }
})

export default userRouter
