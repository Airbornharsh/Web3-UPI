import express from 'express'
import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { authMiddleware } from './middleware'

config()

const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.post('/create-user', async (req, res) => {
  try {
    const prisma = new PrismaClient()
    const { name, walletAddress, upiId, pin } = req.body

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
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Something went wrong' })
  }
})

app.post('/login', async (req, res) => {
  try {
    const prisma = new PrismaClient()
    const { walletAddress, pin } = req.body

    const user = await prisma.user.findFirst({
      where: {
        walletAddress,
        pin,
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

app.get(':upiId', async (req, res) => {
  try {
    const prisma = new PrismaClient()
    const { upiId } = req.params
    const query = req.query

    if (!upiId) {
      return res.status(400).json({ message: 'UPI ID is required' })
    }

    const page = query.page ? parseInt(query.page as string) : 1
    const limit = query.limit ? parseInt(query.limit as string) : 10
    const users = await prisma.user.findMany({
      where: {
        upiId: {
          contains: upiId,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' })
    }

    res.json({ users })
  } catch (e) {
    console.log(e)
    res.status(500).json({ message: 'Something went wrong' })
  }
})

app.get(
  '/user/:upiId',
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

app.listen(process.env.PORT ?? 8000, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})
