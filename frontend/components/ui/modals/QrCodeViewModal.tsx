import QrCodeCreate from '@/components/QrCode/QrCodeCreate'
import { useLoader } from '@/context/LoaderContext'
import { Modal } from '@mui/material'

const QrCodeViewModal = () => {
  const { qrCodeOpenData, setQrCodeOpenData } = useLoader()

  return (
    <Modal
      open={qrCodeOpenData !== ''}
      onClose={() => setQrCodeOpenData('')}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <QrCodeCreate text={qrCodeOpenData} />
    </Modal>
  )
}

export default QrCodeViewModal
