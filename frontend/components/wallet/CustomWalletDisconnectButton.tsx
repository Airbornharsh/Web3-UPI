import { useCustomWallet } from '@/context/CustomWalletContext'
import { Button } from '../ui/button'

const CustomWalletDisconnectButton = () => {
  const { disconnectPrivatWallet } = useCustomWallet()

  return (
    <Button
      onClick={disconnectPrivatWallet}
      variant={'outline'}
      className="w-full"
    >
      Disconnect
    </Button>
  )
}

export default CustomWalletDisconnectButton
