"use client";

import { useEffect, useState, use } from "react";
import { fetchData } from "../../../../services/api"; 
import styles from "../../../style/roompage.module.css";

export default function RoomPage({ params }) {
  const { roomId } = use(params);

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState(""); // Nouveau message à écrire

  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        const response = await fetchData(`rooms/${roomId}`);
        if (response) {
          setRoom(response.data);
          setMessages(response.data.messages || []);
          setUsers(response.data.users || []);
          setPlaylist(response.data.videos || []);
        }
      } catch (error) {
        console.error("Erreur lors du fetch de la room :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const fakeNewMessage = {
      id: Date.now(), // Juste un id unique local
      sender: "Moi", // On peut améliorer avec le vrai user plus tard
      content: newMessage,
    };

    setMessages((prevMessages) => [...prevMessages, fakeNewMessage]);
    setNewMessage(""); // Vide l'input après envoi
  };

  if (loading) return <p>Chargement de la salle...</p>;
  if (!room) return <p>Erreur : Salle introuvable.</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      {/* Titre de la salle */}
      <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">
        {room.name}
      </h1>

      {/* Partie principale */}
      <div className="flex flex-1 gap-6">
        
        {/* Partie vidéo */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
          <video id="main-video" className="rounded-lg w-full max-w-4xl" controls>
            <source src={room.current_video?.video || "video-url.mp4"} type="video/mp4" />
            Votre navigateur ne supporte pas la balise vidéo.
          </video>

          {/* Playlist */}
          <div className="mt-6 w-full">
            <h3 className="text-xl font-semibold mb-4">Vidéos Similaires</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {playlist.length > 0 ? (
                playlist.map((video, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition">
                    <img src={video.thumbnail || "/default-thumbnail.jpg"} alt={video.title} className="w-full h-32 object-cover" />
                    <div className="p-2 text-center font-medium">{video.title}</div>
                  </div>
                ))
              ) : (
                <p>Aucune vidéo disponible.</p>
              )}
            </div>
          </div>
        </div>

        {/* Partie chat + utilisateurs */}
        <div className="w-80 bg-white rounded-lg shadow-lg p-4 flex flex-col">
          {/* Chat Messages */}
          <h3 className="text-xl font-semibold mb-2 text-purple-700">Messages</h3>
          <div className="flex-1 overflow-y-auto space-y-3 p-2">
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-purple-100 p-2 rounded animate-fade-in"
                >
                  <strong>{msg.sender}</strong>: {msg.content}
                </div>
              ))
            ) : (
              <p className="text-gray-500">Pas de messages.</p>
            )}
          </div>

          {/* Input pour écrire */}
          <div className="flex mt-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écris un message..."
              className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={handleSendMessage}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 rounded-r"
            >
              Envoyer
            </button>
          </div>

          {/* Utilisateurs connectés */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-purple-700">Utilisateurs</h3>
            <ul className="space-y-1">
              {users.length > 0 ? (
                users.map((user) => (
                  <li key={user.id} className="text-gray-700">{user.name}</li>
                ))
              ) : (
                <li className="text-gray-500">Aucun utilisateur.</li>
              )}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
