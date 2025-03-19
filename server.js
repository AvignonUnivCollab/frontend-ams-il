const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

server.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`Client connecté depuis ${clientIp}`);

  ws.on('message', (data) => {
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      const broadcastMessage = `[${clientIp}] ${data}`;
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastMessage);
        }
      });
      return;
    }

    if (parsed.type && parsed.type === "video") {
      const messageToSend = JSON.stringify(parsed);
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageToSend);
        }
      });
    } else if (parsed.pseudo && parsed.message) {
      const broadcastMessage = `[${parsed.pseudo} - ${clientIp}] ${parsed.message}`;
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastMessage);
        }
      });
    } else {
      const broadcastMessage = `[${clientIp}] ${data}`;
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(broadcastMessage);
        }
      });
    }
  });

  ws.on('close', () => {
    console.log(`Client déconnecté: ${clientIp}`);
  });
});

console.log('Serveur WebSocket lancé sur le port 8080.');