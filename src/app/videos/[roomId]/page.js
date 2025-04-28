"use client";

import { useEffect, useState, use } from "react";
import { fetchData, postData } from "../../../../services/api"; 
import styles from "../../../style/roompage.module.css";
import YouTubePlayer from "../../components/YouTubePlayer";
import Pusher from "pusher-js";
import { FaTrashAlt, FaHeart, FaRegHeart  } from 'react-icons/fa';

export default function RoomPage({ params }) {
  const { roomId } = use(params);

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [host, setHost] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(""); // Nouveau message à écrire

  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        const response = await fetchData(`rooms/${roomId}`);
        console.log(response);
        if (response) {
          setRoom(response.data);
          setMessages(response.data.messages || []);
          setUsers(response.data.users || []);
          setVideos(response.data.videos || []);
          setPlaylist(response.data.playlist.videos || []);
          setHost(response.data.host);
        }
      } catch (error) {
        if (error.response && error.response.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000; // défaut à 60 secondes
          console.warn(`Trop de requêtes. Réessai dans ${waitTime / 1000} secondes.`);
          setTimeout(fetchRoom, waitTime);
        } else {
          console.error("Erreur lors du fetch de la room :", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
       
  }, []);


  useEffect(() => {
       // Remplace avec ta vraie clé Pusher
       const pusher = new Pusher("84f95918f7b347312787", {
        app_id : "1966250",
        secret : "7ad9e3cbf19e5b49c023",
        cluster: "eu",
      });

      const channel = pusher.subscribe(`room-${roomId}`);

      channel.bind("message-sent", function (data) {
        setMessages((prev) => [...prev, data]);
      });

      channel.bind("video-added", function (data) {
        setPlaylist((prev) => [...prev, data.video]);
      });
        // Nettoyage quand on quitte la page
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
        pusher.disconnect();
      };
    
  }, []);

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    try {
      const response = await postData(`send-message/${roomId}`, { message });

      console.log(response);
      const newMessage = {
        id: Date.now(), 
        sender: response.data.sender.name,
        content: response.data.content,
      };

      if(response) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setMessage(""); 
      } else {
        console.error("Erreur lors du message :", error);
      }
    }catch(error) {
      console.error("Erreur de la requete ", error);
    }
  };


  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0];
    return words[0][0] + words[1][0];
  };
  
  const convertToEmbedUrl = (url) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=0&controls=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1`;
    }
    return url;
  };

  const addVideoToPlaylist = async (videoId) => {
     try {
      console.log(videoId);
        const result = await postData(`playlists/add-video/${roomId}`, { videoId });
        console.log(result);

     }catch(error) {
      console.error("Erreur de la requete ", error);
     }
  };

  
  const isInPlaylist = (videoId) => {
    return playlist.some(video => video.id === videoId);
  };

  
  const handleRemoveVideo = (videoId) => {
    setPlaylist(playlist.filter((video) => video.id !== videoId));
  };

  if (loading) return <p>Chargement de la salle...</p>;
  if (!room) return <p>Erreur : Salle introuvable.</p>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-0">
      {/* Titre de la salle */}
      {/* Navbar secondaire pour quitter la salle */}
      <div className="w-full bg-white shadow-md p-4 flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-purple-700"></h2>
        <button
          onClick={() => window.location.href = '/'} // redirige vers l'accueil
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Quitter le Salon
        </button>
      </div>

      {/* Partie principale */}
      <div className="flex flex-1 gap-6">
        
        {/* Partie vidéo */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-4 flex flex-col">
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
                  <i className="mt-2">Publier il ya {room.current_video.created_at} jours</i>
              )}
            </div>


          {/* Playlist */}
          <div className="mt-6 w-full">
            <h3 className="text-xl font-semibold mb-4">Vidéos Similaires</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {videos.length > 0 ? (
                videos.map((video, index) => (
                  <div key={index} className="rounded-lg overflow-hidden shadow-sl hover:shadow-lg transition">
                     <iframe
                        className="w-full h-38 object-cover" 
                        height="100"
                        src={convertToEmbedUrl(video.video)}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>

                    <div className="mt-3 font-medium bold">{video.title}</div>
                    <i className="">Publier il ya {video.created_at} jours</i>

                  </div>
                ))
              ) : (
                <p>Aucune vidéo disponible.</p>
              )}
            </div>
          </div>
        </div>

        {/* Partie membres et playlist */}
          <div className="w-120 flex flex-col gap-4">

            {/* Bloc Membres */}
            <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
              <h3 className="text-xl font-semibold mb-2 text-purple-700">Host</h3>
              <p key={host.id} className="text-gray-700">{host.name}</p>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Membres du salon</h3>
                <div className="flex flex-wrap gap-2">
                  {users.slice(0, 9).map((user) => (
                    <div
                      key={user.id}
                      className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md"
                    >
                      {getInitials(user.name)}
                    </div>
                  ))}
                  {users.length > 9 && (
                    <div className="w-10 h-10 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      +{users.length - 9}
                    </div>
                  )}
                </div>
              </div>
            </div>

              {/* Bloc Playlist */}
              <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
                <h3 className="text-lg font-semibold mb-2 text-purple-700">Playlist</h3>
                <div className="space-y-2">
                  {playlist.length > 0 ? (
                    playlist.map((video, index) => (
                      <div key={index} className="flex items-center gap-2">
                       <iframe
                        className="w-small h-18 object-cover" 
                        width="150"
                        height="80"
                        src={convertToEmbedUrl(video.video)}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                          {/* <img src={video.thumbnail || "/default-thumbnail.jpg"} alt={video.title} className="w-12 h-12 object-cover rounded" /> */}
                        <span className="text-gray-700 text-sm">{video.title}</span>

                        {/* Icône de suppression */}
                      <button
                        onClick={() => handleRemoveVideo(video.id)} // Appel de la fonction pour supprimer la vidéo
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrashAlt /> {/* Affichage de l'icône */}
                      </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">Aucune vidéo dans la playlist.</p>
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
                  <strong>{msg.sender}</strong>
                  <p>{msg.content}</p>
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écris un message..."
              className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={handleSendMessage}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 rounded-r">
              Envoyer
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
