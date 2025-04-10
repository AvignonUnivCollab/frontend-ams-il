"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router"; 
import { fetchData } from "../../../services/api";
import styles from "../../style/roompage.module.css";

export default function RoomPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false); 
  const [room, setRoom] = useState(null);
  const [message, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use useEffect to access the query param after component is mounted
  useEffect(() => {
    if (!isMounted) return; 
    const { roomId } = router.query; 

    if (!roomId) return; 

    const fetchRoom = async () => {
      const response = await fetchData(`rooms/${roomId}`);
      console.log(response);
      setRoom(response.room);
      setMessages(response.messages);
      setUsers(response.users);
      setPlaylist(response.playlist);
    };

    fetchRoom();
  }, [isMounted, router.query]); 

  if (!roomId) {
    return <p>Loading...</p>; 
  }

  return (
    <div className={styles["room-page"]}>
      <div className={styles["video-main"]}>
        <video id="main-video" className={styles["main-video"]} controls>
          <source src="video-url.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la balise vidéo.
        </video>
      </div>

      <div className={styles["room-content"]}>
        <div className={styles["video-thumbnails"]}>
          <h3>Vidéos Similaires</h3>
          <div className={styles["thumbnail-list"]}>
            {/* Miniatures des vidéos */}
            <div className={styles["thumbnail"]}>
              <img src="thumbnail1.jpg" alt="Video Thumbnail" />
              <p>Nom de la vidéo</p>
            </div>
            {/* Ajouter d'autres miniatures ici */}
          </div>
        </div>

        <div className={styles["right-sidebar"]}>
          <div className={styles["messages"]}>
            <h3>Messages</h3>
            <div className={styles["message-list"]}>
              {/* Liste des messages */}
              {message.map((msg, index) => (
                <div key={index} className={styles["message"]}>
                  <strong>{msg.user}</strong>: {msg.text}
                </div>
              ))}
            </div>
          </div>

          <div className={styles["playlist"]}>
            <h3>Playlist</h3>
            <ul>
              {playlist.map((video, index) => (
                <li key={index}>{video.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
