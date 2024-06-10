'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Modal } from '@mui/material'
import AuthModal from '../ui/modals/AuthModal'
import GitHubIcon from '@mui/icons-material/GitHub'
import SmallScreenMenu from './SmallScreenMenu'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { WalletType } from '@/utils/enum'
import PrivateAuthModal from '../ui/modals/PrivateAuthModal'
import { useLoader } from '@/context/LoaderContext'
import Link from 'next/link'
import { BASE_LAMPORTS, NETWORK } from '@/utils/config'
import { Card } from '../ui/card'

export const Appbar = () => {
  const { setIsLoading } = useLoader()
  const { disconnect } = useWallet()
  const { publicKey, encodedPrivateKey, walletType, disconnectPrivatWallet } =
    useCustomWallet()
  const { isAuthenticated, user } = useAuth()
  const [openModal, setOpenModal] = useState(false)
  const [hasPrivateKey, setHasPrivateKey] = useState(false)

  useEffect(() => {
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

  // useEffect(() => {
  //   if (openModal === false) {
  //     disconnect().then(() => {
  //       disconnectPrivatWallet()
  //     })
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [openModal])

  return (
    <div className="bg-secondary flex h-16 w-screen justify-center border-b">
      <div className="relative flex w-[98vw] max-w-[80rem] items-center justify-between pb-2 pt-2">
        <div className="text-color3 flex items-end justify-center pl-4 pt-3 text-2xl">
          <span>WPI </span>
          <span className="pb-1 text-sm">({NETWORK})</span>
        </div>
        {
          <div className="flex items-center gap-1">
            {/* <BigScreenMenu /> */}
            <Link
              href="https://github.com/airbornharsh/web3-upi"
              target="_blank"
            >
              <GitHubIcon className="text-color3 cursor-pointer opacity-50 hover:opacity-100" />
            </Link>
            {isAuthenticated && (
              <div className="flex items-center gap-1">
                <Card className="text-color3 p-2 text-sm text-gray-500">
                  {(parseInt(user?.walletBalance!) / BASE_LAMPORTS).toFixed(4)}{' '}
                  SOL
                </Card>
              </div>
            )}
            <SmallScreenMenu />
          </div>
        }
        <Modal
          open={openModal}
          onClose={() => {
            setOpenModal(false)
          }}
        >
          {walletType === WalletType.DEFAULT ? (
            <AuthModal setOpenModal={setOpenModal} />
          ) : (
            <PrivateAuthModal
              havePrivateKey={hasPrivateKey}
              setOpenModal={setOpenModal}
            />
          )}
        </Modal>
      </div>
    </div>
  )
}
