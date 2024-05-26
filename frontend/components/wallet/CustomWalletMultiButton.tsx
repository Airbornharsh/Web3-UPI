import { useCustomWallet } from '@/context/CustomWalletContext'
import { WalletType } from '@/utils/enum'
import { Modal } from '@mui/material'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import PrivateAuthModal from '../ui/modals/PrivateAuthModal'
import { useState } from 'react'

const CustomWalletMultiButton = () => {
  const [openModal, setOpenModal] = useState(false)

  return (
    <div className="flex flex-col items-center gap-2">
      <WalletMultiButton
        style={{
          backgroundColor: 'rgb(14 116 144)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
        }}
      />
      <div className="text-base">
        <button
          onClick={() => setOpenModal(true)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
        >
          Private Auth
        </button>
      </div>
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false)
        }}
      >
        <PrivateAuthModal havePrivateKey={false} />
      </Modal>
    </div>
  )
}

export default CustomWalletMultiButton
