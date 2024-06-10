import web3 from '@solana/web3.js'
import base58 from 'bs58'

export const RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com'
export const NETWORK = process.env.NETWORK || 'devnet'
export const PRIVATE_KEY = process.env.PRIVATE_KEY || ''
export const VAULT_PRIVATE_KEY = process.env.VAULT_PRIVATE_KEY || ''
export const BASE_LAMPORTS = 1000000000
export const CONVENIENCE_FEE_PERCENTAGE = process.env.CONVENIENCE_FEE_PERCENTAGE
  ? parseInt(process.env.CONVENIENCE_FEE_PERCENTAGE)
  : 0.1

export const VAULT_WALLET = (): {
  publicKey: web3.PublicKey
  secretKey: Uint8Array
} => {
  const wallet = web3.Keypair.fromSecretKey(base58.decode(VAULT_PRIVATE_KEY))
  return wallet
}
export const DICE_MULTIPLIER = process.env.DICE_MULTIPLIER
  ? parseInt(process.env.DICE_MULTIPLIER)
  : 98

export const connection = new web3.Connection(RPC_URL)
