'use client'
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  AuthFormData,
  OperationQuery,
  OperationType,
  PageType,
  TransactionQuery,
  TransactionType,
  User,
} from '@/utils/types'
import { useLoader } from './LoaderContext'
import axios from 'axios'
import { BACKEND_URL, BASE_LAMPORTS, RPC_URL } from '@/utils/config'
import { useCustomWallet } from './CustomWalletContext'
import { WalletType } from '@/utils/enum'
import { dictToArray } from '@/utils/fn'

interface AuthContextProps {
  token: string
  setToken: (token: string) => void
  isAuthenticated: boolean
  user: User | null
  setUser: (user: User) => void
  balance: number
  updateBalance: () => void
  signIn: (formData: AuthFormData) => Promise<boolean>
  signUp: (formData: AuthFormData) => Promise<void>
  handleDeposit: (lamports: number, pin?: string) => Promise<void>
  handleWithdraw: (lamports: number) => Promise<void>
  transactions: {
    query: TransactionQuery
    data: TransactionType[]
    page: PageType
  }
  operations: {
    query: OperationQuery
    data: OperationType[]
    page: PageType
  }
  getTransactionsHandler: (query: TransactionQuery) => Promise<void>
  getOperationsHandler: (query: OperationQuery) => Promise<void>
  setTransactions: React.Dispatch<
    React.SetStateAction<{
      query: TransactionQuery
      data: TransactionType[]
      page: {
        total: number
        current: number
        last: number
        first: number
      }
    }>
  >
  setOperations: React.Dispatch<
    React.SetStateAction<{
      query: OperationQuery
      data: OperationType[]
      page: {
        total: number
        current: number
        last: number
        first: number
      }
    }>
  >
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('userAuth must be used within a AuthProvider')
  }

  return context
}

