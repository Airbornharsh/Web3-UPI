import { User } from '@/utils/types'
import { useEffect, useState } from 'react'
import { Input } from '../ui/input'
import axios from 'axios'
import { BACKEND_URL } from '@/utils/config'
import Item from './Item'
import { useAuth } from '@/context/AuthContext'

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
      const responseData = response.data
      setUserList(responseData.users ?? [])
    } catch (e) {
      console.log(e)
      setUserList([])
    }
  }

  useEffect(() => {
    fetchUserList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upiId])

  return (
    <div>
      <div className="">
        <Input onChange={setUpiId} value={upiId} placeHolder={'Upi Id'} />
      </div>
      <div>
        <div>
          {userList.map((user, index) => {
            return (
              <Item
                key={index.toString() + user.walletAddress}
                user={user}
                index={index}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default UpiList
