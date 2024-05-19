'use client'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useLoader } from '@/context/LoaderContext'
import { BACKEND_URL, BASE_LAMPORTS, NETWORK } from '@/utils/config'
import { User } from '@/utils/types'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import axios from 'axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useSearchParams } from 'next/navigation'

const Page = () => {
  const searchParams = useSearchParams()
  const { publicKey, wallet, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [upiDetails, setUpiDetails] = useState<User | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const { setIsLoading } = useLoader()
  const { token, updateBalance } = useAuth()
  const upiId = searchParams.get('upiId')

  const onLoad = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `${BACKEND_URL}/v1/user/${upiId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upiId])

  const setError = (message: string) => {
    toast.error(message, {
      autoClose: 2000,
    })
  }

  const setMessage = (message: string) => {
    toast.success(message, {
      autoClose: 2000,
    })
  }

  const sendHandler = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (!wallet) {
        setError('Wallet not connected')
        return
      }
      if (!upiDetails?.walletAddress || !upiDetails?.upiId) {
        setError('Invalid UPI ID')
        return
      }
      const lamports = BASE_LAMPORTS * amount
      if (lamports <= 0) {
        setError('Invalid amount')
        return
      }
      const txn = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey!,
          toPubkey: new PublicKey(upiDetails.walletAddress),
          lamports,
        }),
      )
      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext()
      const signature = await sendTransaction(txn, connection, {
        minContextSlot,
      })
      console.log(signature)
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      })
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
      console.log(response.data)
      const responseData = response.data
      if (responseData.success) {
        setMessage('Transaction successful')
        setAmount(0)
      } else {
        setError('Transaction failed')
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
          <form className="flex flex-col gap-2">
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
            <div className="relative h-10">
              <Input
                value={amount.toString()}
                placeHolder="Amount"
                onChange={setAmount}
                className="h-10"
              />
              <span className="absolute right-0 top-0 flex h-10 w-12 items-center justify-center border-[0.01rem] border-l-0 border-cyan-400 bg-gray-200">
                SOL
              </span>
            </div>
            <button
              className="rounded bg-blue-500 p-2 text-white"
              onClick={sendHandler}
              disabled={!amount}
            >
              Pay
            </button>
          </form>
        )}
      </div>
      <ToastContainer />
    </main>
  )
}

export default Page