interface AuthContextProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  const { signMessage } = useWallet()
  const { publicKey, balance, updateBalance, walletType, depositBalance } =
    useCustomWallet()
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>()
  const [transactions, setTransactions] = useState<{
    query: TransactionQuery
    data: TransactionType[]
    page: {
      total: number
      current: number
      last: number
      first: number
    }
  }>({
    query: {
      page: 1,
      limit: 10,
      status: 'ALL',
      order: 'desc',
    },
    data: [],
    page: {
      total: 0,
      current: 1,
      last: 1,
      first: 1,
    },
  })
  const [operations, setOperations] = useState<{
    query: OperationQuery
    data: OperationType[]
    page: {
      total: number
      current: number
      last: number
      first: number
    }
  }>({
    query: {
      page: 1,
      limit: 10,
      status: 'ALL',
      order: 'desc',
      operation: 'ALL',
    },
    data: [],
    page: {
      total: 0,
      current: 1,
      last: 1,
      first: 1,
    },
  })
  const { setIsLoading, setErrorToastMessage, setToastMessage } = useLoader()

  const checkAuth = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${BACKEND_URL}/v1/user/check-auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const responseData = response.data
      if (responseData.userValid) {
        setUser(responseData.user)
        localStorage.setItem('user', JSON.stringify(responseData.user))
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        localStorage.removeItem('user')
        setUser(null)
      }
    } catch (e: any) {
      console.log(e)
      if (e.response.data.message) setErrorToastMessage(e.response.data.message)
      else setErrorToastMessage('Something went wrong')
      setUser(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      setUser(JSON.parse(user))
    }
  }, [])

  useEffect(() => {
    if (token) {
      checkAuth()
    } else {
      setIsAuthenticated(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    const tempToken = localStorage.getItem('token')
    if (tempToken) {
      setToken(tempToken)
    }
  }, [])

  useEffect(() => {
    if (!publicKey) {
      setIsAuthenticated(false)
    }
  }, [publicKey])

  useEffect(() => {
    if (!isAuthenticated) {
      setToken('')
      setUser(null)
    }
  }, [isAuthenticated])

  useEffect(() => {
    updateBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, isAuthenticated])

  // useEffect(() => {
  //   setInterval(() => {
  //     updateBalance()
  //   }, 5000)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  const signMessageHandler = async () => {
    const message = new TextEncoder().encode('Sign in request from WPI')
    if (walletType === WalletType.DEFAULT) {
      if (!publicKey) {
        return new Uint8Array()
      }
      const signature = await signMessage?.(message)
      return new Uint8Array(signature!)
    } else {
      return null
    }
  }

  const signIn = async (formData: AuthFormData) => {
    setIsLoading(true)
    try {
      const signature = await signMessageHandler()
      const response = await axios.post(`${BACKEND_URL}/v1/user/sign-in`, {
        walletAddress: formData.walletAddress,
        pin: formData.pin,
        signature: dictToArray(signature),
        walletType,
      })
      const responseData = response.data
      if (responseData.userExists) {
        const token = responseData.token
        localStorage.setItem('token', token)
        setToken(token)
        return true
      } else {
        return false
      }
    } catch (e: any) {
      console.log(e)
      if (e.response.data.message) setErrorToastMessage(e.response.data.message)
      else setErrorToastMessage('Something went wrong')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (formData: AuthFormData) => {
    setIsLoading(true)
    try {
      const signature = await signMessageHandler()
      const response = await axios.post(`${BACKEND_URL}/v1/user/create-user`, {
        name: formData.name,
        walletAddress: formData.walletAddress,
        upiId: formData.upiId,
        pin: formData.pin,
        signature: dictToArray(signature),
        walletType,
      })
      const token = response.data.token
      localStorage.setItem('token', token)
      setToken(token)
    } catch (e: any) {
      console.log(e)
      if (e.response.data.message) setErrorToastMessage(e.response.data.message)
      else setErrorToastMessage('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeposit = async (lamports: number, pin?: string) => {
    setIsLoading(true)
    try {
      const preDepositResponse = await axios.post(
        `${BACKEND_URL}/v1/operation/pre-deposit`,
        {
          lamports,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      const preDepositData = preDepositResponse.data
      if (!preDepositData.status) {
        throw new Error('Invalid Pre-Deposit')
      }
      const signature = await depositBalance(lamports, pin)
      if (!signature) {
        throw new Error('Invalid Signature')
      }
      const response = await axios.post(
        `${BACKEND_URL}/v1/operation/deposit`,
        {
          lamports,
          operationTransactionId: preDepositData.operation.id,
          signature: signature,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      const responseData = response.data
      if (responseData.status) {
        setUser(responseData.user)
        localStorage.setItem('user', JSON.stringify(responseData.user))
        updateBalance()
        setToastMessage('Deposited')
      } else {
        setErrorToastMessage('Error')
      }
    } catch (e: any) {
      console.log(e)
      if (e.response.data.message) setErrorToastMessage(e.response.data.message)
      else setErrorToastMessage('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async (lamports: number, pin?: string) => {
    setIsLoading(true)
    try {
      const response = await axios.post(
        `${BACKEND_URL}/v1/operation/withdraw`,
        {
          lamports,
          pin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      const responseData = response.data
      if (responseData.status) {
        setUser(responseData.user)
        localStorage.setItem('user', JSON.stringify(responseData.user))
        updateBalance()
        setToastMessage('Withdrawed')
      } else {
        setErrorToastMessage('Error')
      }
    } catch (e: any) {
      console.log(e)
      if (e.response.data.message) setErrorToastMessage(e.response.data.message)
      else setErrorToastMessage('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) getTransactionsHandler()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, transactions.query])

  useEffect(() => {
    if (isAuthenticated) getOperationsHandler()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, operations.query])

  const getTransactionsHandler = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `${BACKEND_URL}/v1/txn/history?page=${transactions.query.page}&limit=${transactions.query.limit}&status=${transactions.query.status}&order=${transactions.query.order}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      const responseData = response.data
      setTransactions((prev) => {
        return {
          ...prev,
          data: responseData.transactions,
          page: {
            total: responseData.totalPages,
            current: responseData.currentPage,
            last: responseData.lastPage,
            first: responseData.firstPage,
          },
        }
      })
    } catch (e: any) {
      console.log(e)
      if (e.response.data.message) setErrorToastMessage(e.response.data.message)
      else setErrorToastMessage('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const getOperationsHandler = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `${BACKEND_URL}/v1/operation/history?page=${operations.query.page}&limit=${operations.query.limit}&status=${operations.query.status}&order=${operations.query.order}&operation=${operations.query.operation}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      const responseData = response.data
      setOperations((prev) => {
        return {
          ...prev,
          data: responseData.transactions,
          page: {
            total: responseData.totalPages,
            current: responseData.currentPage,
            last: responseData.lastPage,
            first: responseData.firstPage,
          },
        }
      })
    } catch (e: any) {
      console.log(e)
      if (e.response.data.message) setErrorToastMessage(e.response.data.message)
      else setErrorToastMessage('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: AuthContextProps = {
    token,
    setToken,
    isAuthenticated,
    user: user || null,
    setUser,
    balance,
    updateBalance,
    signIn,
    signUp,
    handleDeposit,
    handleWithdraw,
    operations,
    transactions,
    getOperationsHandler,
    getTransactionsHandler,
    setOperations,
    setTransactions,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      {/* <OperationModal /> */}
    </AuthContext.Provider>
  )
}
