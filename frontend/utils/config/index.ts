export const RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://api.devnet.solana.com'
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'devnet'
export const BASE_LAMPORTS = process.env.NEXT_PUBLIC_BASE_LAMPORTS
  ? parseInt(process.env.NEXT_PUBLIC_BASE_LAMPORTS)
  : 1000000000
export const URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
