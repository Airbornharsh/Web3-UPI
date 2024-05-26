import React from 'react'
import QRCode from 'qrcode.react'
import { URL } from '@/utils/config'

const QrCodeCreate: React.FC<{
  text: string
}> = ({ text }) => {
  return (
    <div className="flex flex-col items-center gap-2 rounded bg-white p-4">
      <QRCode value={text} />
      <div>
        <span className="text-sm font-semibold text-gray-700">UPI ID: </span>
        <span className="text-sm font-semibold text-gray-700">
          {text.split(URL + '/pay?upiId=')[1].split('&')[0]}
        </span>
      </div>
    </div>
  )
}

export default QrCodeCreate
