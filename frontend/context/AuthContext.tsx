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
import { BACKEND_URL } from '@/utils/config'
import { useWallet } from '@solana/wallet-adapter-react'

interface AuthContextProps {
  token: string
  setToken: (token: string) => void
  isAuthenticated: boolean
  user: User | null
  setUser: (user: User) => void
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
  const { setIsLoading } = useLoader()

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
    }
  }

  useEffect(() => {
    if (token) {
      checkAuth()
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

  const contextValue: AuthContextProps = {
    token,
    setToken,
    isAuthenticated,
    user: user || null,
    setUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
