import WebSocket from 'ws'
import { parseWsObjectToString } from '../utils/ws'
import { authParser } from '../middleware'

class WebSocketManager {
  private static instance: WebSocketManager
  private wss!: WebSocket.Server
  private walletConnections: Map<string, WebSocket>

  private constructor() {
    this.walletConnections = new Map()
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager()
    }
    return WebSocketManager.instance
  }

  public initialize(server: any) {
    this.wss = new WebSocket.Server({ server })
    this.setupConnectionHandlers()
  }

  private setupConnectionHandlers() {
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const decodedUser = authParser(req.url)

      if (!decodedUser) {
        ws.close(1008, 'Unauthorized')
        return
      }

      if (this.walletConnections.has(decodedUser['walletAddress'])) {
        ws.close(1008, 'Connection already exists')
        return
      }

      if (!decodedUser['walletAddress']) {
        ws.close(1008, 'Unauthorized')
        return
      }

      console.log('New client connected', decodedUser['walletAddress'])

      // Generate a unique ID for the connection
      this.walletConnections.set(decodedUser['walletAddress'], ws)

      ws.on('message', (message: string) => {
        console.log(`Received message: ${message}`)
        this.broadcast(message)
      })

      ws.on('close', () => {
        console.log('Client disconnected')
        this.walletConnections.delete(decodedUser['walletAddress'])
      })

      ws.send(
        JSON.stringify({
          type: 'connection-id',
          id: decodedUser['walletAddress'],
        }),
      )
    })
  }

  public getConnection(walletAddress: string): WebSocket | undefined {
    return this.walletConnections.get(walletAddress)
  }

  public getAllConnections(): Map<string, WebSocket> {
    return this.walletConnections
  }

  public broadcast(message: string): void {
    this.walletConnections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
  }

  public async broadcastTo(
    data: {
      type: string
      data: any
    },
    walletAddress: string,
  ): Promise<void> {
    const parsedData = parseWsObjectToString(data)
    console.log('Broadcasting to', walletAddress, parsedData)
    const ws = this.walletConnections.get(walletAddress)
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(parsedData)
    }
  }
}

export default WebSocketManager
