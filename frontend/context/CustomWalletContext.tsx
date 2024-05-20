import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Keypair, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { BASE_LAMPORTS } from '@/utils/config'
import { WalletType } from '@/utils/enum'
import base58 from 'bs58'
import { decryptMessage, encryptMessage } from '@/utils/encrypt'

interface CustomWalletContextProps {
  publicKey: string
  walletType: WalletType
  setWalletType: (type: WalletType) => void
  sendToken: (recieverAddress: string, lamports: number) => Promise<string>
  balance: number
  updateBalance: () => void
  encodePrivateKey: (privateKey: string, pin: string) => string | null
  decodePrivateKey: (pin: string) => Keypair | null
  getPublicKeyFromPrivateKey: (privateKey: string) => string | null
  disconnectPrivatWallet: () => void
  encodedPrivateKey: string
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
  const [encodedPrivateKey, setEncodedPrivateKey] = useState<string>('')
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
      setEncodedPrivateKey(storedPrivateKey)
    }
  }, [])

  useEffect(() => {
    if (publicKey) {
      setStoredPublicKey(publicKey.toString())
      setWalletType(WalletType.DEFAULT)
    } else {
      setWalletType(WalletType.CUSTOM)
    }
  }, [publicKey])

  const setWalletTypeFn = (type: WalletType) => {
    setWalletType(type)
  }

  const getPublicKeyFromPrivateKey = (privateKey: string) => {
    try {
      const wallet = Keypair.fromSecretKey(base58.decode(privateKey))
      return wallet.publicKey.toString()
    } catch (e) {
      console.log(e)
      return null
    }
  }

  const encodePrivateKey = (privateKey: string, pin: string) => {
    try {
      const wallet = Keypair.fromSecretKey(base58.decode(privateKey))
      setStoredPublicKey(wallet.publicKey.toString())
      const encodedPrivateKey = encryptMessage(privateKey, pin)
      setEncodedPrivateKey(encodedPrivateKey)
      localStorage.setItem('privateKey', encodedPrivateKey)
      return wallet.publicKey.toString()
    } catch (e) {
      console.log(e)
      return null
    }
  }

  const decodePrivateKey = (pin: string) => {
    try {
      const decodedPrivateKey = decryptMessage(encodedPrivateKey, pin)
      const wallet = Keypair.fromSecretKey(base58.decode(decodedPrivateKey))
      setStoredPublicKey(wallet.publicKey.toString())
      return wallet
    } catch (e) {
      console.log(e)
      return null
    }
  }

  const sendToken = async (
    recieverAddress: string,
    lamports: number,
    pin?: string,
  ) => {
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
      return signature
    }
  }

  const updateBalance = async () => {
    try {
      if (!storedPublicKey) {
        setBalance(0)
      }
      const response = await connection.getBalance(
        new PublicKey(storedPublicKey),
      )
      if (response) {
        setBalance(response / BASE_LAMPORTS)
      }
    } catch (e) {
      console.log(e)
      setBalance(0)
    }
  }

  const disconnectPrivatWallet = () => {
    localStorage.removeItem('privateKey')
    localStorage.removeItem('token')
    setEncodedPrivateKey('')
    setStoredPublicKey('')
  }

  const contextValue: CustomWalletContextProps = {
    publicKey: storedPublicKey,
    setWalletType: setWalletTypeFn,
    walletType,
    sendToken,
    balance,
    updateBalance,
    encodePrivateKey,
    decodePrivateKey,
    getPublicKeyFromPrivateKey,
    disconnectPrivatWallet,
    encodedPrivateKey,
  }

  return (
    <CustomWalletContext.Provider value={contextValue}>
      {children}
    </CustomWalletContext.Provider>
  )
}
