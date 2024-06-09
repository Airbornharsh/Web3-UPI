'use client'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useLoader } from '@/context/LoaderContext'
import { BACKEND_URL, BASE_LAMPORTS, NETWORK } from '@/utils/config'
import { User } from '@/utils/types'
import axios from 'axios'
import Link from 'next/link'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import React, { Suspense, useEffect, useState } from 'react'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useSearchParams } from 'next/navigation'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { WalletType } from '@/utils/enum'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { parse } from 'postcss'

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PayPage />
    </Suspense>
  )
}

const PayPage = () => {
  const searchParams = useSearchParams()
  const {
    setOpenPin,
    setErrorToastMessage,
    setToastMessage,
    setQrCodeScanOpen,
  } = useLoader()
  const { sendToken, walletType, solPrice, getSolPrice } = useCustomWallet()
  const [upiDetails, setUpiDetails] = useState<User | null>(null)
  const [amount, setAmount] = useState<string>('0')
  const [closeDialog, setCloseDialog] = useState(false)
  const [pin, setPin] = useState('')
  const [walletSelected, setWalletSelected] = useState<'wallet-1' | 'wallet-2'>(
    'wallet-1',
  )
  const { setIsLoading } = useLoader()
  const { token, updateBalance, balance, user, setUser } = useAuth()
  const upiId = searchParams.get('upiId')

  const onLoad = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${BACKEND_URL}/v1/user/${upiId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const responseData = response.data
      if (responseData.user) {
        setUpiDetails(responseData.user)
      }
    } catch (e) {
      console.log(e)
      setUpiDetails(null)
    } finally {
      setIsLoading(false)
    }
  }

  const walletBalances = () => {
    const wallet1_1 = balance.toString().split('.')[0]
    const wallet1_2 = balance.toString().split('.')[1]?.slice(0, 2) || 0

    const wallet1 = wallet1_1 + (wallet1_2 ? '.' + wallet1_2 : '')
    const baseWallet2 = parseInt(user?.walletBalance!) / BASE_LAMPORTS
    const wallet2_1 = baseWallet2.toString().split('.')[0]
    const wallet2_2 = baseWallet2.toString().split('.')[1]?.slice(0, 2) || 0
    const wallet2 = wallet2_1 + (wallet2_2 ? '.' + wallet2_2 : '')
    return { wallet1, wallet2 }
  }

  useEffect(() => {
    onLoad()
    setQrCodeScanOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upiId])

  const sendHandler = async ({ pin }: { pin?: string }) => {
    setIsLoading(true)
    try {
      if (!upiDetails?.walletAddress || !upiDetails?.upiId) {
        setErrorToastMessage('Invalid UPI ID')
        return
      }
      const lamports = BASE_LAMPORTS * (parseFloat(amount) || 0)
      if (lamports <= 0) {
        setErrorToastMessage('Invalid amount')
        return
      }
      let response
      if (walletSelected === 'wallet-1') {
        const signature = await sendToken(
          upiDetails.walletAddress,
          lamports,
          pin,
        )
        if (!signature) {
          setErrorToastMessage('Transaction failed')
          return
        }
        response = await axios.post(
          `${BACKEND_URL}/v1/txn/send/wallet-1`,
          {
            upiId: upiDetails.upiId,
            walletAddress: upiDetails.walletAddress,
            lamports,
            signature,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
      } else {
        response = await axios.post(
          `${BACKEND_URL}/v1/txn/send/wallet-2`,
          {
            upiId: upiDetails.upiId,
            walletAddress: upiDetails.walletAddress,
            lamports,
            pin,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
      }
      const responseData = response.data
      if (responseData.status) {
        setToastMessage('Transaction successful')
        setAmount('0')
      } else {
        setErrorToastMessage('Transaction failed')
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
      updateBalance()
    }
  }

  return (
    <main>
      <div className="flex flex-col items-center justify-center gap-2 pt-10 text-white">
        {upiDetails && (
          <form className="bg-secondary flex flex-col gap-2 rounded-lg px-12 py-6">
            <h1 className="">{upiDetails.name}</h1>
            <span className="flex items-center">
              <h2 className="text-sm">
                Address: {upiDetails.walletAddress?.toString().slice(0, 6)}...
                {upiDetails.walletAddress?.toString().slice(-6)}
              </h2>
              <Link
                href={`https://explorer.solana.com/address/${upiDetails.walletAddress}${NETWORK === 'devnet' ? '?cluster=devnet' : ''}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <OpenInNewIcon className="scale-75" />
              </Link>
            </span>
            <h3 className="text-sm">UpiId: {upiDetails.upiId}</h3>
            <span className="flex items-center">
              <p>SOl Price: ${solPrice}</p>
              <span
                className="ml-2 cursor-pointer text-blue-500 hover:text-blue-700"
                onClick={getSolPrice}
              >
                <AutorenewIcon className="scale-75" />
              </span>
            </span>
            <Select
              onValueChange={(val) =>
                setWalletSelected(val as 'wallet-1' | 'wallet-2')
              }
              defaultValue={walletSelected}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Wallet" />
              </SelectTrigger>
              <SelectContent
                onChange={(e) => {
                  console.log(e.target)
                }}
              >
                <SelectGroup>
                  <SelectLabel>Wallet</SelectLabel>
                  <SelectItem value="wallet-1">
                    <span>Wallet-1</span>{' '}
                    <span>{walletBalances().wallet1}SOL</span>
                  </SelectItem>
                  <SelectItem value="wallet-2">
                    <span>Wallet-2</span>{' '}
                    <span>{walletBalances().wallet2}SOL</span>
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div className="relative h-10">
              <Input
                value={amount}
                placeholder="Amount"
                onChange={(e) => {
                  if (isNaN(Number(e.target.value))) {
                    return
                  }
                  if (Number(e.target.value) < 0) {
                    return
                  }
                  // getSolPrice()
                  setAmount(e.target.value)
                }}
              />
              <span className="bg-color3 absolute right-0 top-0 flex h-12 w-12 items-center justify-center font-bold text-white">
                SOL
              </span>
            </div>
            <p>Min Sol: 0.02SOL</p>
            <p>${(parseFloat(amount) || 0) * solPrice}</p>
            <AlertDialog
              open={closeDialog}
              onOpenChange={() => {
                if (closeDialog) {
                  setCloseDialog(false)
                }
              }}
            >
              <AlertDialogTrigger
                onClick={() => {
                  setCloseDialog(true)
                }}
                asChild
                disabled={!amount}
              >
                <Button
                  disabled={
                    !(
                      (parseFloat(amount) || 0) >= 0.02 &&
                      (walletSelected === 'wallet-1'
                        ? balance >= parseFloat(amount)
                        : parseInt(user?.walletBalance!) / BASE_LAMPORTS >=
                          parseFloat(amount))
                    )
                  }
                >
                  Pay
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to Pay to {upiId}?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-white">
                    {amount + ' SOL'}
                  </AlertDialogDescription>
                  {(walletSelected === 'wallet-2' ||
                    walletType == WalletType.CUSTOM) && (
                    <AlertDialogDescription className="flex items-center gap-2 text-white">
                      <Label>PIN:</Label>
                      <Input
                        value={pin}
                        onChange={(e) => {
                          if (e.target.value.length > 6) {
                            return
                          }
                          if (isNaN(Number(e.target.value))) {
                            return
                          }
                          setPin(e.target.value)
                        }}
                        name="pin"
                        type={'text'}
                        className="bg-secondary h-10 w-20 rounded-lg p-3 text-white outline-none"
                      />
                    </AlertDialogDescription>
                  )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (walletSelected === 'wallet-1') {
                        sendHandler({
                          pin: '',
                        })
                      } else {
                        sendHandler({
                          pin,
                        })
                      }
                      setPin('')
                    }}
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>
        )}
      </div>
    </main>
  )
}

export default Page
