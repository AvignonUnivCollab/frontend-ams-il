import React, { useState, useEffect, useRef, useCallback } from "react";
import YouTubePlayer from "./components/YoutubePlayer";
import "./App.css";

function extractYouTubeID(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
  } catch {
    return null;
  }
  return null;
}

function App() {
  const [socket, setSocket] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState(null);
  const [input, setInput] = useState("");
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [closingRoom, setClosingRoom] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [showJoinPanel, setShowJoinPanel] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState("");
  const [syncing, setSyncing] = useState(false);
  const videoId = extractYouTubeID(videoSrc);
  const isYouTube = Boolean(videoId);
  const mediaRef = useRef(null);
  const resetStates = useCallback(() => {
    setShowChat(false); 
    setIsFirstUser(false);
    setPseudo(null);
    setMessages([]);
    setInput("");
    setIsPlaying(false);
    setClosingRoom(false);
    setRoomClosed(false);
    setCurrentRoomId("");
    setShowJoinPanel(false);
    if (socket) {
      socket.close();
    }
    connectWebSocket();
  });

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    if (pathParts[1] === "room" && pathParts[2]) {
      setCurrentRoomId(pathParts[2]); // roomId dans l'URL → état React
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(JSON.stringify({ type: "getRooms" }));
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      setTimeout(connectWebSocket, 5000);
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        data = { message: event.data };
      }

      switch (data.type) {
        case "roomsList":
        case "room-info":
          setRoomName(data.roomName);
          setRoomDescription(data.roomDescription);
          setVideoSrc(data.videoURL);
        return;
        case undefined:
          if (data.roomsList) setRooms(data.roomsList);
          else if (data.message) setMessages(m => [...m, data.message]);
          break;

          case "video-sync":
            if (mediaRef.current) {
              setSyncing(true);
              const vid = mediaRef.current;
              if (data.isPlaying) vid.play();
              else                vid.pause();

              const now = vid.getCurrentTime();
              if (Math.abs(now - data.currentTime) > 0.5) {
                vid.seekTo(data.currentTime);
              }

              setIsPlaying(data.isPlaying);
              setTimeout(() => setSyncing(false), 0);
            }
          break;

          if (mediaRef.current) {
            const video = mediaRef.current;

            const syncVideo = async () => {
              try {
                if (data.isPlaying) {
                  await video.play();
                } else {
                  await video.pause();
                }

                setIsPlaying(data.isPlaying);

                if (Math.abs(video.getCurrentTime() - data.currentTime) > 1) {
                  video.seekTo(data.currentTime, true);
                }
              } catch (error) {
                console.warn("Erreur lors de la sync vidéo :", error);
              }
            };

            syncVideo();
          }
          break;

        case "room-closing":
          if (!closingRoom) {
            setClosingRoom(true);
            setMessages(m => [...m, "⚠️ Le salon fermera dans 3 s..."]);
          }
          break;

        case "room-closed":
          setRoomClosed(true);
          setMessages(m => [...m, "🔒 La room a été fermée."]);
          setTimeout(resetStates, 2000);
          break;

        case "firstUser":
          setIsFirstUser(true);
          console.log(">> Vous êtes l'owner");
          break;

        default:
          console.warn("Type inconnu:", data.type);
      }
    };

    setSocket(ws);
  }, [closingRoom, resetStates]);

  useEffect(() => {
    if (!socket || !currentRoomId || !isLoggedIn) return;
  
    socket.send(JSON.stringify({
      type: "join",
      userId: username,
      pseudo: pseudo,
      roomId: currentRoomId,
      createNew: false // ⚠️ très important : on ne recrée PAS la room
    }));
  }, [socket, currentRoomId, isLoggedIn]);  

  useEffect(() => {
    connectWebSocket();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const id = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "getRooms" }));
      }
    }, 3000);
    return () => clearInterval(id);
  }, [socket]);

  const generatePseudo = () => `user_${Math.floor(Math.random() * 100000)}`;
  
  const sendMessage = () => {
    if (!input.trim()) return;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageData = {
        type: "message",
        pseudo,
        message: input.trim(),
        roomId: currentRoomId,
      };
      socket.send(JSON.stringify(messageData));
      setInput("");
    } else {
      console.error("Socket non ouvert ou input vide");
    }
  };

  const login = () => {
    if (!username.trim()) {
      alert("Veuillez entrer un nom d'utilisateur");
      return;
    }
    const pseudoFromAPI = username.trim();
    setPseudo(pseudoFromAPI);
    setIsLoggedIn(true);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "getRooms" }));
    }
  };

  const createRoom = () => {
    if (!isLoggedIn) {
      alert("Seuls les utilisateurs connectés peuvent créer une room.");
      return;
    }
  
    if (!roomName.trim()) {
      alert("Veuillez entrer un nom pour le salon.");
      return;
    }
  
    const newRoomId = `room_${Date.now()}`;
    setCurrentRoomId(newRoomId);
    window.history.pushState(null, "", `/room/${newRoomId}`);
  
    let final;
    final = videoURL;

    if (videoFile) {
      final = URL.createObjectURL(videoFile);
    } else if (extractYouTubeID(videoURL)) {
      const id = extractYouTubeID(videoURL);
      final = `https://www.youtube.com/embed/${id}?enablejsapi=1&controls=0`;
    } else {
      final = videoURL;
    } setVideoSrc(final);
  
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "join",
        pseudo,
        userId: pseudo,
        roomId: newRoomId,
        createNew: true,
        roomName,
        roomDescription,
        videoURL: final,
      }));
  
      const detailsMessage = {
        type: "message",
        pseudo: "🛠️ Système",
        roomId: newRoomId,
        message: `📢 Salon "${roomName}" créé avec la description : "${roomDescription}" et la vidéo : ${final || "aucune vidéo définie."}`,
      };
      socket.send(JSON.stringify(detailsMessage));
    }
  
    setShowChat(true);
  };

  const joinRoom = (roomId) => {
    setCurrentRoomId(roomId);
    if (!isLoggedIn) {
      setPseudo(generatePseudo());
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "join",
          pseudo,
          userId: pseudo || generatePseudo(),
          roomId,
        })
      );
      setShowChat(true);
      setShowJoinPanel(false);
    }
  };

  const containerRef = useRef(null);

  const togglePlayPause = useCallback(() => {
    if (!mediaRef.current) return;
    if (syncing) return;
    const now = mediaRef.current.getCurrentTime();
    const next = !isPlaying;
    if (next) {
      mediaRef.current.play();
    } else {
      mediaRef.current.pause();
    }
  
    setIsPlaying(next);
  
    socket.send(JSON.stringify({
      type: "video-sync",
      isPlaying: next,
      currentTime: now,
      roomId: currentRoomId
    }));
  }, [socket, currentRoomId, isPlaying]);

  const closeRoom = () => {
    if (socket?.readyState === WebSocket.OPEN && currentRoomId) {
      socket.send(JSON.stringify({
        type: "close-room",
        roomId: currentRoomId,
        pseudo,
      }));
      console.log("🛑 Demande de fermeture envoyée");
    }
  };

  const quitRoom = () => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: "quit",
        pseudo,
        userId: pseudo,
        roomId: currentRoomId,
      }));
    }
    resetStates();
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .catch(err => console.error("Fullscreen error:", err));
    } else {
      document.exitFullscreen();
    }
  };

