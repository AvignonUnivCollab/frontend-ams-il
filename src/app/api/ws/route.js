// app/api/ws/route.js
import WebSocket from "ws";

export async function GET(req) {
  const wss = new WebSocket.Server({ noServer: true });

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      // Traitez les messages ici, par exemple :
      // si le message est de type "video-sync", vous pouvez gérer la synchronisation des vidéos.
      console.log(message);
    });

    ws.send("Bienvenue dans la room!");
  });

  return new Response("WebSocket serveur en cours d'exécution", { status: 200 });
}
