export interface User {
  walletAddress: string
  upiId: string
  name: string
}

export interface AuthFormData {
  [key: string]: string
  walletAddress: string
  upiId: string
  name: string
  pin: string
}
