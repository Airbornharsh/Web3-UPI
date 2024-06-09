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
  to: string
  fee: string
  status: Status
  createdAt: Date
}

export interface TransactionType {
  id: number
  senderId: number | OtherUserType
  recieverId: number | OtherUserType
  amount: string
  signature: string
  wallet: 'WALLET1' | 'WALLET2'
  status: Status
  operationTransactionId: number | null
  createdAt: Date
}

export enum Status {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface OtherUserType {
  id: number
  walletAddress: string
  upiId: string
  name: string
}
