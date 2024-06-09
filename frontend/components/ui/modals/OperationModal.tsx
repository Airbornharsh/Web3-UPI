'use client'
import { useLoader } from '@/context/LoaderContext'
import { CircularProgress, Modal } from '@mui/material'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WalletType } from '@/utils/enum'
import { useAuth } from '@/context/AuthContext'
import { BACKEND_URL, BASE_LAMPORTS } from '@/utils/config'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import axios from 'axios'
import PinModal from './PinModal'
import { Label } from '../label'
import { calculateTransactionFee } from '@/utils/connection'

const OperationModal = () => {
  const { operationOpen, setOperationOpen } = useLoader()
  const { walletType, solPrice } = useCustomWallet()
  const { token, handleDeposit, handleWithdraw, user } = useAuth()
  const [operationType, setOperationType] = useState<'DEPOSIT' | 'WITHDRAW'>(
    'DEPOSIT',
  )
  const [amount, setAmount] = useState<string>('0')
  const [withdrawAmounts, setWithdrawAmounts] = useState<{
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
  const [closeDialog, setCloseDialog] = useState(false)
  const [pin, setPin] = useState('')

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
      setAmount('0')
      setOperationOpen(false)
    } catch (e) {
      console.log(e)
    }
  }

  const isWithdrawValid = async (amount: string) => {
    setWithdrawAmounts({
      ...withdrawAmounts,
      loading: true,
    })
    try {
      const isWithdrawResponse = await axios.post(
        `${BACKEND_URL}/v1/operation/iswithdraw`,
        {
          lamports: Number(amount) * BASE_LAMPORTS,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const responseData = isWithdrawResponse.data
      if (responseData.status) {
        setWithdrawAmounts({
          lamports: responseData.lamports,
          fees: responseData.fees,
          valid: true,
          loading: false,
        })
      } else {
        setWithdrawAmounts({
          lamports: '0',
          fees: '0',
          valid: false,
          loading: false,
        })
      }
    } catch (e) {
      console.log(e)
      setWithdrawAmounts({
        lamports: '0',
        fees: '0',
        valid: false,
        loading: false,
      })
    }
  }

  const handleWithdrawHandler = async () => {
    try {
      await handleWithdraw(Number(amount) * BASE_LAMPORTS)
      setAmount('0')
      setWithdrawAmounts({
        lamports: '0',
        fees: '0',
        valid: false,
        loading: false,
      })
      setOperationOpen(false)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    // <Modal
    //   open={operationOpen}
    //   onClose={() => {
    //     setOperationOpen(false)
    //   }}
    //   style={{
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //   }}
    // >
    <Dialog
      open={operationOpen}
      onOpenChange={() => {
        setOperationOpen(!operationOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={!user?.upiId}
          type="button"
          onClick={() => {
            setOperationOpen(true)
          }}
        >
          Deposit/Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="flex items-center justify-center">
        <div
          className="flex h-full
                w-full flex-col items-center gap-3 p-4"
        >
          <div className="flex w-full items-center gap-2">
            <Button
              onClick={(e) => {
                e.preventDefault()
                setOperationType('DEPOSIT')
              }}
              // disabled={operationType === 'DEPOSIT'}
              type="button"
              className={`border-primary w-full border-[0.01rem] ${operationType === 'DEPOSIT' ? 'bg-primary/90 border-0' : 'bg-secondary'}`}
            >
              Deposit
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault()
                setOperationType('WITHDRAW')
                isWithdrawValid(amount)
              }}
              // disabled={operationType === 'WITHDRAW'}
              type="button"
              className={`border-primary w-full border-[0.01rem] ${operationType === 'WITHDRAW' ? 'bg-primary/90 border-0' : 'bg-secondary'}`}
            >
              Withdraw
            </Button>
          </div>
          <div className="flex w-full flex-col gap-2">
            <div className="relative w-full">
              <Input
                type="text"
                name="name"
                value={amount}
                disabled={false}
                className="w-full"
                onChange={(e) => {
                  if (isNaN(Number(e.target.value))) {
                    return
                  }
                  if (Number(e.target.value) < 0) {
                    return
                  }
                  if (operationType === 'WITHDRAW') {
                    isWithdrawValid(e.target.value)
                  }
                  setAmount(e.target.value)
                }}
              />
              <span
                className={`text-color3 bg-secondary absolute ${operationType === 'WITHDRAW' ? 'right-12' : 'right-0'} top-0 flex h-12 w-12 cursor-not-allowed items-center justify-center`}
              >
                SOL
              </span>
              {operationType === 'WITHDRAW' && (
                <span
                  className="text-color3 bg-secondary absolute bottom-0 right-0 flex h-12 w-12 cursor-pointer items-center justify-center"
                  onClick={() => {
                    isWithdrawValid(amount)
                    setAmount(
                      Math.floor(
                        parseInt(user?.walletBalance!) / BASE_LAMPORTS,
                      ).toString(),
                    )
                  }}
                >
                  Max
                </span>
              )}
            </div>
            {operationType === 'WITHDRAW' && (
              <div className="flex w-full flex-col gap-2">
                <div className="flex w-full items-center gap-2">
                  <span>
                    Sol: {parseInt(withdrawAmounts.lamports) / BASE_LAMPORTS}
                  </span>
                  <span>
                    Fees: {parseInt(withdrawAmounts.fees) / BASE_LAMPORTS}
                  </span>
                </div>
                <div className="flex w-full items-center gap-2">
                  <span>
                    Sol($):{' '}
                    {(
                      (parseInt(withdrawAmounts.lamports) / BASE_LAMPORTS) *
                      solPrice
                    ).toFixed(2)}
                  </span>
                  <span>
                    Fees($):{' '}
                    {(
                      (parseInt(withdrawAmounts.fees) / BASE_LAMPORTS) *
                      solPrice
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            {operationType === 'WITHDRAW' && withdrawAmounts.loading ? (
              <div className="bg-primary-dark flex h-10 w-full items-center justify-center">
                {/* <span className="text-background">Loading...</span> */}
                <CircularProgress color="primary" />
              </div>
            ) : (
              <AlertDialog
                open={closeDialog}
                onOpenChange={() => {
                  if (closeDialog) {
                    setCloseDialog(false)
                  }
                }}
              >
                <AlertDialogTrigger
                  onClick={() => {
                    setCloseDialog(true)
                  }}
                  asChild
                  disabled={
                    !isValidAmount(amount) &&
                    (operationType === 'DEPOSIT'
                      ? false
                      : !withdrawAmounts.valid)
                  }
                >
                  <Button
                    type="button"
                    className={`w-full ${isValidAmount(amount) ? 'bg-primary-dark' : 'bg-primary'}`}
                    disabled={
                      !isValidAmount(amount) &&
                      (operationType === 'DEPOSIT'
                        ? false
                        : !withdrawAmounts.valid)
                    }
                  >
                    Checkout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {operationType === 'DEPOSIT'
                        ? 'Are you sure you want to deposit?'
                        : 'Are you sure you want to withdraw?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white">
                      {amount + ' SOL'}
                    </AlertDialogDescription>
                    {operationType === 'WITHDRAW' && (
                      <AlertDialogDescription className="text-white">
                        <div className="flex w-full flex-col gap-2">
                          <div className="flex w-full items-center gap-2">
                            <span>
                              Sol:{' '}
                              {parseInt(withdrawAmounts.lamports) /
                                BASE_LAMPORTS}
                            </span>
                            <span>
                              Fees:{' '}
                              {parseInt(withdrawAmounts.fees) / BASE_LAMPORTS}
                            </span>
                          </div>
                          <div className="flex w-full items-center gap-2">
                            <span>
                              Sol($):{' '}
                              {(
                                (parseInt(withdrawAmounts.lamports) /
                                  BASE_LAMPORTS) *
                                solPrice
                              ).toFixed(2)}
                            </span>
                            <span>
                              Fees($):{' '}
                              {(
                                (parseInt(withdrawAmounts.fees) /
                                  BASE_LAMPORTS) *
                                solPrice
                              ).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </AlertDialogDescription>
                    )}
                    {walletType === WalletType.CUSTOM && (
                      <AlertDialogDescription className="flex items-center gap-2 text-white">
                        <Label>PIN:</Label>
                        <Input
                          value={pin}
                          onChange={(e) => {
                            if (e.target.value.length > 6) {
                              return
                            }
                            if (isNaN(Number(e.target.value))) {
                              return
                            }
                            setPin(e.target.value)
                          }}
                          name="pin"
                          type={'text'}
                          className="bg-secondary h-10 w-20 rounded-lg p-3 text-white outline-none"
                        />
                      </AlertDialogDescription>
                    )}
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async (e) => {
                        e.preventDefault()
                        setCloseDialog(false)
                        if (operationType === 'DEPOSIT') {
                          if (walletType === WalletType.DEFAULT) {
                            await handleDepositHandler({
                              pin: '',
                            })
                          } else {
                            await handleDepositHandler({
                              pin,
                            })
                          }
                        } else {
                          await handleWithdrawHandler()
                        }
                        setPin('')
                      }}
                    >
                      {operationType === 'DEPOSIT' ? 'Deposit' : 'Withdraw'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    // </Modal>
  )
}

export default OperationModal
