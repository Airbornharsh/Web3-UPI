import { useLoader } from '@/context/LoaderContext'
import { CircularProgress, Modal } from '@mui/material'

const LoaderModal = () => {
  const { isLoading } = useLoader()
  return (
    <Modal
      open={isLoading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Modal>
  )
}

export default LoaderModal
