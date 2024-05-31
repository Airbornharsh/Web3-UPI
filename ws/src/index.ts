import WebSocket from 'ws'

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    console.log(`Received message => ${message}`)
    ws.send(`Hello, you sent => ${message}`)
  })
  ws.send('Hello, I am a WebSocket server')
})
