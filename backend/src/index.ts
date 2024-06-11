import express from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import userRouter from './routes/user'
import txnRouter from './routes/txn'
import bodyParser from 'body-parser'
import solRouter from './routes/sol'
import operationRouter from './routes/operation'
import gamesRouter from './routes/games'

config()

const app = express()
app.set('trust proxy', 1);
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use('/v1/claim', solRouter)
app.use('/v1/user/', userRouter)
app.use('/v1/txn/', txnRouter)
app.use('/v1/operation/', operationRouter)
app.use('/v1/games/', gamesRouter)

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

app.listen(process.env.PORT ?? 8000, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})
