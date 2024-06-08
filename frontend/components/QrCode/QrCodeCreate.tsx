import React from 'react'
import QRCode from 'qrcode.react'
import { URL } from '@/utils/config'

const QrCodeCreate: React.FC<{
  text: string
}> = ({ text }) => {
  return (
    <div className="bg-secondary flex aspect-square h-full w-full flex-col items-center gap-2 rounded p-4">
      <span className="aspect-square w-[90%] border-[0.1rem]">
        <QRCode
          value={text}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </span>
      <div>
        <span className="text-sm font-semibold text-white">UPI ID: </span>
        <span className="text-sm font-semibold text-white">
          {text.split(URL + '/pay?upiId=')[1]?.split('&')[0]}
        </span>
      </div>
    </div>
  )
}

export default QrCodeCreate
