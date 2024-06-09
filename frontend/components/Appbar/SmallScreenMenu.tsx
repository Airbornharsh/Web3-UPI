import AutorenewIcon from '@mui/icons-material/Autorenew'
import CustomWalletDisconnectButton from '../wallet/CustomWalletDisconnectButton'
import CustomWalletMultiButton from '../wallet/CustomWalletMultiButton'
import { useAuth } from '@/context/AuthContext'
import { useState } from 'react'
import Hamburger from 'hamburger-react'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { useLoader } from '@/context/LoaderContext'
import { BASE_LAMPORTS, URL } from '@/utils/config'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import OperationModal from '../ui/modals/OperationModal'
import QrCodeViewModal from '../ui/modals/QrCodeViewModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const SmallScreenMenu = () => {
  const { setQrCodeOpenData, setOperationOpen } = useLoader()
  const { publicKey } = useCustomWallet()
  const { user, balance, updateBalance, isAuthenticated } = useAuth()
  const [open, setOpen] = useState(false)

  const router = useRouter()

  return (
    <div className="flex items-center gap-2 py-2 pr-4 text-xl">
      <Sheet
        open={open}
        onOpenChange={() => {
          if (open) {
            setOpen(false)
          }
        }}
      >
        <SheetTrigger asChild>
          {/* <Button onClick={() => setOpen(true)}>Open sheet</Button> */}
          <Hamburger toggled={open} toggle={setOpen} color="#F2F2F2" />
        </SheetTrigger>
        <SheetContent>
          {/* <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>Done</SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" value="@peduarte" className="col-span-3" />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter> */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-4 rounded-lg text-white shadow-md">
              <div className="flex flex-col gap-2 sm:flex-1">
                <div className="flex items-center">
                  {user?.name && (
                    <span className="truncate text-sm font-semibold ">
                      Name: {user?.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  {user?.upiId && (
                    <span className="truncate text-sm font-semibold ">
                      UpiId: {user?.upiId}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  {publicKey && (
                    <span className="truncate text-sm font-semibold ">
                      {publicKey?.toString().slice(0, 6)}...
                      {publicKey?.toString().slice(-6)}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm font-semibold ">
                  <span className="flex flex-col">
                    <span>Bal: {balance} SOL</span>
                    <span>
                      Wallet:{' '}
                      {(parseInt(user?.walletBalance!) || 0) / BASE_LAMPORTS}{' '}
                      SOL
                    </span>
                  </span>
                  <span
                    className="ml-2 cursor-pointer text-blue-500 hover:text-blue-700"
                    onClick={updateBalance}
                  >
                    <AutorenewIcon className="scale-75" />
                  </span>
                </div>
              </div>
              {isAuthenticated ? (
                <div className="mt-4 flex flex-col gap-2">
                  <Link href={'/'}>
                    <Button className='w-full'>Home</Button>
                  </Link>
                  <Link href={'/history'}>
                    <Button className='w-full'>History</Button>
                  </Link>
                </div>
              ) : null}
            </div>
            {isAuthenticated ? (
              <div className="mt-4 flex flex-col gap-2">
                <OperationModal />
                <QrCodeViewModal />
              </div>
            ) : null}
            <div className="mt-4 sm:mt-0">
              {publicKey ? (
                <CustomWalletDisconnectButton />
              ) : (
                <CustomWalletMultiButton />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default SmallScreenMenu
