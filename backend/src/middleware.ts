import { Request, NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] ?? ''
    const JWT_SECRET = process.env.JWT_SECRET ?? ''
    if (!token) {
      next()
      return
    }
    const decoded = jwt.verify(token, JWT_SECRET)
    res.locals.user = decoded ?? null
  } catch (e) {
    console.log(e)
  } finally {
    next()
  }
}
