export interface User {
  walletAddress: string
  upiId: string
  name: string
  walletBalance: string
}

export interface AuthFormData {
  [key: string]: string
  walletAddress: string
  upiId: string
  name: string
  pin: string
}

export interface OperationType {
  id: number
  amount: string
  signature: string
  operation: 'WITHDRAW' | 'DEPOSIT' | 'PREDEPOSIT'
  toId: number
  to: OtherUserType
  fee: string
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: Date
}

export interface TransactionType {
  id: number
  senderId: number
  recieverId: number
  sender: OtherUserType
  receiver: OtherUserType
  amount: string
  signature: string
  wallet: 'WALLET1' | 'WALLET2'
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  operationTransactionId: number | null
  createdAt: Date
}

export interface OtherUserType {
  id: number
  walletAddress: string
  upiId: string
  name: string
}

export interface OperationQuery {
  page: number
  limit: number
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'ALL'
  order: 'asc' | 'desc'
  operation: 'DEPOSIT' | 'WITHDRAW' | 'ALL'
}

export interface TransactionQuery {
  page: number
  limit: number
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'ALL'
  order: 'asc' | 'desc'
}

export interface PageType {
  current: number
  total: number
  first: number
  last: number
}

export interface DiceGame {
  id: number
  betAmount: string
  winAmount: string
  win: boolean
  createdAt: Date
}
