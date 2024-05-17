'use client'
import {
  BaseWalletConnectButton,
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '@/utils/config'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Modal } from '@mui/material'
import AuthModal from './AuthModal'

export const Appbar = () => {
  const { publicKey, signMessage,autoConnect } = useWallet()
  const pathName = usePathname()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [openModal, setOpenModal] = useState(false)

  async function signAndSend() {
    if (!publicKey) {
      return
    }
    const message = new TextEncoder().encode('Made a request to sign in')
    const signature = await signMessage?.(message)
    const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
      signature,
      publicKey: publicKey?.toString(),
    })

    localStorage.setItem('token', response.data.token)
  }

  useEffect(() => {
    // signAndSend()
    if (!publicKey) {
      setOpenModal(false)
    } else if (publicKey && !isAuthenticated) {
      setOpenModal(true)
    } else {
      setOpenModal(false)
    }
  }, [isAuthenticated, publicKey])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  return (
    <div className="flex justify-between border-b pb-2 pt-2 h-16 items-center">
      <div className="text-2xl pl-4 flex justify-center pt-3">WPI</div>
      <div className="">{user ? <p>{user.name}</p> : 'Connect First'}</div>
      <div className="text-xl pr-4 pb-2 flex items-center gap-2">
        {publicKey && (
          <div className="text-sm">
            {publicKey?.toString().slice(0, 6)}...
            {publicKey?.toString().slice(-6)}
          </div>
        )}
        <div>
          {publicKey ? <WalletDisconnectButton /> : <WalletMultiButton />}
        </div>
      </div>
      <Modal open={openModal}>
        <AuthModal />
      </Modal>
    </div>
  )
}
