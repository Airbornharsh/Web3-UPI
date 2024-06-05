'use client'
import React, { useEffect, useState } from 'react'
import idl from "../../../utils/config/idl.json"
import {
  Connection,
  PublicKey,
  SystemProgram,
  clusterApiUrl,
  Signer,
  Transaction,
  Keypair,
} from '@solana/web3.js'
import { web3, Program, AnchorProvider, Provider } from '@project-serum/anchor'
import { useCustomWallet } from '../../../context/CustomWalletContext'
import {
  AnchorWallet,
  useAnchorWallet,
  useWallet,
} from '@solana/wallet-adapter-react'
import { WalletType } from '@/utils/enum'
import { convertFormat2ToFormat1 } from '@/utils/idlConversion'

// const idl = convertFormat2ToFormat1()

if (
  typeof idl.metadata.address !== 'string' ||
  !PublicKey.isOnCurve(idl.metadata.address)
) {
  throw new Error('Invalid IDL address')
}

const programId = new PublicKey(idl.metadata.address)
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

const getUserKey = (walletKey: PublicKey) => {
  const userAccount = Keypair.fromSeed(
    new TextEncoder().encode(
      `${programId.toString().slice(0, 15)}__${walletKey
        .toString()
        .slice(0, 15)}`,
    ),
  )

  return userAccount
}

const Page = () => {
  const { signTransaction, signAllTransactions } = useWallet()
  const { publicKey, getPrivateKey, walletType } = useCustomWallet()
  const [provider, setProvider] = useState<Provider>()
  const [wallet, setWallet] = useState<any | null>()

  useEffect(() => {
    if (publicKey) {
      const wallet = {
        publicKey: new PublicKey(publicKey),
        signTransaction: async (t: Transaction) => {
          if (signTransaction === undefined)
            throw new Error('signTransaction is undefined')
          return await signTransaction(t)
        },
        signAllTransactions: async (t: Transaction[]) => {
          if (signAllTransactions === undefined)
            throw new Error('signAllTransactions is undefined')
          return await signAllTransactions(t)
        },
      }
      setWallet(wallet)
    }
  }, [publicKey, signTransaction, signAllTransactions])

  useEffect(() => {
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {})
      setProvider(provider)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, wallet])

  const getProgram = (provider: Provider) => {
    console.log('IDL:', idl)
    return new Program(JSON.parse(JSON.stringify(idl)), programId, provider)
  }

  if (typeof idl !== 'object' || idl === null) {
    throw new Error('Invalid IDL')
  }

  const initialize = async () => {
    try {
      // await getProgram(provider!).rpc.initialize(publicKey, {
      //   accounts: {
      //     state: new PublicKey(''),
      //     admin: publicKey,
      //     systemProgram: SystemProgram.programId,
      //   },
      //   signers: [getUserKey(new PublicKey(publicKey))],
      // })
      getProgram(provider!)
      console.log('Initialization successful')
    } catch (err) {
      console.log('Error initializing:', err)
    }
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🍭 Candy Drop</p>
          <p className="sub-text">NFT drop machine with fair mint</p>
          <button onClick={() => initialize()}>Initialize</button>
        </div>
      </div>
    </div>
  )
}

export default Page
