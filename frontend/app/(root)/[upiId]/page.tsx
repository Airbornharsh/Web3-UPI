'use client'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/context/AuthContext'
import { useLoader } from '@/context/LoaderContext'
import { BACKEND_URL } from '@/utils/config'
import { User } from '@/utils/types'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'

const Page: React.FC<{
  params: {
    upiId: string
  }
}> = ({ params }) => {
  const { publicKey, wallet, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [upiDetails, setUpiDetails] = useState<User | null>(null)
  const [amount, setAmount] = useState<number>(0)
  const { setIsLoading } = useLoader()
  const { token } = useAuth()

  const onLoad = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `${BACKEND_URL}/v1/user/${params.upiId}`,
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
  }, [params.upiId])

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
      const lamports = 1000000000 * amount
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
    }
  }

  return (
    <main>
      <div className="text-black pt-10 flex justify-center flex-col items-center gap-2">
        <h1 className="text-xl font-semibold">Scan and Pay</h1>
        {upiDetails && (
          <form className="flex flex-col gap-2">
            <h1 className="">{upiDetails.name}</h1>
            <h2 className="text-sm">
              Address: {upiDetails.walletAddress?.toString().slice(0, 6)}...
              {upiDetails.walletAddress?.toString().slice(-6)}
            </h2>
            <h3 className="text-sm">UpiId: {upiDetails.upiId}</h3>
            <div className="relative h-10">
              <Input
                value={amount.toString()}
                placeHolder="Amount"
                onChange={setAmount}
                className="h-10"
              />
              <span className="bg-gray-200 absolute right-0 top-0 h-10 w-12 flex justify-center items-center">
                SOL
              </span>
            </div>
            <button
              className="bg-blue-500 text-white p-2 rounded"
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
