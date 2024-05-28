'use client'
import React, { useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { Appbar } from '@/components/Appbar'
import { LoaderProvider } from '@/context/LoaderContext'
import { AuthProvider } from '@/context/AuthContext'
import ConnectWalletFirst from '@/components/ConnectWalletFirst'
import { RPC_URL } from '@/utils/config'
import {
  CustomWalletProvider,
  useCustomWallet,
} from '@/context/CustomWalletContext'

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
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network],
  )

  return (
    <LoaderProvider>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <CustomWalletProvider>
              <AuthProvider>
                <Appbar />
                <Children>{children}</Children>
              </AuthProvider>
            </CustomWalletProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </LoaderProvider>
  )
}

const Children: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const { publicKey } = useCustomWallet()
  return (
    <div className=" h-[calc(100vh-4rem)] w-[98vw] max-w-[80rem]">
      {publicKey ? children : <ConnectWalletFirst />}
    </div>
  )
}
