// server.js
const WebSocket = require('ws');

const PORT = 3000;
const wss = new WebSocket.Server({ port: PORT });

let clients = {}; // Dạng: { roomId: [client1, client2] }

wss.on('connection', function connection(ws) {
  console.log('Client connected');

  ws.on('message', function incoming(message) {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      console.error('Invalid JSON:', message);
      return;
    }

    const { type, roomId, payload } = data;

    switch (type) {
      case 'join':
        if (!clients[roomId]) clients[roomId] = [];
        clients[roomId].push(ws);
        console.log(`Client joined room ${roomId}`);
        break;

      case 'signal':
        const peers = clients[roomId] || [];
        peers.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'signal', payload }));
          }
        });
        break;

      default:
        console.log('Unknown message type:', type);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    // Xóa client khỏi tất cả room
    for (let room in clients) {
      clients[room] = clients[room].filter(c => c !== ws);
      if (clients[room].length === 0) delete clients[room];
    }
  });
});

console.log(`Signaling server running on ws://localhost:${PORT}`);
