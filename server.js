const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
console.log('🚀 Signaling server started on ws://localhost:8080');

// Lưu tất cả client đang kết nối, dạng: { clientId: ws }
const clients = new Map();

// Nhận kết nối mới
wss.on('connection', function connection(ws) {
  // Gán ID tạm thời
  const clientId = generateId();
  clients.set(clientId, ws);

  // Gửi lại cho client ID của chính nó
  ws.send(JSON.stringify({ type: 'welcome', clientId }));

  console.log(`✅ New client connected: ${clientId}`);

  // Khi nhận dữ liệu từ client
  ws.on('message', function incoming(message) {
    let data;
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.error('❌ Invalid JSON:', err);
      return;
    }

    const { type, to, payload } = data;

    if (type === 'signal') {
      const target = clients.get(to);
      if (target) {
        target.send(JSON.stringify({
          type: 'signal',
          from: clientId,
          payload
        }));
      } else {
        console.warn(`⚠️ Target ${to} not found`);
      }
    }
  });

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`❎ Client disconnected: ${clientId}`);
  });
});

// Hàm tạo ID ngẫu nhiên
function generateId() {
  return Math.random().toString(36).substring(2, 10);
}
