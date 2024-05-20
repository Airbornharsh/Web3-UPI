import React, { createContext, useContext, useState, ReactNode } from 'react'

interface LoaderContextProps {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  privateKey: string
  setPrivateKey: (privateKey: string) => void
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

  const contextValue: LoaderContextProps = {
    isLoading,
    setIsLoading,
    privateKey,
    setPrivateKey,
  }

  return (
    <LoaderContext.Provider value={contextValue}>
      {children}
    </LoaderContext.Provider>
  )
}
