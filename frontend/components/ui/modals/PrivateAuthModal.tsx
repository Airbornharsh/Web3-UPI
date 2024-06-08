'use client'
import { useLoader } from '@/context/LoaderContext'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '@/context/AuthContext'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { AuthFormData } from '@/utils/types'
import FormLabel from '../labels/FormLabel'
import FormInput from '../inputs/FormInput'

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
      <FormLabel name={'Private Key'} />
      <FormInput
        type="password"
        name="privateKey"
        value={formData.privateKey as string}
        onChange={(val) => {
          const address = getPublicKeyFromPrivateKey(val)
          setFormData((f) => {
            return {
              ...f,
              privateKey: val,
              walletAddress: address ? address : '',
            }
          })
        }}
      />
      <FormLabel name={'Wallet Address'} />
      <FormInput
        type="text"
        name="walletAddress"
        value={formData.walletAddress}
        disabled={true}
        onChange={(val) => {
          const address = getPublicKeyFromPrivateKey(val)
          setFormData((f) => {
            return {
              ...f,
              privateKey: val,
              walletAddress: address ? address : '',
            }
          })
        }}
      />
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
    </div>
  )

  const step2 = (
    <div className="flex flex-col gap-1">
      <FormLabel name={'Pin'} />
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
    </div>
  )

  const step3 = (
    <div className="flex flex-col gap-1">
      <div className="flex flex-col gap-1">
        <FormLabel name={'Name'} />
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
      </div>
      <div className="flex flex-col gap-1">
        <FormLabel name={'UPI Id'} />
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

export default PrivateAuthModal
