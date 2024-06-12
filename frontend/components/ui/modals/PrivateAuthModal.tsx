'use client'
import { useLoader } from '@/context/LoaderContext'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '@/context/AuthContext'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { AuthFormData } from '@/utils/types'

interface PrivateAuthModalProps {
  havePrivateKey: boolean
  setOpenModal: (val: boolean) => void
}

const PrivateAuthModal: React.FC<PrivateAuthModalProps> = ({
  havePrivateKey,
  setOpenModal,
}) => {
  const { setIsLoading, setErrorToastMessage } = useLoader()
  const {
    publicKey,
    encodePrivateKey,
    encodedPrivateKey,
    decodePrivateKey,
    getPublicKeyFromPrivateKey,
    disconnectPrivatWallet,
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

  const encodedPrivateKeyHandler = async () => {
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
        setErrorToastMessage('Invalid PIN')
      }
    } else {
      setErrorToastMessage('Invalid Private Key')
    }
  }

  const signInHandler = async () => {
    if (formData.pin.length !== 6 && formData.privateKey) {
      setErrorToastMessage('Invalid PIN or Private Key')
      return
    }
    try {
      const walletAddress = encodePrivateKey(
        formData.privateKey as string,
        formData.pin,
      )
      if (!walletAddress) {
        setErrorToastMessage('Invalid Private Key')
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
      <Label>Private Key</Label>
      <Input
        type="password"
        name="privateKey"
        value={formData.privateKey as string}
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
      <Label>Wallet Address</Label>
      <Input
        type="text"
        name="walletAddress"
        value={formData.walletAddress}
        disabled={true}
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
        type="text"
      />
      <Button
        onClick={(e) => {
          e.preventDefault()
          signInHandler()
        }}
        disabled={!formData.pin || !formData.privateKey}
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
            privateKey: '',
          })
          disconnectPrivatWallet()
          setOpenModal(false)
        }}
      >
        Close
      </Button>
    </div>
  )

  const step2 = (
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
        name="upiId"
        type={'text'}
      />
      <Button
        onClick={(e) => {
          e.preventDefault()
          encodedPrivateKeyHandler()
        }}
        disabled={!(formData.pin.length === 6)}
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
            privateKey: '',
          })
          disconnectPrivatWallet()
          setOpenModal(false)
        }}
      >
        Close
      </Button>
    </div>
  )

  const step3 = (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-1">
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => {
            setFormData((f) => {
              return { ...f, name: e.target.value }
            })
          }}
          name="upiId"
          type="text"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label>UPI Id</Label>
        <div className="relative">
          <Input
            value={formData.upiId}
            onChange={(e) => {
              setFormData((f) => {
                return { ...f, upiId: e.target.value }
              })
            }}
            name="name"
            type="text"
            className="border-[0.01rem]"
          />
          <span
            className={`text-color3 bg-secondary absolute right-0 top-0 flex h-12 w-12 cursor-not-allowed items-center justify-center border-y-[0.01rem] border-r-[0.01rem] px-8 text-gray-500`}
          >
            @wpi
          </span>
        </div>
      </div>
      <Button
        onClick={(e) => {
          e.preventDefault()
          signUpHandler()
        }}
        disabled={!formData.upiId}
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
            privateKey: '',
          })
          disconnectPrivatWallet()
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
      default:
        return null
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <form className="bg-secondary w-[90vw] max-w-[25rem] rounded-lg bg-gray-100 px-6 py-8">
        {Object.keys(formData).map((key) => {
          if (key === 'walletAddress' && (step === 1 || step === 2)) return null
          if (key === 'upiId' && (step === 1 || step === 2 || step == 3))
            return null
          if (key === 'name' && (step === 1 || step === 2 || step == 3))
            return null
          if (key === 'pin' && (step === 1 || step === 2 || step === 3))
            return null
          if (key === 'privateKey') return null

          let keyValue = ''
          if (key === 'walletAddress') {
            keyValue = 'Wallet Address'
          } else if (key === 'upiId') {
            keyValue = 'UPI ID'
          } else if (key === 'privateKey') {
            keyValue = 'Private Key'
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

export default PrivateAuthModal
