'use client'
import { BACKEND_URL } from '@/utils/config'
import { useWallet } from '@solana/wallet-adapter-react'
import axios from 'axios'
import { useEffect, useState } from 'react'

const Page = () => {
  const { publicKey } = useWallet()
  const [formData, setFormData] = useState({
    name: '',
    walletAddress: '',
    upiId: '',
    pin: '',
    confirmPin: '',
  })
  const [error, setError] = useState('')

  const signUpHandler = async (e: any) => {
    e.preventDefault()
    try {
      const response = await axios.post(`${BACKEND_URL}/v1/user/create-user`, {
        ...formData,
      })
      console.log(response)
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (publicKey) {
      setFormData((f) => {
        return { ...f, walletAddress: publicKey?.toString() }
      })
    }
  }, [publicKey])

  return (
    <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
      <form
        className="w-[90vw] max-w-[25rem] bg-slate-200 px-6 py-8 rounded-xl"
        onSubmit={signUpHandler}
      >
        <ul className="flex flex-col gap-2">
          <li className="flex flex-col gap-1">
            <label className="font-semibold">Name:</label>
            <input
              type="text"
              name="name"
              className="p-2 border border-slate-400 rounded border-opacity-50 outline-none focus:border-opacity-100"
              value={formData.name}
              onChange={(e) => {
                setFormData((f) => {
                  return { ...f, name: e.target.value }
                })
              }}
            />
          </li>
          <li className="flex flex-col gap-1">
            <label className="font-semibold">UpiId:</label>
            <input
              type="text"
              name="upiId"
              className="p-2 border border-slate-400 rounded border-opacity-50 outline-none focus:border-opacity-100"
              value={formData.upiId}
              onChange={(e) => {
                setFormData((f) => {
                  return { ...f, upiId: e.target.value }
                })
              }}
            />
          </li>
          <li className="flex flex-col gap-1">
            <label className="font-semibold">Wallet Address:</label>
            <input
              type="text"
              name="upiId"
              className="p-2 border border-slate-400 rounded border-opacity-50 outline-none focus:border-opacity-100"
              value={formData.walletAddress}
              disabled={true}
            />
          </li>
          <li className="flex flex-col gap-1">
            <label className="font-semibold">Pin:</label>
            <input
              type="text"
              name="pin"
              inputMode="numeric"
              className="p-2 border border-slate-400 rounded border-opacity-50 outline-none focus:border-opacity-100"
              value={formData.pin}
              onChange={(e) => {
                if (e.target.value.length > 6) {
                  return
                }
                if (isNaN(Number(e.target.value))) {
                  return
                }
                setFormData((f) => {
                  return { ...f, pin: e.target.value }
                })
              }}
            />
          </li>
          <li className="flex flex-col gap-1">
            <label className="font-semibold">Confirm Pin:</label>
            <input
              type="text"
              name="pin"
              inputMode="numeric"
              className="p-2 border border-slate-400 rounded border-opacity-50 outline-none focus:border-opacity-100"
              value={formData.confirmPin}
              onChange={(e) => {
                if (e.target.value.length > 6) {
                  return
                }
                if (isNaN(Number(e.target.value))) {
                  return
                }
                if (formData.pin !== e.target.value) {
                  setError('Pin does not match')
                } else {
                  setError('')
                }
                setFormData((f) => {
                  return { ...f, confirmPin: e.target.value }
                })
              }}
            />
          </li>
          {error ? <p className="text-xs text-red-500">{error}</p> : null}
          <li>
            <button className="bg-blue-500 text-white p-2 rounded">
              Submit
            </button>
          </li>
        </ul>
      </form>
    </div>
  )
}

export default Page
