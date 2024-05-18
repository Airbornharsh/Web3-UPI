import { User } from '@/utils/types'
import { useRouter } from 'next/navigation'
import React from 'react'

interface ItemProps {
  user: User
  index: number
}

const Item: React.FC<ItemProps> = ({ user, index }) => {
  const router = useRouter()
  return (
    <div
      className={`flex flex-col px-2 py-1 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-100'}`}
      onClick={() => {
        router.push(`/${user.upiId}`)
      }}
    >
      <h1 className="">{user.name}</h1>
      <h2 className="text-sm">
        Address: {user.walletAddress?.toString().slice(0, 6)}...
        {user.walletAddress?.toString().slice(-6)}
      </h2>
      <h3 className="text-sm">UpiId: {user.upiId}</h3>
    </div>
  )
}

export default Item
