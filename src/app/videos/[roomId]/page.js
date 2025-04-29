"use client";

<<<<<<< Updated upstream
import { useEffect, useState, use } from "react";
import { fetchData } from "../../../../services/api"; 
import styles from "../../../style/roompage.module.css";
=======
import { useEffect, useState, use, useRef  } from "react";
import { fetchData, postData } from "../../../../services/api"; 
import styles from "../../../style/roompage.module.css";
import { FaTrashAlt, FaHeart, FaRegHeart } from 'react-icons/fa';

>>>>>>> Stashed changes

export default function RoomPage({ params }) {
  const { roomId } = use(params);

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState(""); // Nouveau message à écrire

  // Référence pour scroller jusqu'au dernier message
  const messagesEndRef = useRef(null);

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

<<<<<<< Updated upstream
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const fakeNewMessage = {
      id: Date.now(), // Juste un id unique local
      sender: "Moi", // On peut améliorer avec le vrai user plus tard
      content: newMessage,
    };

    setMessages((prevMessages) => [...prevMessages, fakeNewMessage]);
    setNewMessage(""); // Vide l'input après envoi
=======
  // Fonction pour envoyer un message
  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    try {
      const response = await postData(`send-message/${roomId}`, { message });

      if (response && response.data) {
        const newMessage = {
          id: Date.now(), 
          sender: response.data.sender.name,
          content: response.data.content,
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage("");  // Vide l'input après envoi
      } else {
        console.error("Erreur lors de l'envoi du message : Pas de réponse du serveur.");
      }
    } catch (error) {
      console.error("Erreur de la requête ", error);
    }
  };

  // Fonction pour obtenir les initiales de l'utilisateur
  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0];
    return words[0][0] + words[1][0];
  };

  // Convertir l'URL de la vidéo en format embeddable YouTube
  const convertToEmbedUrl = (url) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=0&controls=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1`;
    }
    return url;
  };

  // Ajouter une vidéo à la playlist
  const addVideoToPlaylist = async (videoId) => {
    try {
      const result = await postData(`playlists/add-video/${roomId}`, { video_id: videoId });
      console.log(result);
    } catch (error) {
      console.error("Erreur de la requête ", error);
    }
  };

  // Vérifier si une vidéo est déjà dans la playlist
  const isInPlaylist = (videoId) => {
    return playlist.some(video => video.id === videoId);
  };

  // Supprimer une vidéo de la playlist
  const handleRemoveVideo = (videoId) => {
    setPlaylist(playlist.filter((video) => video.id !== videoId));
  };

  // Quitter la room
  const leaveRoom = async () => {
    try {
      setLeaving((prev) => ({ ...prev, [roomId]: true }));
      const result = await postData(`room/${roomId}/leave`); // Send request to leave the room
      if (result && result.data != null) {
        // Comportement après avoir quitté la room, par exemple rediriger l'utilisateur
      } else {
        throw new Error("Échec du départ de la room");
      }
    } catch (error) {
      console.error("Erreur en quittant la room", error);
    } finally {
      setLeaving((prev) => ({ ...prev, [roomId]: false }));
    }
  };

  // Défilement automatique des messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
>>>>>>> Stashed changes
  };

  // Écouteur pour appuyer sur "Enter" pour envoyer un message
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && message.trim()) {
      handleSendMessage();
    }
  };

  useEffect(() => {
    scrollToBottom();  // Défile automatiquement vers le bas
  }, [messages]);

  if (loading) return <p>Chargement de la salle...</p>;
  if (!room) return <p>Erreur : Salle introuvable.</p>;

  return (
<<<<<<< Updated upstream
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      {/* Titre de la salle */}
      <h1 className="text-3xl font-bold text-center mb-6 text-purple-700">
        {room.name}
      </h1>
=======
    <div className="flex flex-col min-h-screen bg-gray-100 p-0">
      {/* Navbar secondaire pour quitter la salle */}
      <div className="w-full bg-white shadow-md p-4 flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-purple-700">{room.name}</h2>
        <button
          onClick={leaveRoom} // Redirige vers l'accueil
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Quitter le Salon
        </button>
      </div>
>>>>>>> Stashed changes

      {/* Partie principale */}
      <div className="flex flex-1 gap-6">
        {/* Partie vidéo */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
<<<<<<< Updated upstream
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
=======
          {room.current_video?.video ? (
            <iframe
              className="rounded-lg w-full max-w-4xl mb-3"
              height="500"
              src={convertToEmbedUrl(room.current_video.video)}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <p>Vidéo non disponible</p>
          )}

          <div className="w-full mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-purple-700">{room.current_video.title}</h1>
              <button
                onClick={() => addVideoToPlaylist(room.current_video.id)}
                disabled={isInPlaylist(room.current_video.id)}
                className={`text-2xl ${isInPlaylist(room.current_video.id) ? "text-red-500" : "text-gray-400"} hover:text-red-600 transition`}
              >
                {isInPlaylist(room.current_video.id) ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
              </button>
            </div>

            {room.current_video.description && (
              <p className="text-gray-600">{room.current_video.description}</p>
            )}

            {room.current_video.created_at && (
              <i className="mt-2">Publié il y a {room.current_video.created_at} jours</i>
            )}
          </div>
        </div>

        {/* Partie Chat */}
>>>>>>> Stashed changes
        <div className="w-80 bg-white rounded-lg shadow-lg p-4 flex flex-col">
          <h3 className="text-xl font-semibold mb-2 text-purple-700">Messages</h3>
          <div className="flex-1 overflow-y-auto space-y-3 p-2">
            {messages.length > 0 ? (
              messages.map((msg) => (
<<<<<<< Updated upstream
                <div
                  key={msg.id}
                  className="bg-purple-100 p-2 rounded animate-fade-in"
                >
                  <strong>{msg.sender}</strong>: {msg.content}
=======
                <div key={msg.id} className="bg-purple-100 p-2 rounded animate-fade-in">
                  <strong>{msg.sender}</strong>
                  <p>{msg.content}</p>
>>>>>>> Stashed changes
                </div>
              ))
            ) : (
              <p className="text-gray-500">Pas de messages.</p>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input pour envoyer un message */}
          <div className="flex mt-4">
            <input
              type="text"
<<<<<<< Updated upstream
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
=======
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress} // Ajouter l'écouteur de la touche "Enter"
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

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

=======
>>>>>>> Stashed changes
        </div>
      </div>
    </div>
  );
}
