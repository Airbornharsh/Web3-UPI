import WebSocketManager from './WebsocketManager'

class WebSocketServer {
  constructor(server: any) {
    const wsManager = WebSocketManager.getInstance()
    wsManager.initialize(server)
  }
}

export default WebSocketServer
