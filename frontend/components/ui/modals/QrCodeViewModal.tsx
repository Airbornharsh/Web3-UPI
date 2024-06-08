import QrCodeCreate from '@/components/QrCode/QrCodeCreate'
import { useLoader } from '@/context/LoaderContext'
import { Modal } from '@mui/material'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '../button'
import { useAuth } from '@/context/AuthContext'
import { URL } from '@/utils/config'

const QrCodeViewModal = () => {
  const { qrCodeOpenData, setQrCodeOpenData } = useLoader()
  const { user } = useAuth()

  return (
    <Dialog
      open={qrCodeOpenData !== ''}
      onOpenChange={() => {
        if (qrCodeOpenData) {
          setQrCodeOpenData('')
        }
      }}
    >
      <DialogTrigger>
        <Button
          disabled={!user?.upiId}
          type="button"
          onClick={() => {
            setQrCodeOpenData(`${URL}/pay?upiId=${user?.upiId}`)
          }}
          className="w-full"
        >
          Show QR
        </Button>
      </DialogTrigger>
      <DialogContent>
        <QrCodeCreate text={qrCodeOpenData} />
      </DialogContent>
    </Dialog>
  )
}

export default QrCodeViewModal
