// server.js
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

/** Structure des salons :
 * rooms[roomId] = {
 *   ownerId: socket.id,
 *   meta: { name, desc, url, source },
 *   users: Set<socket.id>,
 *   closed: boolean,
 *   state: { isPlaying: boolean, currentTime: number }
 * }
 */
let rooms = {};

function broadcastRoomsList() {
  const list = Object.entries(rooms)
    .filter(([_, r]) => !r.closed)
    .map(([id, r]) => ({ id, meta: r.meta }));
  io.emit("rooms-list", list);
}

io.on("connection", (socket) => {
  console.log(`🔌 Client connecté: ${socket.id}`);

  // 1) Demande/rafraîchissement liste salons
  socket.on("get-rooms", broadcastRoomsList);

  // 2) Création de salon
  socket.on("create-room", ({ roomId, meta }) => {
    rooms[roomId] = {
      ownerId: socket.id,
      meta,
      users: new Set([socket.id]),
      closed: false,
      state: { isPlaying: false, currentTime: 0 },
    };
    socket.join(roomId);
    socket.emit("room-created", { roomId, meta });
    broadcastRoomsList();
    console.log("🏠 create-room:", roomId, meta);
  });

  // 3) Rejoindre salon
  socket.on("join-room", ({ roomId, pseudo }) => {
    const room = rooms[roomId];
    if (!room || room.closed) {
      socket.emit("room-error", "Salon introuvable ou fermé");
      return;
    }
    // si vide → nouveau propriétaire
    if (room.users.size === 0) {
      room.ownerId = socket.id;
      io.to(roomId).emit("new-owner", { newOwnerId: socket.id });
    }
    room.users.add(socket.id);
    socket.join(roomId);

    // renvoyer meta + état vidéo
    socket.emit("room-created", { roomId, meta: room.meta });
    socket.emit("video-sync", room.state);

    io.to(roomId).emit("user-joined", { pseudo, userId: socket.id });
    console.log("🔗 join-room:", pseudo, "=>", roomId);
  });

  // 4) Quitter salon
  socket.on("leave-room", ({ roomId, pseudo }) => {
    const room = rooms[roomId];
    if (!room) return;
    room.users.delete(socket.id);
    socket.leave(roomId);
    io.to(roomId).emit("user-left", { pseudo });

    // réassigner si proprio part
    if (room.ownerId === socket.id) {
      const next = Array.from(room.users.values())[0];
      if (next) {
        room.ownerId = next;
        io.to(roomId).emit("new-owner", { newOwnerId: next });
      }
    }
    console.log("🚪 leave-room:", pseudo, roomId);
  });

  // 5) Chat
  socket.on("message", ({ roomId, pseudo, text }) => {
    io.to(roomId).emit("message", { pseudo, text, time: Date.now() });
    console.log("✉️ message:", pseudo, text);
  });

  // 6) Synchronisation vidéo
  socket.on("video-sync", ({ roomId, isPlaying, currentTime }) => {
    const room = rooms[roomId];
    if (!room) return;
    // seul le proprio peut émettre
    if (socket.id !== room.ownerId) {
      console.warn("⚠️ Ignoré video-sync d’un non-owner", socket.id);
      return;
    }
    room.state = { isPlaying, currentTime };
    io.to(roomId).emit("video-sync", room.state);
    console.log("📡 video-sync reçu:", roomId, room.state);
  });

  // 7) Fermeture salon
  socket.on("close-room", (roomId) => {
    const room = rooms[roomId];
    if (room && socket.id === room.ownerId) {
      room.closed = true;
      io.to(roomId).emit("room-closed", "Le maître a fermé la room");
      broadcastRoomsList();
      setTimeout(() => {
        delete rooms[roomId];
        io.in(roomId).socketsLeave(roomId);
        broadcastRoomsList();
      }, 5000);
      console.log("🔒 close-room:", roomId);
    }
  });

  // 8) Déconnexion brusque
  socket.on("disconnecting", () => {
    for (let rid of socket.rooms) {
      const room = rooms[rid];
      if (room) {
        room.users.delete(socket.id);
        if (room.ownerId === socket.id && !room.closed) {
          room.closed = true;
          io.to(rid).emit("room-closed", "Le maître a quitté, salon fermé");
          broadcastRoomsList();
          delete rooms[rid];
        }
      }
    }
    console.log(`❌ Client déconnecté: ${socket.id}`);
  });
});

httpServer.listen(8080, () =>
  console.log("⚡️ Socket.IO server sur :8080")
);
