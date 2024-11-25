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

export const authParser = (url: string): any => {
  try {
    const params = new URLSearchParams(url.split('?')[1])
    const token = params.get('token')
    const userId = params.get('userId')
    const JWT_SECRET = process.env.JWT_SECRET ?? ''
    if (!token) {
      return null
    }
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (e) {
    console.log(e)
    return null
  }
}
