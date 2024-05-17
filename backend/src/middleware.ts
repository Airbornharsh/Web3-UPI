import { Request, NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] ?? ''
    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? '')
    // @ts-ignore
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
