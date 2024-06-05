import { Router } from 'express'

const operationRouter = Router()

operationRouter.post('/deposit', async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Deposited',
      status: true,
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: 'Txn Error',
      status: false,
    })
  }
})

operationRouter.post('/withraw', async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Withrawed',
      status: true,
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      message: 'Txn Error',
      status: false,
    })
  }
})

export default operationRouter
