import React from 'react'

interface FormLabelProps {
  name: string
  className?: string
}

const FormLabel: React.FC<FormLabelProps> = ({ className, name }) => {
  return (
    <label className={`text-primary font-semibold ${className}`}>{name}</label>
  )
}

export default FormLabel
