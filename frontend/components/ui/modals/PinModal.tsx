import { useLoader } from '@/context/LoaderContext'
import { Modal } from '@mui/material'
import React, { useState } from 'react'
import FormLabel from '../labels/FormLabel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
      <form className="bg-secondary flex w-[90vw] max-w-[15rem] flex-col gap-2 rounded-lg bg-gray-100 px-6 py-4">
        <FormLabel name={'PIN'} />
        <Input
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
          name="pin"
          type={'text'}
        />
        <Button
          onClick={(e) => {
            e.preventDefault()
            openPin.fn(pin)
            setPin('')
            setOpenPin({ open: false, fn: () => {} })
          }}
          disabled={!pin.length || pin.length < 6}
          type="submit"
        >
          Submit
        </Button>
      </form>
    </Modal>
  )
}

export default PinModal
