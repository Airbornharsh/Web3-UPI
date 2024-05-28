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
import FormLabel from '../labels/FormLabel'
import FormInput from '../inputs/FormInput'
import FormButton from '../buttons/FormButton'

interface AuthModalProps {
  setOpenModal: (val: boolean) => void
}

const AuthModal: React.FC<AuthModalProps> = ({ setOpenModal }) => {
  const { setErrorToastMessage } = useLoader()
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
      walletCheckHandler()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.walletAddress])

  const walletCheckHandler = async () => {
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

  const upiCheckHandler = async () => {
    setIsLoading(true)
    try {
      const response = await axios.post(`${BACKEND_URL}/v1/user/upi-check`, {
        walletAddress: formData.walletAddress,
        upiId: formData.upiId,
      })
      if (response.data.userExists) {
        setErrorToastMessage('UPI Exists')
      } else {
        setStep(3)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsLoading(false)
    }
  }

  const signInHandler = async () => {
    setIsLoading(true)
    try {
      await signIn(formData)
    } catch (e) {
    } finally {
      setIsLoading(false)
    }
  }

  const signUpHandler = async () => {
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
      <FormLabel name="Wallet Address:" />
      <FormInput
        type="text"
        name="name"
        disabled={true}
        value={formData.walletAddress}
      />
      <FormButton
        name="Next"
        onClick={() => {
          walletCheckHandler()
        }}
        disabled={!formData.walletAddress}
        type="submit"
      />
      <FormButton
        name="Close"
        className="border-primary text-primary hover:bg-primary border-[0.1rem] bg-transparent hover:text-white"
        onClick={() => {
          setFormData({
            name: '',
            walletAddress: '',
            upiId: '',
            pin: '',
          })
          setOpenModal(false)
        }}
      />
    </div>
  )

  const step2 = (
    <div className="flex flex-col gap-1">
      <FormLabel name={'UPI ID'} />
      <FormInput
        value={formData.upiId}
        onChange={(val) => {
          setFormData((f) => {
            return { ...f, upiId: val }
          })
        }}
        name="upiId"
        type="text"
      />
      <FormButton
        name="Next"
        onClick={() => {
          upiCheckHandler()
        }}
        disabled={!formData.upiId}
        type="submit"
      />
      <FormButton
        name="Close"
        className="border-primary text-primary hover:bg-primary border-[0.1rem] bg-transparent hover:text-white"
        onClick={() => {
          setFormData({
            name: '',
            walletAddress: '',
            upiId: '',
            pin: '',
          })
          setOpenModal(false)
        }}
      />
    </div>
  )

  const step3 = (
    <div className="flex flex-col gap-1">
      <FormLabel name={'Name'} />
      <FormInput
        value={formData.name}
        onChange={(val) => {
          setFormData((f) => {
            return { ...f, name: val }
          })
        }}
        name="name"
        type="text"
      />
      <FormButton
        name="Next"
        onClick={() => {
          setStep(4)
        }}
        disabled={!formData.name}
        type="submit"
      />
      <FormButton
        name="Close"
        className="border-primary text-primary hover:bg-primary border-[0.1rem] bg-transparent hover:text-white"
        onClick={() => {
          setFormData({
            name: '',
            walletAddress: '',
            upiId: '',
            pin: '',
          })
          setOpenModal(false)
        }}
      />
    </div>
  )

  const step4 = (
    <div className="flex flex-col gap-1">
      <FormLabel name={'PIN'} />
      <FormInput
        value={formData.pin}
        onChange={(val) => {
          if (val.length > 6) {
            return
          }
          if (isNaN(Number(val))) {
            return
          }
          setFormData((f) => {
            return { ...f, pin: val }
          })
        }}
        name="pin"
        type={isWallet ? 'password' : 'text'}
      />
      <FormButton
        name="Submit"
        onClick={() => {
          isWallet ? signInHandler() : signUpHandler()
        }}
        disabled={!formData.pin}
        type="submit"
      />
      <FormButton
        name="Close"
        className="border-primary text-primary hover:bg-primary border-[0.1rem] bg-transparent hover:text-white"
        onClick={() => {
          setFormData({
            name: '',
            walletAddress: '',
            upiId: '',
            pin: '',
          })
          setOpenModal(false)
        }}
      />
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
      <form className="bg-secondary w-[90vw] max-w-[25rem] rounded-lg bg-gray-100 px-6 py-8">
        {Object.keys(formData).map((key) => {
          if (key === 'signature') return null
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

          let keyValue = ''
          if (key === 'walletAddress') {
            keyValue = 'Wallet Address'
          } else if (key === 'upiId') {
            keyValue = 'UPI ID'
          } else {
            keyValue = key.charAt(0).toUpperCase() + key.slice(1)
          }

          return (
            <div key={key} className="flex flex-col gap-1">
              <FormLabel name={keyValue} />
              <FormInput
                value={formData[key]! as string}
                onChange={(val) => {
                  setFormData((f) => {
                    return { ...f, [key]: val }
                  })
                }}
                name={key}
                type="text"
                disabled={true}
              />
            </div>
          )
        })}
        <ul className="flex flex-col gap-2">{getFormUI()}</ul>
      </form>
    </div>
  )
}

export default AuthModal
