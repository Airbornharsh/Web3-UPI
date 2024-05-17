import { useLoader } from '@/context/LoaderContext'
import { CircularProgress, Modal } from '@mui/material'
import React from 'react'

const Loader = () => {
  const { isLoading } = useLoader()

  return (
    <Modal open={isLoading}>
      <div className="h-screen w-screen flex justify-center items-center">
        <CircularProgress />
      </div>
    </Modal>
  )
}

export default Loader
