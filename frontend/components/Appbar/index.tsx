'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '@/utils/config'
import { useAuth } from '@/context/AuthContext'
import { Modal } from '@mui/material'
import AuthModal from '../ui/modals/AuthModal'
import BigScreenMenu from './BigScreenMenu'
import SmallScreenMenu from './SmallScreenMenu'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { WalletType } from '@/utils/enum'
import PrivateAuthModal from '../ui/modals/PrivateAuthModal'
import { useLoader } from '@/context/LoaderContext'

export const Appbar = () => {
  const { setIsLoading } = useLoader()
  const { publicKey, encodedPrivateKey, walletType } = useCustomWallet()
  const { isAuthenticated } = useAuth()
  const [openModal, setOpenModal] = useState(false)
  const [hasPrivateKey, setHasPrivateKey] = useState(false)

  // async function signAndSend() {
  //   if (!publicKey) {
  //     return
  //   }
  //   const message = new TextEncoder().encode('Made a request to sign in')
  //   const signature = await signMessage?.(message)
  //   const response = await axios.post(`${BACKEND_URL}/v1/user/signin`, {
  //     signature,
  //     publicKey: publicKey?.toString(),
  //   })

  //   localStorage.setItem('token', response.data.token)
  // }

  useEffect(() => {
    // signAndSend()
    if (!publicKey) {
      setOpenModal(false)
      setIsLoading(false)
    } else if (publicKey && !isAuthenticated) {
      setOpenModal(true)
    } else {
      setOpenModal(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, publicKey])

  useEffect(() => {
    if (
      walletType === WalletType.CUSTOM &&
      encodedPrivateKey &&
      !isAuthenticated
    ) {
      setOpenModal(true)
      setHasPrivateKey(true)
    } else {
      setOpenModal(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, encodedPrivateKey])

  return (
    <div className="flex h-16 items-center justify-between border-b pb-2 pt-2">
      <div className="flex justify-center pl-4 pt-3 text-2xl">WPI</div>
      {
        <>
          {/* <BigScreenMenu /> */}
          <SmallScreenMenu />
        </>
      }
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false)
        }}
      >
        {walletType === WalletType.DEFAULT ? (
          <AuthModal />
        ) : (
          <PrivateAuthModal havePrivateKey={true} />
        )}
      </Modal>
    </div>
  )
}
