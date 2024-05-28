import { useCustomWallet } from '@/context/CustomWalletContext'
import React, { use } from 'react'

const PrivateWalletDisconnectButton = () => {
  const { disconnectPrivatWallet } = useCustomWallet()
  return (
    <div
      className="bg-primary hover:bg-primary-dark rounded p-2"
      style={{
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
