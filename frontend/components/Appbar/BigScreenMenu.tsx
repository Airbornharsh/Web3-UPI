'use client'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import CustomWalletDisconnectButton from '../wallet/CustomWalletDisconnectButton'
import CustomWalletMultiButton from '../wallet/CustomWalletMultiButton'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAuth } from '@/context/AuthContext'

const BigScreenMenu = () => {
  const { publicKey } = useWallet()
  const { balance, updateBalance } = useAuth()

  return (
    <div className=" hidden items-center gap-2 pb-2 pr-4 text-xl sm:flex">
      <div className="flex flex-col">
        {publicKey && (
          <span className="text-sm">
            {publicKey?.toString().slice(0, 6)}...
            {publicKey?.toString().slice(-6)}
          </span>
        )}
        {balance ? (
          <>
            <span className="flex items-center text-xs">
              <span>{balance} SOL</span>
              <span
                className="cursor-pointer text-blue-500 hover:text-blue-700"
                onClick={updateBalance}
              >
                <AutorenewIcon className="scale-75" />
              </span>
            </span>
          </>
        ) : null}
      </div>
      <div>
        {publicKey ? (
          <CustomWalletDisconnectButton />
        ) : (
          <CustomWalletMultiButton />
        )}
      </div>
    </div>
  )
}

export default BigScreenMenu
