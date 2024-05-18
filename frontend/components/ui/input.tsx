import React from 'react'

interface InputProps {
  value: string
  placeHolder: string
  onChange: (val: any) => void
  type?: string
  className?: string
}

export const Input: React.FC<InputProps> = ({
  value,
  placeHolder,
  onChange,
  type = 'text',
  className = '',
}) => {
  return (
    <input
      className={`border-2 border-gray-400 max-w-56 w-[90vw] p-2 ${className}`}
      value={value}
      placeholder={placeHolder}
      type={type}
      onChange={(e) => {
        onChange(e.target.value)
      }}
    />
  )
}
