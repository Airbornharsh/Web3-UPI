import { useRouter } from 'next/navigation'
import React from 'react'
import { User } from '@/utils/types'

interface ItemProps {
  user: User
}

const Item: React.FC<ItemProps> = ({ user }) => {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/pay?upiId=${user.upiId}`)
  }

  return (
    <div
      className="border-primary hover:bg-primary/60 flex cursor-pointer flex-col rounded-lg border-[0.01rem] bg-transparent p-4 text-white shadow-sm transition duration-200 ease-in-out"
      onClick={handleClick}
    >
      <h1 className="text-lg font-semibold">{user.name}</h1>
      <h2 className="text-xs">
        Address: {user.walletAddress.slice(0, 6)}...
        {user.walletAddress.slice(-6)}
      </h2>
      <h3 className="text-xs">UPI ID: {user.upiId}@wpi</h3>
    </div>
  )
}

export default Item
