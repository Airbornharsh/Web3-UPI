import { useCustomWallet } from '@/context/CustomWalletContext'
import React, { use } from 'react'
import { Button } from '../ui/button'

const PrivateWalletDisconnectButton = () => {
  const { disconnectPrivatWallet } = useCustomWallet()
  return (
    <Button onClick={disconnectPrivatWallet} variant={'outline'} className='w-full'>
      Disconnect
    </Button>
  )
}

export default PrivateWalletDisconnectButton
