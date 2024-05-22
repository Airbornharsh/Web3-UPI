import LoaderModal from '@/components/ui/modals/LoaderModal'
import PinModal from '@/components/ui/modals/PinModal'
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ToastContainer, toast } from 'react-toastify'

interface LoaderContextProps {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  privateKey: string
  setPrivateKey: (privateKey: string) => void
  openPin: {
    open: boolean
    fn: Function
  }
  setOpenPin: ({ open, fn }: { open: boolean; fn: Function }) => void
  setToastMessage: (message: string) => void
  setErrorToastMessage: (message: string) => void
}

const LoaderContext = createContext<LoaderContextProps | undefined>(undefined)

export const useLoader = () => {
  const context = useContext(LoaderContext)

  if (!context) {
    throw new Error('userLoader must be used within a LoaderProvider')
  }

  return context
}

interface LoaderContextProviderProps {
  children: ReactNode
}

export const LoaderProvider: React.FC<LoaderContextProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [privateKey, setPrivateKey] = useState<string>('')

  const [openPin, setOpenPin] = useState<{
    open: boolean
    fn: Function
  }>({
    open: false,
    fn: () => void 0,
  })

  const setToastMessage = (message: string) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  const setErrorToastMessage = (message: string) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 2000,
    })
  }

  const contextValue: LoaderContextProps = {
    isLoading,
    setIsLoading,
    privateKey,
    setPrivateKey,
    openPin,
    setOpenPin,
    setToastMessage,
    setErrorToastMessage,
  }

  return (
    <LoaderContext.Provider value={contextValue}>
      {children}
      <LoaderModal />
      <PinModal />
      <ToastContainer />
    </LoaderContext.Provider>
  )
}
