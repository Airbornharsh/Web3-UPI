'use client'
import React, { FC, useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { Appbar } from '@/components/Appbar'
import { LoaderProvider } from '@/context/LoaderContext'
import Loader from '@/components/Loader'
import { AuthProvider } from '@/context/AuthContext'

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css')

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const network = WalletAdapterNetwork.Mainnet

  // You can also provide a custom RPC endpoint.
  const endpoint = 'https://api.devnet.solana.com'

  const wallets = useMemo(() => [], [network])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <LoaderProvider>
            <AuthProvider>
              <Appbar />
              {children}
              <Loader />
            </AuthProvider>
          </LoaderProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
