import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { RPC_URL } from './config'

const connection = new Connection(RPC_URL ?? '')

export const calculateTransactionFee = async (
  transactionCount: number = 1,
): Promise<number> => {
  const feeCalculator = await connection.getRecentBlockhash()
  const lamportsPerSignature = feeCalculator.feeCalculator.lamportsPerSignature

  const totalFeeLamports = lamportsPerSignature * transactionCount
  const totalFeeSOL = totalFeeLamports / LAMPORTS_PER_SOL

  return totalFeeSOL
}
