import { rateLimit } from 'express-rate-limit'

export const preAuthLimit = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
})

export const authLimit = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 20,
  message: 'Too many requests, please try again later.',
})
