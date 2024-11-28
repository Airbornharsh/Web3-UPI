import QrCodeReader from '@/components/QrCode/QrCodeReader'
import { useLoader } from '@/context/LoaderContext'
import { CloseRounded } from '@mui/icons-material'
import { Modal } from '@mui/material'

const QrScanModal = () => {
  const { qrCodeScanOpen, setQrCodeScanOpen } = useLoader()
  
  return (
    <Modal
      open={qrCodeScanOpen}
      onClose={() => setQrCodeScanOpen(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="relative">
        <QrCodeReader />
        <CloseRounded
          onClick={() => setQrCodeScanOpen(false)}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            cursor: 'pointer',
            color: 'white',
          }}
        />
      </div>
    </Modal>
  )
}

export default QrScanModal