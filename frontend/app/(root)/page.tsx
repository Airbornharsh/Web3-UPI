'use client'
import { Hero } from '@/components/Hero'
import { useAuth } from '@/context/AuthContext'
import { useCustomWallet } from '@/context/CustomWalletContext'
import { useLoader } from '@/context/LoaderContext'
import { BACKEND_URL } from '@/utils/config'
import { Button } from '@mui/material'
import axios from 'axios'

export default function Home() {
  const { setToastMessage, setErrorToastMessage } = useLoader()
  const { publicKey, updateBalance } = useCustomWallet()
  const { token } = useAuth()

  const claimSol = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/v1/claim/sol`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const responseData = response.data
      if (!responseData.status) {
        throw new Error(responseData.message)
      }
      updateBalance()
      setToastMessage('Claimed 1 Sol')
    } catch (e: any) {
      console.error(e)
      setErrorToastMessage(e.toString())
    }
  }
  return (
    <main className="flex flex-col items-center justify-center">
      {publicKey && (
        <Button
          onClick={claimSol}
          className="bg-primary hover:bg-primary-dark text-background mt-6"
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
          }}
        >
          Claim 1 Sol for Testing
        </Button>
      )}
      <Hero />
    </main>
  )
}
