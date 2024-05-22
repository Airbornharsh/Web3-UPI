import { useLoader } from '@/context/LoaderContext'
import UpiList from './UpiList'
import { Button } from '@mui/material'

export const Hero = () => {
  const { setQrCodeScanOpen } = useLoader()
  return (
    <div className="flex flex-col items-center justify-center gap-2 pt-10 text-black">
      <Button
        onClick={() => {
          setQrCodeScanOpen(true)
        }}
        style={{
          backgroundColor: '#f0f0f0',
          color: 'black',
          padding: '10px 20px',
          borderRadius: '10px',
        }}
      >
        Scan and Pay
      </Button>
      <UpiList />
    </div>
  )
}
