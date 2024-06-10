import React, { useRef, useEffect, useState } from 'react'
import jsQR from 'jsqr'
import { decryptMessage } from '@/utils/encrypt'
import { useRouter } from 'next/navigation'
import { useLoader } from '@/context/LoaderContext'
import { URL } from '@/utils/config'

const QrCodeReader: React.FC = () => {
  const { setErrorToastMessage } = useLoader()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrCodeData, setQrCodeData] = useState<string>('')

  const router = useRouter()

  useEffect(() => {
    const constraints = {
      video: {
        facingMode: 'environment',
      },
    }

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.play()
        requestAnimationFrame(tick)
      }
    })

    const tick = () => {
      if (
        videoRef.current &&
        videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA
      ) {
        if (canvasRef.current) {
          const canvas = canvasRef.current.getContext('2d')
          if (canvas) {
            canvas.drawImage(
              videoRef.current,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height,
            )
            const imageData = canvas.getImageData(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height,
            )
            const code = jsQR(imageData.data, imageData.width, imageData.height)

            if (code) {
              setQrCodeData(code.data)
            }
          }
        }
      }
      requestAnimationFrame(tick)
    }
  }, [])

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
      console.log(e)
      if (e.response.data.message) setErrorToastMessage(e.response.data.message)
      else setErrorToastMessage('Something went wrong')
    }
  }

  return (
    <div className="h-screen w-screen">
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}

export default QrCodeReader
