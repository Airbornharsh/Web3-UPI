import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const ConnectWalletFirst = () => {
  return (
    <div className="flex h-32 flex-col items-center justify-center gap-1">
      <h1>Connect Wallet First</h1>
      <WalletMultiButton />
    </div>
  )
}

export default ConnectWalletFirst
