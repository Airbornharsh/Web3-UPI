import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { useLoader } from './LoaderContext'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { BASE_LAMPORTS } from '@/utils/config'

enum WalletType {
  CUSTOM = 'custom',
  DEFAULT = 'default',
}

interface CustomWalletContextProps {
  publicKey: string
  walletType: WalletType
  setWalletType: (type: WalletType) => void
  sendToken: (recieverAddress: string, lamports: number) => Promise<string>
  balance: number
  updateBalance: () => void
}

const CustomWalletContext = createContext<CustomWalletContextProps | undefined>(
  undefined,
)

export const useCustomWallet = () => {
  const context = useContext(CustomWalletContext)

  if (!context) {
    throw new Error(
      'userCustomWallet must be used within a CustomWalletProvider',
    )
  }

  return context
}

interface CustomWalletContextProviderProps {
  children: ReactNode
}

export const CustomWalletProvider: React.FC<
  CustomWalletContextProviderProps
> = ({ children }) => {
  const { connection } = useConnection()
  const { publicKey, wallet, sendTransaction } = useWallet()
  const { setIsLoading } = useLoader()
  const [privateKey, setPrivateKey] = useState<string>('')
  const [storedPublicKey, setStoredPublicKey] = useState<string>(
    publicKey ? publicKey.toString() : '',
  )
  const [balance, setBalance] = useState<number>(0)
  const [walletType, setWalletType] = useState<WalletType>(
    publicKey ? WalletType.DEFAULT : WalletType.CUSTOM,
  )

  useEffect(() => {
    const storedPrivateKey = localStorage.getItem('privateKey')
    if (storedPrivateKey) {
      setPrivateKey(storedPrivateKey)
    }
  }, [])

  useEffect(() => {
    if (publicKey) {
      setStoredPublicKey(publicKey.toString())
    }
  }, [publicKey])

  const setWalletTypeFn = (type: WalletType) => {
    setWalletType(type)
  }

  const sendToken = async (recieverAddress: string, lamports: number) => {
    setIsLoading(true)
    let signature = ''
    try {
      const txn = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey!,
          toPubkey: new PublicKey(recieverAddress),
          lamports,
        }),
      )
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext()
      signature = await sendTransaction(txn, connection, {
        minContextSlot,
      })
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      })
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
      return signature
    }
  }

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

  const contextValue: CustomWalletContextProps = {
    publicKey: storedPublicKey,
    setWalletType: setWalletTypeFn,
    walletType,
    sendToken,
    balance,
    updateBalance,
  }

  return (
    <CustomWalletContext.Provider value={contextValue}>
      {children}
    </CustomWalletContext.Provider>
  )
}
