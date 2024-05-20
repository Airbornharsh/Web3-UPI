'use client'
import React, { useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { Appbar } from '@/components/Appbar'
import { LoaderProvider } from '@/context/LoaderContext'
import Loader from '@/components/Loader'
import { AuthProvider } from '@/context/AuthContext'
import ConnectWalletFirst from '@/components/ConnectWalletFirst'
import { RPC_URL } from '@/utils/config'
import { CustomWalletProvider, useCustomWallet } from '@/context/CustomWalletContext'

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const wallets = useMemo(() => [], [network])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <LoaderProvider>
            <CustomWalletProvider>
              <AuthProvider>
                <Appbar />
                <Children>{children}</Children>
                <Loader />
              </AuthProvider>
            </CustomWalletProvider>
          </LoaderProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

const Children: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { publicKey } = useCustomWallet()
  return <>{publicKey ? children : <ConnectWalletFirst />}</>
}
