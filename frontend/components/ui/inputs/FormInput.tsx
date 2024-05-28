import React from 'react'

interface FormInputProps {
  value: string
  onChange?: (val: any) => void
  name: string
  type?: 'text' | 'password' | 'number'
  className?: string
  disabled?: boolean
  placeHolder?: string
}

const FormInput: React.FC<FormInputProps> = ({
  onChange,
  value,
  name,
  className,
  disabled,
  type,
  placeHolder,
}) => {
  return (
    <input
      type={type}
      name={name}
      className={`bg-background rounded p-2 outline-none ${disabled ? 'cursor-not-allowed' : ''} ${className}`}
      value={value}
      disabled={disabled}
      placeholder={placeHolder}
      onChange={(e) => {
        if (onChange) onChange(e.target.value)
      }}
    />
  )
}

export default FormInput
