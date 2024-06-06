import {
  Connection,
  LAMPORTS_PER_SOL,
  VersionedTransactionResponse,
} from '@solana/web3.js'
import { RPC_URL } from '../config'

const connection = new Connection(RPC_URL ?? '')

async function getTransactionWithRetry(
  signature: string,
  options: { maxSupportedTransactionVersion: number },
  maxRetries: number = 8,
): Promise<VersionedTransactionResponse | null> {
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
  let attempt = 0
  let delay = 5000

  while (attempt < maxRetries) {
    try {
      const transaction = await connection.getTransaction(signature, options)
      if (transaction) {
        return transaction
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error)
    }

    attempt++
    await wait(delay)
    delay *= 2
  }

  throw new Error(`Failed to fetch transaction after ${maxRetries} attempts`)
}

const calculateTransactionFee = async (
  transactionCount: number = 1,
): Promise<number> => {
  const feeCalculator = await connection.getRecentBlockhash()
  const lamportsPerSignature = feeCalculator.feeCalculator.lamportsPerSignature

  const totalFeeLamports = lamportsPerSignature * transactionCount
  const totalFeeSOL = totalFeeLamports / LAMPORTS_PER_SOL

  return totalFeeSOL
}

export { getTransactionWithRetry, calculateTransactionFee }
