import { PrismaClient } from '@prisma/client'
import { Router } from 'express'

const txnRouter = Router()

txnRouter.get(':upiId', async (req, res) => {
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

export default txnRouter
