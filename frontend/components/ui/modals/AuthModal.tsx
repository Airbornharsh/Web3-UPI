'use client'
import { useLoader } from '@/context/LoaderContext'
import { BACKEND_URL } from '@/utils/config'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '@/context/AuthContext'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { AuthFormData } from '@/utils/types'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
      <Label>Wallet Address</Label>
      <Input
        type="text"
        name="name"
        disabled={true}
        value={formData.walletAddress}
      />
      <Button
        onClick={(e) => {
          e.preventDefault()
          walletCheckHandler()
        }}
        disabled={!formData.walletAddress}
        type="submit"
      >
        Next
      </Button>
      <Button
        variant={'outline'}
        onClick={(e) => {
          e.preventDefault()
          setFormData({
            name: '',
            walletAddress: '',
            upiId: '',
            pin: '',
          })
          setOpenModal(false)
        }}
      >
        Close
      </Button>
    </div>
  )

  const step2 = (
    <div className="flex flex-col gap-1">
      <Label>UPI ID</Label>
      <div className="relative">
        <Input
          value={formData.upiId}
          onChange={(e) => {
            setFormData((f) => {
              return { ...f, upiId: e.target.value }
            })
          }}
          name="upiId"
          type="text"
          className="border-[0.01rem]"
        />
        <span
          className={`text-color3 bg-secondary absolute right-0 top-0 flex h-12 w-12 cursor-not-allowed items-center justify-center border-y-[0.01rem] border-r-[0.01rem] px-8 text-gray-500`}
        >
          @wpi
        </span>
      </div>
      <Button
        onClick={(e) => {
          e.preventDefault()
          upiCheckHandler()
        }}
        disabled={!formData.upiId}
        type="submit"
      >
        Next
      </Button>
      <Button
        variant={'outline'}
        onClick={(e) => {
          e.preventDefault()
          setFormData({
            name: '',
            walletAddress: '',
            upiId: '',
            pin: '',
          })
          setOpenModal(false)
        }}
      >
        Close
      </Button>
    </div>
  )

  const step3 = (
    <div className="flex flex-col gap-1">
      <Label>Name</Label>
      <Input
        value={formData.name}
        onChange={(e) => {
          setFormData((f) => {
            return { ...f, name: e.target.value }
          })
        }}
        name="name"
        type="text"
      />
      <Button
        onClick={(e) => {
          e.preventDefault()
          setStep(4)
        }}
        disabled={!formData.name}
        type="submit"
      >
        Next
      </Button>
      <Button
        variant={'outline'}
        onClick={(e) => {
          e.preventDefault()
          setFormData({
            name: '',
            walletAddress: '',
            upiId: '',
            pin: '',
          })
          setOpenModal(false)
        }}
      >
        Close
      </Button>
    </div>
  )

  const step4 = (
    <div className="flex flex-col gap-1">
      <Label>PIN</Label>
      <Input
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
        name="pin"
        type={isWallet ? 'password' : 'text'}
      />
      <Button
        onClick={(e) => {
          e.preventDefault()
          isWallet ? signInHandler() : signUpHandler()
        }}
        disabled={!formData.pin}
        type="submit"
      >
        Submit
      </Button>
      <Button
        variant={'outline'}
        onClick={(e) => {
          e.preventDefault()
          setFormData({
            name: '',
            walletAddress: '',
            upiId: '',
            pin: '',
          })
          setOpenModal(false)
        }}
      >
        Close
      </Button>
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
              <Label>{keyValue}</Label>
              <Input
                value={
                  key === 'upiId'
                    ? (formData[key]! as string) + '@wpi'
                    : (formData[key]! as string)
                }
                onChange={(e) => {
                  setFormData((f) => {
                    return { ...f, [key]: e.target.value }
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
