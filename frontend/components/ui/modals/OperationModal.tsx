'use client'
import { useLoader } from '@/context/LoaderContext'
import { CircularProgress, Modal } from '@mui/material'
import FormButton from '../buttons/FormButton'
import { useState } from 'react'
import FormInput from '../inputs/FormInput'
import { WalletType } from '@/utils/enum'
import { useAuth } from '@/context/AuthContext'
import { BACKEND_URL, BASE_LAMPORTS } from '@/utils/config'
import { useCustomWallet } from '@/context/CustomWalletContext'
import axios from 'axios'

const OperationModal = () => {
  const { operationOpen, setOperationOpen, setIsLoading, setOpenPin } =
    useLoader()
  const { walletType, solPrice, getSolPrice } = useCustomWallet()
  const { token, handleDeposit, handleWithraw } = useAuth()
  const [operationType, setOperationType] = useState<'DEPOSIT' | 'WITHRAW'>(
    'DEPOSIT',
  )
  const [amount, setAmount] = useState<string>('0')
  const [withrawAmounts, setWithrawAmounts] = useState<{
    lamports: string
    fees: string
    valid: boolean
    loading: boolean
  }>({
    lamports: '0',
    fees: '0',
    valid: false,
    loading: false,
  })

  const isValidAmount = (amount: string) => {
    if (!isNaN(Number(amount))) {
      return false
    } else if (Number(amount) <= 0) {
      return false
    }
    return true
  }

  const handleDepositHandler = async ({ pin }: { pin?: string }) => {
    try {
      await handleDeposit(Number(amount) * BASE_LAMPORTS, pin)
    } catch (e) {
      console.log(e)
    }
  }

  const isWithrawValid = async (amount: string) => {
    setWithrawAmounts({
      ...withrawAmounts,
      loading: true,
    })
    try {
      const isWithrawResponse = await axios.post(
        `${BACKEND_URL}/v1/operation/iswithraw`,
        {
          lamports: Number(amount) * BASE_LAMPORTS,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const responseData = isWithrawResponse.data
      if (responseData.status) {
        setWithrawAmounts({
          lamports: responseData.lamports,
          fees: responseData.fees,
          valid: true,
          loading: false,
        })
      } else {
        setWithrawAmounts({
          lamports: '0',
          fees: '0',
          valid: false,
          loading: false,
        })
      }
    } catch (e) {
      console.log(e)
      setWithrawAmounts({
        lamports: '0',
        fees: '0',
        valid: false,
        loading: false,
      })
    }
  }

  const handleWithrawHandler = async () => {
    try {
      await handleWithraw(Number(amount) * BASE_LAMPORTS)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <Modal
      open={operationOpen}
      onClose={() => {
        setOperationOpen(false)
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="bg-secondary flex w-[90vw] max-w-[25rem] flex-col items-center gap-3 p-4">
        <div className="flex w-full items-center gap-2">
          <FormButton
            name="Deposit"
            onClick={() => {
              setOperationType('DEPOSIT')
            }}
            disabled={operationType === 'DEPOSIT'}
            type="button"
            className={`border-primary w-full border-[0.01rem] ${operationType === 'DEPOSIT' ? 'bg-primary-dark border-0' : 'bg-secondary'}`}
          />
          <span>/</span>
          <FormButton
            name="Withraw"
            onClick={() => {
              setOperationType('WITHRAW')
              isWithrawValid(amount)
            }}
            disabled={operationType === 'WITHRAW'}
            type="button"
            className={`border-primary w-full border-[0.01rem] ${operationType === 'WITHRAW' ? 'bg-primary-dark border-0' : 'bg-secondary'}`}
          />
        </div>
        <div className="flex w-full flex-col gap-2">
          <div className="relative w-full">
            <FormInput
              type="text"
              name="name"
              value={amount}
              disabled={false}
              className="w-full"
              onChange={(val) => {
                if (isNaN(Number(val))) {
                  return
                }
                if (Number(val) < 0) {
                  return
                }
                if (operationType === 'WITHRAW') {
                  isWithrawValid(val)
                }
                setAmount(val)
              }}
            />
            <span className="text-color3 bg-secondary absolute right-0 top-0 flex h-10 w-12 items-center justify-center">
              SOL
            </span>
          </div>
          {operationType === 'WITHRAW' && (
            <div className="flex w-full flex-col gap-2">
              <div className="flex w-full items-center gap-2">
                <span>
                  Sol: {parseInt(withrawAmounts.lamports) / BASE_LAMPORTS}
                </span>
                <span>
                  Fees: {parseInt(withrawAmounts.fees) / BASE_LAMPORTS}
                </span>
              </div>
              <div className="flex w-full items-center gap-2">
                <span>
                  Sol($):{' '}
                  {(
                    (parseInt(withrawAmounts.lamports) / BASE_LAMPORTS) *
                    solPrice
                  ).toFixed(2)}
                </span>
                <span>
                  Fees($):{' '}
                  {(
                    (parseInt(withrawAmounts.fees) / BASE_LAMPORTS) *
                    solPrice
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          )}
          {operationType === 'WITHRAW' && withrawAmounts.loading ? (
            <div className="bg-primary-dark flex h-10 w-full items-center justify-center">
              {/* <span className="text-background">Loading...</span> */}
              <CircularProgress color="primary" />
            </div>
          ) : (
            <FormButton
              name="Checkout"
              onClick={() => {
                if (operationType === 'DEPOSIT') {
                  if (walletType === WalletType.DEFAULT) {
                    handleDepositHandler({
                      pin: '',
                    })
                  } else {
                    setIsLoading(true)
                    setOpenPin({
                      open: true,
                      fn: (pin: string) => {
                        handleDepositHandler({
                          pin,
                        })
                      },
                    })
                  }
                } else {
                  handleWithrawHandler()
                }
              }}
              type="button"
              className={`w-full ${isValidAmount(amount) ? 'bg-primary-dark' : 'bg-primary'}`}
              disabled={
                !isValidAmount(amount) &&
                (operationType === 'DEPOSIT' ? false : !withrawAmounts.valid)
              }
            />
          )}
        </div>
      </div>
    </Modal>
  )
}

export default OperationModal
