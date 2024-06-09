import { Modal } from '@mui/material'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import PrivateAuthModal from '../ui/modals/PrivateAuthModal'
import { useState } from 'react'
import { Button } from '../ui/button'
import { useWallet } from '@solana/wallet-adapter-react'

const CustomWalletMultiButton = () => {
  const [openModal, setOpenModal] = useState(false)

  return (
    <div className="flex flex-col items-center gap-2">
      <WalletMultiButton
        style={{
          backgroundColor: '#19B784',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          height: '3rem',
          width: '60vw',
          maxWidth: '21rem',
          fontSize: '0.9rem',
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
      <Button onClick={() => setOpenModal(true)} className="w-full">
        Private Auth
      </Button>
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

