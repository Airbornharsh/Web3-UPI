import AutorenewIcon from '@mui/icons-material/Autorenew'
import CustomWalletDisconnectButton from '../wallet/CustomWalletDisconnectButton'
import CustomWalletMultiButton from '../wallet/CustomWalletMultiButton'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import Hamburger from 'hamburger-react'
import { Button } from '@mui/material'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { useLoader } from '@/context/LoaderContext'
import { URL } from '@/utils/config'
import FormButton from '../ui/buttons/FormButton'

const SmallScreenMenu = () => {
  const { setQrCodeOpenData } = useLoader()
  const { publicKey } = useCustomWallet()
  const { user, balance, updateBalance, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2 py-2 pr-4 text-xl">
      <Hamburger toggled={open} toggle={setOpen} color="#F2F2F2" />
      {open && (
        <div
          className={`bg-secondary absolute top-[4.2rem] z-50 max-w-[90vw] border border-gray-500 px-2 pb-2 ${open ? 'right-0' : '-right-full'} transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'} ${open ? 'shadow-lg' : ''} ${open ? 'rounded-l-lg' : ''} ${open ? 'rounded-r-lg' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col">
            <div className="flex flex-col gap-4 rounded-lg p-4 shadow-md sm:flex-row sm:items-start sm:justify-between sm:p-6 lg:gap-6">
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
            {isAuthenticated ? (
              // <Button
              //   onClick={() => {
              //     setQrCodeOpenData(`${URL}/pay?upiId=${user?.upiId}`)
              //   }}
              //   style={{
              //     backgroundColor: '#f0f0f0',
              //     color: 'black',
              //     padding: '10px 20px',
              //     borderRadius: '10px',
              //   }}
              // >
              //   Show QR
              // </Button>
              <FormButton
                name="Show QR"
                onClick={() => {
                  setQrCodeOpenData(`${URL}/pay?upiId=${user?.upiId}`)
                }}
                disabled={!user?.upiId}
                type="button"
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default SmallScreenMenu
