const WebSocket = require("ws");
const userSessions = new Map();

const server = new WebSocket.Server({ port: 8080 });

server.on("connection", (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`Client connecté depuis ${clientIp}`);

  let userId = null;
  let pseudo = null;
  let roomId = null;

  ws.on("message", (rawData) => {
    let data;
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      broadcastMessage(`[${clientIp}] ${rawData}`, roomId);
      return;
    }

    switch (data.type) {
      case "getRooms":
        // Récupération des roomId uniques
        const rooms = [...new Set(Array.from(userSessions.values()).map(session => session.roomId))];
        ws.send(JSON.stringify({ roomsList: rooms }));
        break;

      case "join":
        userId = data.userId;
        pseudo = data.pseudo || "User_" + Math.floor(Math.random() * 10000);
        roomId = data.roomId || "default";
        // Vérifier si aucun utilisateur n'est déjà présent dans la room donnée
        let isFirst = true;
        for (let session of userSessions.values()) {
          if (session.roomId === roomId) {
            isFirst = false;
            break;
          }
        }
        if (isFirst && data.createNew) {
          console.log(`>> Premier utilisateur dans la room ${roomId} <<`);
          ws.send(JSON.stringify({ type: "firstUser" }));
        }
        userSessions.set(userId, { ws, pseudo, roomId });
        broadcastMessage(`${pseudo} a rejoint la salle de discussion.`, roomId);
        break;

      case "message":
        if (pseudo && data.message) {
          broadcastMessage(`[${pseudo}] ${data.message}`, roomId);
        }
        break;

      case "video-sync":
        broadcastJSON(
          {
            type: "video-sync",
            isPlaying: data.isPlaying,
            currentTime: data.currentTime,
          },
          roomId
        );
        break;

      case "quit":
        if (data.userId && userSessions.has(data.userId)) {
          userSessions.delete(data.userId);
          broadcastMessage(`${data.pseudo} a quitté la room sans la fermer.`, roomId);
        }
        break;

        case 'close-room':
          broadcastJSON({ type: 'room-closing', message: 'Le salon va fermer dans 5 secondes.' }, roomId);
          setTimeout(() => {
            broadcastJSON({ type: 'room-closed', message: 'La room a été fermée par le propriétaire.' }, roomId);
            for (let [uid, session] of userSessions.entries()) {
              if (session.roomId === roomId) {
                session.ws.close();
                userSessions.delete(uid);
              }
            }
            console.log(`>>> Room ${roomId} fermée, sessions vidées et connexions fermées <<<`);
          }, 3000);
        break;
          

      default:
        console.log("Type de message inconnu :", data);
        break;
    }
  });

  ws.on("close", () => {
    console.log(`Client déconnecté: ${clientIp}`);
    if (userId && userSessions.has(userId)) {
      broadcastMessage(`${pseudo} a quitté la salle de discussion.`, roomId);
      userSessions.delete(userId);
    }
  });
});

function broadcastMessage(message, roomId) {
  console.log(">> broadcastMessage:", message);
  for (let session of userSessions.values()) {
    if (session.roomId === roomId && session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(JSON.stringify({ message }));
    }
  }
}

function broadcastJSON(obj, roomId) {
  const jsonString = JSON.stringify(obj);
  console.log(">> broadcastJSON:", jsonString);
  for (let session of userSessions.values()) {
    if (session.roomId === roomId && session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(jsonString);
    }
  }
}

console.log("Serveur WebSocket lancé sur le port 8080.")