const handleQualityChange = (e) => {
  const quality = e.target.value;
  console.log(`Qualité sélectionnée: ${quality}p`);
};

const handleSpeedChange = (e) => {
  //Nothing much more here
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (showChat) {
    return (
      <div className="App">
        <header className="App-header"></header>
  
        {/* Alerte de pré‑fermeture */}
        {closingRoom && (
          <div className="room-warning-banner">
            ⚠️ Le salon fermera dans 3 secondes…
          </div>
        )}
  
        <div id="chat">
          <h1>Salon de discussion – {roomName}</h1>
  
          {/* Bouton “Fermer la Room” visible uniquement pour le créateur */}
          {isFirstUser && !roomClosed && !closingRoom && (
            <button className="close-room-btn" onClick={closeRoom}>
              &times; Fermer la Room
            </button>
          )}
  
          <div className="chat-content">
            <table>
              <tbody>
                <tr>
                  {/* Colonne vidéo */}
                  <td>
                  <div className="video-container">
                    {videoSrc ? (
                      <YouTubePlayer
                      ref={mediaRef}
                      src={videoSrc}
                      isOwner={isFirstUser}
                      playing={isPlaying}
                      onPlayPause={togglePlayPause}
                      />
                    ) : (
                      <p>Aucune vidéo à afficher</p>
                    )}
                  </div>
                    <div className="video-controls-panel">
                      <div className="video-description">
                        <p>{roomDescription}</p>
                      </div>

                      <div className="video-actions">
                        <div className="likes-dislikes">
                          <button className="like-button">👍</button>
                          <button className="dislike-button">👎</button>
                        </div>

                        <div className="video-options">
                          <button onClick={toggleFullScreen}>⛶ Plein écran</button>
                          <select onChange={handleQualityChange}>
                            <option value="1080">1080p</option>
                            <option value="720">720p</option>
                            <option value="480">480p</option>
                          </select>
                          <select onChange={handleSpeedChange}>
                            <option value="1">×1</option>
                            <option value="1.5">×1.5</option>
                            <option value="2">×2</option>
                            <option value="0.5">×0.5</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </td>
  
                  {/* Colonne chat */}
                  <td>
                    <div className="messages-container">
                      <div className="messages-list">
                        {messages.map((msg, index) => (
                          <p key={index} className="message">
                            {typeof msg === "string" ? msg : msg.message}
                          </p>
                        ))}
                      </div>
  
                      <div className="message-input-container">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Écris ton message…"
                          className="message-input"
                        />
                        <button className="send-btn" onClick={sendMessage}>
                          Envoyer
                        </button>
                      </div>
                    </div>
  
                    {/* Bouton quitter pour les non‑owners */}
                    <div className="controls">
                      {!isFirstUser && !closingRoom && !roomClosed && (
                        <button onClick={quitRoom}>Quitter la room</button>
                      )}
                    </div>
                    
                    {/* Message “room closed” */}
                    {roomClosed && (
                      <div className="controls">
                        <p>🔒 La room a été fermée par le propriétaire.</p>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

    return (
      <div className="App">
        <header className="App-header"></header>
        
        {!isLoggedIn ? (
          <div className="login-panels">
            {/* Panel Connexion Anonyme */}
            <div className="panel panel-anon">
              <h2>Connexion Anonyme</h2>
              <button
                className="join-btn"
                onClick={() => setShowJoinPanel(!showJoinPanel)}
              >
                Rejoindre un salon
              </button>
              {showJoinPanel && (
                <div className="join-panel">
                  {rooms.length > 0 ? (
                    <table className="rooms-table">
                      <thead>
                        <tr>
                          <th>ID Salon</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map((r) => (
                          <tr key={r}>
                            <td>{r}</td>
                            <td>
                              <button onClick={() => joinRoom(r)}>Join</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>Aucun salon existant.</p>
                  )}
                </div>
              )}
            </div>
  
            {/* Panel Connexion avec Compte */}
            <div className="panel panel-account">
              <h2>Connexion avec Compte</h2>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nom d'utilisateur"
                className="input-field"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="input-field"
                required
              />
              <button className="login-btn" onClick={login}>
                Se connecter
              </button>
            </div>
          </div>
        ) : (
          <div className="logged panel panel-account">
          <h2>Bienvenue {pseudo}</h2>
          <div className="menu">
                <div className="create-room-panel">
                  <h2>Créer un salon</h2>

                  <input
                    type="text"
                    placeholder="Nom du salon"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                  />

                  <textarea
                    placeholder="Description du salon"
                    value={roomDescription}
                    onChange={(e) => setRoomDescription(e.target.value)}
                  ></textarea>

                  <div className="video-source-choice">
                    <label>🎬 Vidéo à diffuser :</label>
                    <input
                      type="text"
                      placeholder="URL YouTube ou .mp4"
                      value={videoURL}
                      onChange={(e) => setVideoURL(e.target.value)}
                    />
                    <span className="or">ou</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files[0])}
                    />
                  </div>

                  <button onClick={createRoom}>Créer le salon</button>
                </div>
          </div>
          {showJoinPanel && (
            <div className="join-panel">
              <h3>Salons existants</h3>
              {rooms.length > 0 ? (
                <table className="rooms-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((room) => (
                      <tr key={room}>
                        <td>{room}</td>
                        <td>
                          <button className="login-btn" onClick={() => joinRoom(room)}>Join</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Aucun salon existant.</p>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    );
  
}

export default App;
