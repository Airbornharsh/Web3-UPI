'use client'
import { useLoader } from '@/context/LoaderContext'
import { BACKEND_URL } from '@/utils/config'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import { useEffect, useState } from 'react'

import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '@/context/AuthContext'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { AuthFormData } from '@/utils/types'

const AuthModal = () => {
  const { publicKey } = useCustomWallet()
  const { signIn, signUp } = useAuth()
  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    walletAddress: '',
    upiId: '',
    pin: '',
  })
  const [step, setStep] = useState(1)
  const [isWallet, setIsWallet] = useState(false)
  const { setIsLoading } = useLoader()

  useEffect(() => {
    if (publicKey) {
      setFormData((f) => {
        return { ...f, walletAddress: publicKey?.toString() }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey])

  useEffect(() => {
    if (formData.walletAddress) {
      walletCheckHandler({ preventDefault: () => {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.walletAddress])

  const setError = (message: string) => {
    toast.error(message, {
      autoClose: 2000,
    })
  }

  const walletCheckHandler = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/v1/user/wallet-check`, {
        walletAddress: formData.walletAddress,
      })
      const responseData = response.data
      if (responseData.userExists) {
        setFormData((f) => {
          return {
            ...f,
            name: responseData.user.name,
            upiId: responseData.user.upiId,
          }
        })
        setIsWallet(true)
        setStep(4)
      } else {
        setStep(2)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  const upiCheckHandler = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/v1/user/upi-check`, {
        walletAddress: formData.walletAddress,
        upiId: formData.upiId,
      })
      if (response.data.userExists) {
        setError('UPI Exists')
      } else {
        setStep(3)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  const signInHandler = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signIn(formData)
    } catch (e) {
    } finally {
      setIsLoading(false)
    }
  }

  const signUpHandler = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await signUp(formData)
    } catch (e) {
    } finally {
      setFormData({
        name: '',
        walletAddress: '',
        upiId: '',
        pin: '',
      })
      setIsLoading(false)
    }
  }

  const step1 = (
    <div className="flex flex-col gap-1">
      <label className="font-semibold">Wallet Address:</label>
      <input
        type="text"
        name="name"
        className="rounded border border-slate-400 border-opacity-50 bg-gray-200 p-2 outline-none focus:border-opacity-100"
        disabled={true}
        value={formData.walletAddress}
      />
      <button
        className="rounded bg-blue-500 p-2 text-white"
        onClick={walletCheckHandler}
        disabled={!formData.walletAddress}
      >
        NEXT
      </button>
    </div>
  )

  const step2 = (
    <div className="flex flex-col gap-1">
      <label className="font-semibold">UPI ID:</label>
      <input
        type="text"
        name="upiId"
        className="rounded border border-slate-400 border-opacity-50 p-2 outline-none focus:border-opacity-100"
        value={formData.upiId}
        onChange={(e) => {
          setFormData((f) => {
            return { ...f, upiId: e.target.value }
          })
        }}
      />
      <button
        className="rounded bg-blue-500 p-2 text-white"
        onClick={upiCheckHandler}
        disabled={!formData.upiId}
      >
        NEXT
      </button>
    </div>
  )

  const step3 = (
    <div className="flex flex-col gap-1">
      <label className="font-semibold">Name:</label>
      <input
        type="text"
        name="name"
        className="rounded border border-slate-400 border-opacity-50 p-2 outline-none focus:border-opacity-100"
        value={formData.name}
        onChange={(e) => {
          setFormData((f) => {
            return { ...f, name: e.target.value }
          })
        }}
      />
      <button
        className="rounded bg-blue-500 p-2 text-white"
        onClick={() => setStep(4)}
        disabled={!formData.name}
      >
        NEXT
      </button>
    </div>
  )

  const step4 = (
    <div className="flex flex-col gap-1">
      <label className="font-semibold">PIN:</label>
      <input
        type={isWallet ? 'password' : 'text'}
        name="pin"
        className="rounded border border-slate-400 border-opacity-50 p-2 outline-none focus:border-opacity-100"
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
      <button
        className="rounded bg-blue-500 p-2 text-white"
        onClick={isWallet ? signInHandler : signUpHandler}
        disabled={!formData.pin}
      >
        SUBMIT
      </button>
    </div>
  )

  const getFormUI = () => {
    switch (step) {
      case 1:
        return step1
      case 2:
        return step2
      case 3:
        return step3
      case 4:
        return step4
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <form className="w-[90vw] max-w-[25rem] rounded-lg bg-gray-100 px-6 py-4">
        {Object.keys(formData).map((key) => {
          if (step === 4) {
            if (key === 'pin') return null
          } else {
            if (key === 'walletAddress' && step === 1) return null
            if (key === 'upiId' && (step === 1 || step === 2 || step === 4))
              return null
            if (
              key === 'name' &&
              (step === 1 || step === 2 || step === 3 || step === 4)
            )
              return null
            if (key === 'pin' && (step === 1 || step === 2 || step === 3))
              return null
          }

          return (
            <div key={key} className="flex flex-col gap-1">
              <label className="font-semibold">{key}</label>
              <input
                type="text"
                name={key}
                className="rounded border border-slate-400 border-opacity-50 bg-gray-200 p-2 outline-none focus:border-opacity-100"
                value={formData[key]}
                disabled={true}
                onChange={(e) => {
                  setFormData((f) => {
                    return { ...f, [key]: e.target.value }
                  })
                }}
              />
            </div>
          )
        })}
        <ul className="flex flex-col gap-2">{getFormUI()}</ul>
        {/* {error && <div className="text-red-500 text-sm">{error}</div>} */}
        <ToastContainer />
      </form>
    </div>
  )
}

export default AuthModal
