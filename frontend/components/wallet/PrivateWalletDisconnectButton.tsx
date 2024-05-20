import { useCustomWallet } from '@/context/CustomWalletContext'
import React, { use } from 'react'

const PrivateWalletDisconnectButton = () => {
  const { disconnectPrivatWallet } = useCustomWallet()
  return (
    <div
      style={{
        backgroundColor: 'rgb(14 116 144)',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: 'pointer',
      }}
      onClick={disconnectPrivatWallet}
    >
      Disconnect
    </div>
  )
}

export default PrivateWalletDisconnectButton
