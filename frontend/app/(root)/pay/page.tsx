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
  const [amount, setAmount] = useState<number>(0)
  const { setIsLoading } = useLoader()
  const { token, updateBalance } = useAuth()
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
      const lamports = BASE_LAMPORTS * amount
      if (lamports <= 0) {
        setErrorToastMessage('Invalid amount')
        return
      }
      const signature = await sendToken(upiDetails.walletAddress, lamports, pin)
      const response = await axios.post(
        `${BACKEND_URL}/v1/txn/send`,
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
      const responseData = response.data
      if (responseData.success) {
        setToastMessage('Transaction successful')
        setAmount(0)
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
      <div className="flex flex-col items-center justify-center gap-2 pt-10 text-black">
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
            <div className="relative h-10">
              <Input
                value={amount.toString()}
                placeholder="Amount"
                onChange={(e) => {
                  if (Number(e.target.value) < 0) {
                    setAmount(0)
                    return
                  }
                  if (Number(e.target.value) > 100000) {
                    setAmount(100000)
                    return
                  }
                  getSolPrice()
                  setAmount(Number(e.target.value))
                }}
                className="text-background h-10"
              />
              <span className="text-background bg-color3 absolute right-0 top-1 flex h-8 w-12 items-center justify-center">
                SOL
              </span>
            </div>
            <p>${amount * solPrice}</p>
            <Button
              onClick={() => {
                if (walletType === WalletType.DEFAULT) {
                  sendHandler({
                    pin: '',
                  })
                } else {
                  setOpenPin({
                    open: true,
                    fn: (pin: string) => {
                      console.log('Wallet Details', upiDetails)
                      sendHandler({
                        pin,
                      })
                    },
                  })
                }
              }}
              disabled={!amount}
            >
              Pay
            </Button>
          </form>
        )}
      </div>
    </main>
  )
}

export default Page
