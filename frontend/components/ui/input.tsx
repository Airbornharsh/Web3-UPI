'use client'
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
      className={`w-[90vw] max-w-56 rounded border-[0.01rem] border-cyan-400 p-2 text-cyan-700 outline-none ${className}`}
      value={value}
      placeholder={placeHolder}
      type={type}
      onChange={(e) => {
        onChange(e.target.value)
      }}
    />
  )
}
