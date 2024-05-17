'use client'
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '@/utils'
import { usePathname } from 'next/navigation'

export const Appbar = () => {
  const { publicKey, signMessage } = useWallet()
  const pathName = usePathname()
  console.log(pathName)

  async function signAndSend() {
    if (!publicKey) {
      return
    }
    const message = new TextEncoder().encode('Made a request to sign in')
    const signature = await signMessage?.(message)
    console.log(signature)
    console.log(publicKey)
    const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
      signature,
      publicKey: publicKey?.toString(),
    })

    localStorage.setItem('token', response.data.token)
  }

  useEffect(() => {
    signAndSend()
  }, [])

  return (
    <div className="flex justify-between border-b pb-2 pt-2 h-16">
      <div className="text-2xl pl-4 flex justify-center pt-3">WPI</div>
      <div className="text-xl pr-4 pb-2 flex items-center gap-2">
        <div className="text-sm">
          {publicKey?.toString().slice(0, 6)}...
          {publicKey?.toString().slice(-6)}
        </div>
        <div>
          {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />}
        </div>
      </div>
    </div>
  )
}
