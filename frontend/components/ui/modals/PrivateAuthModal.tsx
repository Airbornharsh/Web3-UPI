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

interface PrivateAuthModalProps {
  havePrivateKey: boolean
}

const PrivateAuthModal: React.FC<PrivateAuthModalProps> = ({
  havePrivateKey,
}) => {
  const {
    publicKey,
    encodePrivateKey,
    encodedPrivateKey,
    decodePrivateKey,
    getPublicKeyFromPrivateKey,
  } = useCustomWallet()
  const { signIn, signUp } = useAuth()
  const [formData, setFormData] = useState<AuthFormData>({
    name: '',
    walletAddress: '',
    upiId: '',
    pin: '',
    privateKey: '',
  })
  const [step, setStep] = useState(1)
  const { setIsLoading } = useLoader()

  useEffect(() => {
    if (havePrivateKey) {
      setStep(2)
    } else {
      setStep(1)
    }
  }, [havePrivateKey])

  useEffect(() => {
    if (publicKey) {
      setFormData((f) => {
        return { ...f, walletAddress: publicKey?.toString() }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey])

  const setError = (message: string) => {
    toast.error(message, {
      autoClose: 2000,
    })
  }

  const encodedPrivateKeyHandler = async (e: any) => {
    e.preventDefault()
    if (encodedPrivateKey) {
      const keypair = decodePrivateKey(formData.pin)
      if (keypair) {
        const response = await signIn({
          ...formData,
          walletAddress: keypair.publicKey.toString(),
          privateKey: '',
          upiId: '',
          name: '',
        })
        if (!response) {
          setStep(3)
          return
        }
      } else {
        setError('Invalid PIN')
      }
    } else {
      setError('Invalid Private Key')
    }
  }

  const signInHandler = async (e: any) => {
    e.preventDefault()
    if (formData.pin.length !== 6 && formData.privateKey) {
      setError('Invalid PIN or Private Key')
      return
    }
    try {
      const walletAddress = encodePrivateKey(formData.privateKey, formData.pin)
      if (!walletAddress) {
        setError('Invalid Private Key')
        return
      }
      const response = await signIn({
        ...formData,
        walletAddress,
        privateKey: '',
        upiId: '',
        name: '',
      })
      if (!response) {
        setStep(3)
        return
      }
    } catch (e) {
    } finally {
      setFormData({
        name: '',
        walletAddress: '',
        upiId: '',
        pin: '',
        privateKey: '',
      })
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
      <label className="font-semibold">Private Key:</label>
      <input
        type="password"
        name="name"
        className="rounded border border-slate-400 border-opacity-50 p-2 outline-none focus:border-opacity-100"
        value={formData.privateKey}
        onChange={(e) => {
          const address = getPublicKeyFromPrivateKey(e.target.value)
          setFormData((f) => {
            return {
              ...f,
              privateKey: e.target.value,
              walletAddress: address ? address : '',
            }
          })
        }}
      />
      <label className="font-semibold">Wallet Address:</label>
      <input
        type="text"
        name="name"
        className="rounded border border-slate-400 border-opacity-50 bg-gray-200 p-2 outline-none focus:border-opacity-100"
        disabled={true}
        value={formData.walletAddress}
      />
      <label className="font-semibold">PIN:</label>
      <input
        type={'text'}
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
        onClick={signInHandler}
        disabled={!formData.pin || !formData.privateKey}
      >
        SUBMIT
      </button>
    </div>
  )

  const step2 = (
    <div className="flex flex-col gap-1">
      <label className="font-semibold">Pin:</label>
      <input
        type="text"
        name="upiId"
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
        onClick={encodedPrivateKeyHandler}
        disabled={!(formData.pin.length === 6)}
      >
        Submit
      </button>
    </div>
  )

  const step3 = (
    <div className="flex flex-col gap-1">
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
      </div>
      <div className="flex flex-col gap-1">
        <label className="font-semibold">Upi Id:</label>
        <input
          type="text"
          name="name"
          className="rounded border border-slate-400 border-opacity-50 p-2 outline-none focus:border-opacity-100"
          value={formData.upiId}
          onChange={(e) => {
            setFormData((f) => {
              return { ...f, upiId: e.target.value }
            })
          }}
        />
      </div>
      <button
        className="rounded bg-blue-500 p-2 text-white"
        onClick={signUpHandler}
        disabled={!formData.upiId}
      >
        Submit
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
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <form className="w-[90vw] max-w-[25rem] rounded-lg bg-gray-100 px-6 py-4">
        {Object.keys(formData).map((key) => {
          if (key === 'walletAddress' && (step === 1 || step === 2)) return null
          if (key === 'upiId' && (step === 1 || step === 2 || step == 3))
            return null
          if (key === 'name' && (step === 1 || step === 2 || step == 3))
            return null
          if (key === 'pin' && (step === 1 || step === 2 || step === 3))
            return null
          if (key === 'privateKey') return null

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
        <ToastContainer />
      </form>
    </div>
  )
}

export default PrivateAuthModal
