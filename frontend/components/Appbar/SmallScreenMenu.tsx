import AutorenewIcon from '@mui/icons-material/Autorenew'
import CustomWalletDisconnectButton from '../wallet/CustomWalletDisconnectButton'
import CustomWalletMultiButton from '../wallet/CustomWalletMultiButton'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import Hamburger from 'hamburger-react'
import { useCustomWallet } from '@/context/CustomWalletContext'

const SmallScreenMenu = () => {
  const { publicKey } = useCustomWallet()
  const { user, balance, updateBalance } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2 py-2 pr-4 text-xl">
      <Hamburger toggled={open} toggle={setOpen} />
      <div
        className={`left-0 top-0 z-40 h-screen w-screen bg-[#00000040] ${open ? 'fixed' : 'hidden'}`}
        onClick={(e) => setOpen(false)}
      >
        <div
          className={`absolute top-0 z-50 h-screen max-w-[90vw] border border-gray-300 bg-white px-2 pb-2 ${open ? 'right-0' : '-right-full'} transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'} ${open ? 'shadow-lg' : ''} ${open ? 'rounded-l-lg' : ''} ${open ? 'rounded-r-lg' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col">
            <Hamburger toggled={open} toggle={setOpen} />
            <div className="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-md sm:flex-row sm:items-start sm:justify-between sm:p-6 lg:gap-6">
              <div className="flex flex-col gap-2 sm:flex-1">
                <div className="flex items-center">
                  {user?.name && (
                    <span className="truncate text-sm font-semibold text-gray-700">
                      Name: {user?.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  {user?.upiId && (
                    <span className="truncate text-sm font-semibold text-gray-700">
                      UpiId: {user?.upiId}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  {publicKey && (
                    <span className="truncate text-sm font-semibold text-gray-700">
                      {publicKey?.toString().slice(0, 6)}...
                      {publicKey?.toString().slice(-6)}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm font-semibold text-gray-700">
                  <span>Bal: {balance} SOL</span>
                  <span
                    className="ml-2 cursor-pointer text-blue-500 hover:text-blue-700"
                    onClick={updateBalance}
                  >
                    <AutorenewIcon className="scale-75" />
                  </span>
                </div>
              </div>
              <div className="mt-4 sm:mt-0">
                {publicKey ? (
                  <CustomWalletDisconnectButton />
                ) : (
                  <CustomWalletMultiButton />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SmallScreenMenu
