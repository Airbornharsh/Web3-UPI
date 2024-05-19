import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

const ConnectWalletFirst = () => {
  return (
    <div className="flex justify-center items-center h-32 flex-col gap-1">
      <h1>Connect Wallet First</h1>
      <WalletMultiButton />
    </div>
  )
}

export default ConnectWalletFirst
