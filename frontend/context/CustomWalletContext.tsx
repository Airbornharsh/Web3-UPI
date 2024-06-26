import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  Message,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { BASE_LAMPORTS, VAULT_ADDRESS } from '@/utils/config'
import { WalletType } from '@/utils/enum'
import base58 from 'bs58'
import { decryptMessage, encryptMessage } from '@/utils/encrypt'
import axios from 'axios'

interface CustomWalletContextProps {
  publicKey: string
  walletType: WalletType
  setWalletType: (type: WalletType) => void
  sendToken: (
    recieverAddress: string,
    lamports: number,
    pin?: string,
  ) => Promise<string>
  balance: number
  updateBalance: () => void
  encodePrivateKey: (privateKey: string, pin: string) => string | null
  decodePrivateKey: (pin: string) => Keypair | null
  getPublicKeyFromPrivateKey: (privateKey: string) => string | null
  disconnectPrivatWallet: () => void
  encodedPrivateKey: string
  solPrice: number
  getSolPrice: () => void
  depositBalance: (lamports: number, pin?: string) => Promise<string>
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
  const { publicKey, wallet, sendTransaction, disconnect } = useWallet()
  const [encodedPrivateKey, setEncodedPrivateKey] = useState<string>('')
  const [storedPublicKey, setStoredPublicKey] = useState<string>(
    publicKey ? publicKey.toString() : '',
  )
  const [balance, setBalance] = useState<number>(0)
  const [walletType, setWalletType] = useState<WalletType>(
    publicKey ? WalletType.DEFAULT : WalletType.CUSTOM,
  )
  const [solPrice, setSolPrice] = useState<number>(0)

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

  useEffect(() => {
    getSolPrice()
  }, [])

  const getSolPrice = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      )
      if (response.data.solana.usd) {
        setSolPrice(response.data.solana.usd)
      }
    } catch (e: any) {
      console.log(e)
    }
  }

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

  // TODO: Implement Pin ASK
  const sendToken = async (
    recieverAddress: string,
    lamports: number,
    pin?: string,
  ) => {
    let signature = ''
    pin = pin || ''
    try {
      if (walletType === WalletType.CUSTOM && !pin) {
        throw new Error('Pin is required for custom wallet')
      }
      if (walletType === WalletType.CUSTOM && encodedPrivateKey && pin) {
        const wallet = decodePrivateKey(pin)
        if (!wallet) {
          throw new Error('Invalid pin')
        }
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(recieverAddress),
            lamports,
          }),
        )
        signature = await sendAndConfirmTransaction(connection, transaction, [
          wallet,
        ])
        // signature = await connection.sendTransaction(transaction, [wallet])
      } else if (walletType === WalletType.DEFAULT) {
        if (wallet) {
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
        }
      }
    } catch (e) {
      console.log(e)
    } finally {
    }
    return signature
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
      setBalance(0)
    }
  }

  const depositBalance = async (lamports: number, pin?: string) => {
    let signature = ''
    try {
      if (walletType === WalletType.CUSTOM && !pin) {
        throw new Error('Pin is required for custom wallet')
      }
      if (!VAULT_ADDRESS) {
        throw new Error('Vault address is not available')
      }
      if (walletType === WalletType.CUSTOM && encodedPrivateKey && pin) {
        const wallet = decodePrivateKey(pin)
        if (!wallet) {
          throw new Error('Invalid pin')
        }
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(VAULT_ADDRESS),
            lamports,
          }),
        )
        // signature = await sendAndConfirmTransaction(connection, transaction, [
        //   wallet,
        // ])
        signature = await connection.sendTransaction(transaction, [wallet])
      } else if (walletType === WalletType.DEFAULT) {
        if (wallet) {
          const txn = new Transaction().add(
            SystemProgram.transfer({
              fromPubkey: publicKey!,
              toPubkey: new PublicKey(VAULT_ADDRESS),
              lamports,
            }),
          )
          const {
            context: { slot: minContextSlot },
            value: { blockhash, lastValidBlockHeight },
          } = await connection.getLatestBlockhashAndContext()
          console.log('Check 1')
          signature = await sendTransaction(txn, connection, {
            minContextSlot,
          })
          console.log('Check 2')
          await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature,
          })
          console.log('Check 3')
        }
      }
    } catch (e) {
      console.log(e)
    }
    return signature
  }

  const disconnectPrivatWallet = () => {
    disconnect()
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
    solPrice,
    getSolPrice,
    depositBalance,
  }

  return (
    <CustomWalletContext.Provider value={contextValue}>
      {children}
    </CustomWalletContext.Provider>
  )
}
