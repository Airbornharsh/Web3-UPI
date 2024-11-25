import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from './AuthContext'
import { useLoader } from './LoaderContext'

interface WebSocketContextProps {
  socket: WebSocket | null
  isConnected: boolean
  reconnect: () => void
}

const WebSocketContext = React.createContext<WebSocketContextProps | undefined>(
  undefined,
)

export const useWebSocket = () => {
  const context = React.useContext(WebSocketContext)
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider')
  }
  return context
}

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { token, isAuthenticated } = useAuth()
  const { setToastMessage } = useLoader()
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const reconnectAttempts = useRef(0)
  const MAX_RECONNECT_ATTEMPTS = 5

  const createWebSocket = () => {
    if (!isAuthenticated || !token) return null

    console.log(process.env.NEXT_PUBLIC_WS_URL)
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`)

    ws.onopen = () => {
      console.log('WebSocket connection established')
      setIsConnected(true)
      reconnectAttempts.current = 0
    }

    ws.onclose = (event) => {
      console.log('WebSocket connection closed', event)
      setIsConnected(false)
      attemptReconnect()
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }))
      }

      if (data.type === 'message') {
        console.log('Message received:', data.data)
        setToastMessage(data.data.toString())
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error', error)
      setIsConnected(false)
    }

    return ws
  }

  const attemptReconnect = () => {
    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts.current += 1
      const timeout = Math.pow(2, reconnectAttempts.current) * 1000
      setTimeout(reconnect, timeout)
    }
  }

  const reconnect = () => {
    if (socket) {
      socket.close()
    }
    const newSocket = createWebSocket()
    if (newSocket) {
      setSocket(newSocket)
    }
  }

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = createWebSocket()
      if (newSocket) {
        setSocket(newSocket)
      }

      return () => {
        if (newSocket) {
          newSocket.close()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token])

  const contextValue: WebSocketContextProps = {
    socket,
    isConnected,
    reconnect,
  }

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  )
}
