import React, { useRef, useEffect, useState } from 'react'
import { BrowserQRCodeReader, Exception } from '@zxing/library'
import { useRouter } from 'next/navigation'
import { useLoader } from '@/context/LoaderContext'
import { URL } from '@/utils/config'

const QrCodeScanner: React.FC = () => {
  const { setErrorToastMessage } = useLoader()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState<boolean>(true)
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null)

  const router = useRouter()

  useEffect(() => {
    // Initialize code reader
    codeReaderRef.current = new BrowserQRCodeReader()

    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    }

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.setAttribute('playsinline', 'true')
          videoRef.current.play()

          // Start continuous scanning
          startScanning()
        }
      })
      .catch((err) => {
        console.error('Error accessing camera', err)
        setErrorToastMessage('Unable to access camera')
      })

    // Cleanup function
    return () => {
      codeReaderRef.current?.reset()
      codeReaderRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setErrorToastMessage])

  const startScanning = () => {
    if (videoRef.current && codeReaderRef.current && scanning) {
      codeReaderRef.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, error) => {
          if (result) {
            setScanning(false)
            setQrCodeData(result.getText())
          }
          if (error) {
            console.error('Error scanning QR code', error)
          }
        },
      )
    }
  }

  useEffect(() => {
    if (qrCodeData) {
      handleQrData(qrCodeData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCodeData])

  const handleQrData = async (data: string) => {
    try {
      const redirectData = data.split(URL)[1]
      router.push(`${redirectData}`)
    } catch (e: any) {
      console.error(e)
      if (e.response?.data?.message) {
        setErrorToastMessage(e.response.data.message)
      } else {
        setErrorToastMessage('Something went wrong')
      }
      // Reset scanning after error
      setScanning(true)
    }
  }

  const resetScanner = () => {
    setScanning(true)
    setQrCodeData('')
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center bg-black">
      {/* Video Stream */}
      <video
        ref={videoRef}
        className="absolute left-0 top-0 h-full w-full object-cover"
      />

      {/* Scanning Frame */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative aspect-square w-4/5 max-w-md">
          {/* Corner Markers */}
          <div className="absolute left-0 top-0 h-16 w-16 border-l-4 border-t-4 border-white"></div>
          <div className="absolute right-0 top-0 h-16 w-16 border-r-4 border-t-4 border-white"></div>
          <div className="absolute bottom-0 left-0 h-16 w-16 border-b-4 border-l-4 border-white"></div>
          <div className="absolute bottom-0 right-0 h-16 w-16 border-b-4 border-r-4 border-white"></div>

          {/* Scan Area Overlay */}
          <div className="absolute inset-0 rounded-xl border-4 border-white/50"></div>
        </div>
      </div>

      {/* Result or Retry Area */}
      {!scanning && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <button
            onClick={resetScanner}
            className="rounded-lg bg-white/80 px-6 py-3 text-black shadow-md transition-colors hover:bg-white"
          >
            Scan Another QR Code
          </button>
        </div>
      )}
    </div>
  )
}

export default QrCodeScanner
