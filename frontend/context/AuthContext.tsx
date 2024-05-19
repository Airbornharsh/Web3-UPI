'use client'
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { User } from '@/utils/types'
import { useLoader } from './LoaderContext'
import axios from 'axios'
import { BACKEND_URL, BASE_LAMPORTS, RPC_URL } from '@/utils/config'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection } from '@solana/web3.js'

const connection = new Connection(RPC_URL)

interface AuthContextProps {
  token: string
  setToken: (token: string) => void
  isAuthenticated: boolean
  user: User | null
  setUser: (user: User) => void
  balance: number
  updateBalance: () => void
  isAuthChecked: boolean
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
  const { publicKey } = useWallet()
  const [token, setToken] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>()
  const [balance, setBalance] = useState<number>(0)
  const [isAuthChecked, setIsAuthChecked] = useState(false)
  const { setIsLoading } = useLoader()

  const checkAuth = async () => {
    setIsLoading(true)
    setIsAuthChecked(false)
    try {
      const response = await axios.get(`${BACKEND_URL}/v1/user/check-auth`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const responseData = response.data
      if (responseData.userValid) {
        setUser(responseData.user)
        setIsAuthenticated(true)
      } else {
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (e) {
      console.log(e)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
      setIsAuthChecked(true)
    }
  }

  useEffect(() => {
    checkAuth()
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

  const updateBalance = async () => {
    setIsLoading(true)
    try {
      if (!publicKey) {
        throw new Error('Public key not found')
      }
      const response = await connection.getBalance(publicKey)
      if (response) {
        setBalance(response / BASE_LAMPORTS)
      }
    } catch (e) {
      console.log(e)
      setBalance(0)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    updateBalance()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey, isAuthenticated])

  useEffect(() => {
    const tempToken = localStorage.getItem('token')
    setToken(tempToken || '')
  }, [])

  // useEffect(() => {
  //   setInterval(() => {
  //     updateBalance()
  //   }, 5000)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  const contextValue: AuthContextProps = {
    token,
    setToken,
    isAuthenticated,
    user: user || null,
    setUser,
    balance,
    updateBalance,
    isAuthChecked,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
