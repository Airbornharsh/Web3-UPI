import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const CustomWalletMultiButton = () => {
  return (
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
  )
}

export default CustomWalletMultiButton