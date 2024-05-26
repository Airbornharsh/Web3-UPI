import { useLoader } from '@/context/LoaderContext'
import { Modal } from '@mui/material'
import React, { useState } from 'react'

const PinModal = () => {
  const { openPin, setOpenPin } = useLoader()
  const [pin, setPin] = useState('')

  return (
    <Modal
      open={openPin.open}
      onClose={() => {
        setOpenPin({ open: false, fn: () => {} })
        setPin('')
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <form className="flex flex-col gap-1 rounded bg-gray-100 px-6 py-4">
        <label className="font-semibold">Pin:</label>
        <input
          type="text"
          name="upiId"
          className="rounded border border-slate-400 border-opacity-50 p-2 outline-none focus:border-opacity-100"
          value={pin}
          onChange={(e) => {
            if (e.target.value.length > 6) {
              return
            }
            if (isNaN(Number(e.target.value))) {
              return
            }
            setPin(e.target.value)
          }}
        />
        <button
          className="rounded bg-blue-500 p-2 text-white"
          onClick={(e) => {
            e.preventDefault()
            openPin.fn(pin)
            setPin('')
            setOpenPin({ open: false, fn: () => {} })
          }}
          disabled={!(pin.length === 6)}
        >
          Submit
        </button>
      </form>
    </Modal>
  )
}

export default PinModal
