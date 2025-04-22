import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";

function App() {
  const [socket, setSocket] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState(null);
  const [input, setInput] = useState("");
  const videoRef = useRef(null);

  const [isFirstUser, setIsFirstUser] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [closingRoom, setClosingRoom] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [showJoinPanel, setShowJoinPanel] = useState(false);

  // Réinitialiser tout pour revenir au menu
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

  // 1) Connexion WebSocket (montage)
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
        case undefined:
          if (data.roomsList) setRooms(data.roomsList);
          else if (data.message) setMessages(m => [...m, data.message]);
          break;

        case "video-sync":
          if (videoRef.current) {
            data.isPlaying ? videoRef.current.play() : videoRef.current.pause();
            setIsPlaying(data.isPlaying);
            if (Math.abs(videoRef.current.currentTime - data.currentTime) > 1) {
              videoRef.current.currentTime = data.currentTime;
            }
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
    connectWebSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // on le lance une fois

  // 2) Rafraîchissement des salons toutes les 3 s (dépend de socket)
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

  // Connexion avec compte (pour voir le bouton de création)
  const login = () => {
    if (!username.trim()) {
      alert("Veuillez entrer un nom d'utilisateur");
      return;
    }
    const pseudoFromAPI = username.trim();
    setPseudo(pseudoFromAPI);
    setIsLoggedIn(true);
    // Une fois connecté, on actualise la liste des salons
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "getRooms" }));
    }
  };

  // Créer un salon (accessible uniquement aux utilisateurs connectés)
  const createRoom = () => {
    if (!isLoggedIn) {
      alert("Seuls les utilisateurs connectés peuvent créer une room.");
      return;
    }
    const newRoomId = `room_${Date.now()}`;
    setCurrentRoomId(newRoomId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "join",
          pseudo,
          userId: pseudo,
          roomId: newRoomId,
          createNew: true,
        })
      );
      setShowChat(true);
    }
  };

  // Rejoindre un salon existant via sa roomId
  const joinRoom = (roomId) => {
    setCurrentRoomId(roomId);
    // Pour un utilisateur anonyme, on génère un pseudo
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
      setShowJoinPanel(false); // masquer le panel une fois que l'utilisateur a rejoint
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    let nextIsPlaying;
    if (videoRef.current.paused) {
      videoRef.current.play();
      nextIsPlaying = true;
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      nextIsPlaying = false;
      setIsPlaying(false);
    }
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "video-sync",
          isPlaying: nextIsPlaying,
          currentTime: videoRef.current.currentTime,
          roomId: currentRoomId,
        })
      );
    }
  };

  // Fermer la room (owner)
  const closeRoom = () => {
    if (socket?.readyState === WebSocket.OPEN && currentRoomId) {
      socket.send(JSON.stringify({
        type: "close-room",
        roomId: currentRoomId,
        pseudo,
      }));
      // ** Ne pas appeler resetStates() ici ** : on attend room-closed
      console.log("🛑 Demande de fermeture envoyée");
    }
  };

  // Quitter sans fermer
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
          <h1>Salon de discussion – {currentRoomId}</h1>
  
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
                      <video ref={videoRef} width="400">
                        <source
                          src="https://www.w3schools.com/html/mov_bbb.mp4"
                          type="video/mp4"
                        />
                        Votre navigateur ne supporte pas la vidéo.
                      </video>
  
                      {/* Contrôle Play/Pause pour l’owner */}
                      {isFirstUser && !roomClosed && !closingRoom && (
                        <button
                          className="overlay-play-btn"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? "⏸" : "▶"}
                        </button>
                      )}
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

    // Écran principal (menu) avec authentification et panels côte à côte
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
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="input-field"
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
            <button className="login-btn" onClick={() => setShowJoinPanel(true)}>Join a room</button>
            <button className="create-room-btn login-btn" onClick={createRoom}>
              Créer un salon
            </button>
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

/*
<div className="logged">
          <h2>Bienvenue {pseudo}</h2>
          <div className="menu">
            <button onClick={() => setShowJoinPanel(true)}>Join a room</button>
            <button className="create-room-btn" onClick={createRoom}>
              Créer un salon
            </button>
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
                          <button onClick={() => joinRoom(room)}>Join</button>
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
*/