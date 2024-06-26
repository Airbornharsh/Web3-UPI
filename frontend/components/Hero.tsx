import { useLoader } from '@/context/LoaderContext'
import UpiList from './UpiList'
import { Button } from '@/components/ui/button'

export const Hero = () => {
  const { setQrCodeScanOpen } = useLoader()
  return (
    <div className="bg-secondary mt-20 flex max-w-fit flex-col items-center justify-center gap-2 rounded-lg p-10 pt-10 text-black">
      <Button
        onClick={() => {
          setQrCodeScanOpen(true)
        }}
        style={{
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
