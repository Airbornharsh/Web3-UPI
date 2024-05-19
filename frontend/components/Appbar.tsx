'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '@/utils/config'
import { useAuth } from '@/context/AuthContext'
import { Modal } from '@mui/material'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import AuthModal from './AuthModal'
import CustomWalletDisconnectButton from './wallet/CustomWalletDisconnectButton'
import CustomWalletMultiButton from './wallet/CustomWalletMultiButton'

export const Appbar = () => {
  const { publicKey, signMessage } = useWallet()
  const { isAuthenticated, balance, updateBalance } = useAuth()
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
      localStorage.removeItem('token')
    } else if (publicKey && !isAuthenticated) {
      setOpenModal(true)
    } else {
      setOpenModal(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, publicKey])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  return (
    <div className="flex h-16 items-center justify-between border-b pb-2 pt-2">
      <div className="flex justify-center pl-4 pt-3 text-2xl">WPI</div>
      <div className="flex items-center gap-2 pb-2 pr-4 text-xl">
        <div className="flex flex-col">
          {publicKey && (
            <span className="text-sm">
              {publicKey?.toString().slice(0, 6)}...
              {publicKey?.toString().slice(-6)}
            </span>
          )}
          {balance ? (
            <>
              <span className="flex items-center text-xs">
                <span>{balance} SOL</span>
                <span className="cursor-pointer" onClick={updateBalance}>
                  <AutorenewIcon className="scale-75" />
                </span>
              </span>
            </>
          ) : null}
        </div>
        <div>
          {publicKey ? (
            <CustomWalletDisconnectButton />
          ) : (
            <CustomWalletMultiButton />
          )}
        </div>
      </div>
      <Modal open={openModal}>
        <AuthModal />
      </Modal>
    </div>
  )
}
