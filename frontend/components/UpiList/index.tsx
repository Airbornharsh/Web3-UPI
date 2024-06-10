import { useEffect, useState } from 'react'
import axios from 'axios'
import { BACKEND_URL } from '@/utils/config'
import Item from './Item'
import { useAuth } from '@/context/AuthContext'
import { Input } from '@/components/ui/input'
import { User } from '@/utils/types'

const UpiList = () => {
  const [userList, setUserList] = useState<User[]>([])
  const [upiId, setUpiId] = useState<string>('')
  const { token } = useAuth()

  const fetchUserList = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/v1/txn/upiId?upiId=${upiId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
      setUserList(response.data.users ?? [])
    } catch (error) {
      console.error(error)
      setUserList([])
    }
  }

  useEffect(() => {
    if (upiId) {
      fetchUserList()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upiId])

  return (
    <div className="rounded-lg p-4 shadow-md">
      <div className="relative">
        <Input
          onChange={(e) => setUpiId(e.target.value)}
          value={upiId}
          placeholder="Enter UPI ID"
          name="upiId"
          className="mb-4 border-[0.01rem] "
        />
        <span
          className={`text-color3 bg-secondary absolute right-0 top-0 flex h-12 w-12 cursor-not-allowed items-center justify-center border-y-[0.01rem] border-r-[0.01rem] px-8 text-gray-500`}
        >
          @wpi
        </span>
      </div>
      <div className="space-y-4">
        {userList.map((user, index) => (
          <Item key={`${index}-${user.walletAddress}`} user={user} />
        ))}
      </div>
    </div>
  )
}

export default UpiList
