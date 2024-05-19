import { WalletDisconnectButton } from '@solana/wallet-adapter-react-ui'

const CustomWalletDisconnectButton = () => {
  return (
    <WalletDisconnectButton
      style={{
        backgroundColor: 'rgb(14 116 144)',
        color: 'white',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: 'pointer',
      }}
    />
  )
}

export default CustomWalletDisconnectButton
