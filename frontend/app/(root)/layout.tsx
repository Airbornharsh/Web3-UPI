'use client'
import React, { FC, useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { Appbar } from '@/components/Appbar'
import { LoaderProvider } from '@/context/LoaderContext'
import Loader from '@/components/Loader'
import { AuthProvider } from '@/context/AuthContext'
import ConnectWalletFirst from '@/components/ConnectWalletFirst'
import { RPC_URL } from '@/utils/config'

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css')

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const network = WalletAdapterNetwork.Mainnet

  // You can also provide a custom RPC endpoint.
  const endpoint = RPC_URL ?? ''

  const wallets = useMemo(() => [], [network])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <LoaderProvider>
            <AuthProvider>
              <Appbar />
              <Children>{children}</Children>
              <Loader />
            </AuthProvider>
          </LoaderProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

const Children: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { publicKey } = useWallet()
  return <>{publicKey ? children : <ConnectWalletFirst />}</>
}
