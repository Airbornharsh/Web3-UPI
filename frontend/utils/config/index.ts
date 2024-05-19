export const RPC_URL = process.env.RPC_URL ?? 'https://api.devnet.solana.com'
export const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000'
export const NETWORK = process.env.NETWORK ?? 'devnet'
export const BASE_LAMPORTS = process.env.BASE_LAMPORTS
  ? parseInt(process.env.BASE_LAMPORTS)
  : 1000000000
