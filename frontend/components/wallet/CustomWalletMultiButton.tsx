import { useCustomWallet } from '@/context/CustomWalletContext'
import { WalletType } from '@/utils/enum'
import { Modal } from '@mui/material'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import PrivateAuthModal from '../ui/modals/PrivateAuthModal'
import { useState } from 'react'
import { Button } from '../ui/button'

const CustomWalletMultiButton = () => {
  const [openModal, setOpenModal] = useState(false)

  return (
    <div className="flex flex-col items-center gap-2">
      <WalletMultiButton
        style={{
          backgroundColor: '#19B784',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
        }}
      />
      <div className="text-base">
        <Button
          onClick={() => setOpenModal(true)}
          variant={'outline'}
          className="w-full text-primary"
        >
          Private Auth
        </Button>
      </div>
      <Modal
        open={openModal}
        onClose={() => {
          setOpenModal(false)
        }}
      >
        <PrivateAuthModal havePrivateKey={false} setOpenModal={setOpenModal} />
      </Modal>
    </div>
  )
}

export default CustomWalletMultiButton
