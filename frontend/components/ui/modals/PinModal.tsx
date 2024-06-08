import { useLoader } from '@/context/LoaderContext'
import { Modal } from '@mui/material'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'

const PinModal = () => {
  const { openPin, setOpenPin } = useLoader()
  const [pin, setPin] = useState('')

  return (
    <Dialog
      open={openPin.open}
      onOpenChange={() => {
        if (openPin.open) {
          setOpenPin({ open: false, fn: () => {} })
          setPin('')
        }
      }}
    >
      <DialogContent>
        <form className="z-50 flex h-full w-full flex-col gap-2 rounded-lg bg-gray-100 px-6 py-4">
          <Label>PIN</Label>
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
      </DialogContent>
    </Dialog>
  )
}

export default PinModal
