import { useCustomWallet } from '@/context/CustomWalletContext'
import { WalletType } from '@/utils/enum'
import { WalletDisconnectButton } from '@solana/wallet-adapter-react-ui'
import PrivateWalletDisconnectButton from './PrivateWalletDisconnectButton'

const CustomWalletDisconnectButton = () => {
  const { walletType } = useCustomWallet()
  return (
    <>
      {walletType === WalletType.CUSTOM ? (
        <>
          <PrivateWalletDisconnectButton />
        </>
      ) : (
        <>
          <WalletDisconnectButton
            style={{
              backgroundColor: '#19B784',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        </>
      )}
    </>
  )
}

export default CustomWalletDisconnectButton
