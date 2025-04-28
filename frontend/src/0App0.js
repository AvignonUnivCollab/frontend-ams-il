import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [socket, setSocket] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState(null);
  const [input, setInput] = useState("");
  const videoRef = useRef(null);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);

  // Établit la connexion WebSocket au montage du composant
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    // Gestion de la réception de messages
    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (e) {
        data = { message: event.data };
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);

      } else if (data.type === "video-sync") {
        // Synchroniser la vidéo
        if (videoRef.current) {
          if (data.isPlaying) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
          if (Math.abs(videoRef.current.currentTime - data.currentTime) > 1) {
            videoRef.current.currentTime = data.currentTime;
          }
        }

      } else if (data.type === "room-closed") {
        // Fermeture de la room
        setRoomClosed(true);
        setMessages((prev) => [
          ...prev,
          "La room a été fermée par le maître de la room.",
        ]);

      } else if (data.type === "firstUser") {
        // On est le maître uniquement si l'utilisateur n'a jamais été owner auparavant
        if (!localStorage.getItem("wasOwner")) {
          setIsFirstUser(true);
          localStorage.setItem("wasOwner", "true");
          console.log(">> Vous êtes le premier utilisateur (maître de la room) <<");
        } else {
          // L'utilisateur a déjà été owner, on le force en mode participant
          setIsFirstUser(false);
          console.log("Vous rejoignez en tant que participant.");
        }
      }
      // Tu peux aussi gérer "quit" reçu depuis les autres users
      // ex: if(data.type === "quit") { ... afficher un message 'X a quitté la room' }
    };

    setSocket(ws);
    return () => {
      ws.close();
    };
  }, []);

  // Génère un pseudo aléatoire pour la connexion anonyme
  const generatePseudo = () => `user_${Math.floor(Math.random() * 100000)}`;

  // Envoi d’un message de chat
  const sendMessage = () => {
    if (!input.trim()) return;

    if (socket && socket.readyState === WebSocket.OPEN) {
      const messageData = { type: "message", pseudo, message: input.trim() };
      socket.send(JSON.stringify(messageData));
      setInput("");
    } else {
      console.error("Socket non ouvert ou input vide");
    }
  };

  // Rejoindre en anonyme
  const joinAnonymously = () => {
    const pseudoGenerated = generatePseudo();
    setPseudo(pseudoGenerated);
    setShowChat(true);

    if (localStorage.getItem("wasOwner")) {
      console.log("Vous avez déjà été maître, vous rejoignez en tant que participant.");
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "join", pseudo: pseudoGenerated }));
    } else {
      setTimeout(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "join", pseudo: pseudoGenerated }));
        }
      }, 500);
    }
  };

  // Connexion avec compte (simulation)
  const login = async () => {
    if (!username.trim()) {
      alert("Veuillez entrer un nom d'utilisateur");
      return;
    }
    const pseudoFromAPI = username.trim();
    setPseudo(pseudoFromAPI);
    setShowChat(true);

    if (localStorage.getItem("wasOwner")) {
      console.log("Vous avez déjà été maître, vous rejoignez en tant que participant.");
    }

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "join", pseudo: pseudoFromAPI }));
    } else {
      setTimeout(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "join", pseudo: pseudoFromAPI }));
        }
      }, 500);
    }
  };

  // Play/Pause => le maître de la room diffuse l’état de lecture
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

    // On envoie aux autres l’état actuel de la vidéo
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "video-sync",
          isPlaying: nextIsPlaying,
          currentTime: videoRef.current.currentTime,
        })
      );
    }
  };

  // Fermer la room (pour le maître uniquement)
  const closeRoom = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "room-closed" }));
    }
    setRoomClosed(true);
    setMessages((prev) => [...prev, "Vous avez fermé la room."]);
  };

  // === Nouveau : Quitter la room sans la fermer ===
  const quitRoom = () => {
    // Envoie au serveur qu’on quitte (optionnel, si tu veux diffuser "X a quitté")
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "quit", pseudo }));
      socket.close();
    }

    // On revient à l'écran de login
    setShowChat(false);
    setIsFirstUser(false);
    setPseudo(null);
    setMessages([]);
    setInput("");
    setIsPlaying(false);
    setRoomClosed(false);
    
    window.location.reload();
  };

  // Gère les touches dans l’input => envoi au press "Enter"
  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // === Si la room est fermée, on affiche un écran spécial ===
  if (roomClosed) {
    return (
      <div className="App">
        <header className="App-header"></header>
        <div className="room-closed-screen">
          <h2>La room a été fermée.</h2>
          <button onClick={() => window.location.reload()}>
            Créer/Rejoindre une nouvelle room
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header"></header>

      {!showChat ? (
        // Écran de login
        <div className="login-container">
          <table>
            <tbody>
              <tr>
                <td className="panel">
                  <h2>Connexion Anonyme</h2>
                  <button className="join-btn" onClick={joinAnonymously}>
                    Join
                  </button>
                </td>
                <td className="panel">
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
                    Login
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        // Écran de chat
        <div id="chat">
          <h1>Salon de discussion</h1>

          {/* Bouton du maître (croix rouge) seulement si isFirstUser */}
          {isFirstUser && !roomClosed && (
            <button className="close-room-btn" onClick={closeRoom}>
              &times;
            </button>
          )}

          <div className="chat-content">
            <table>
              <tbody>
                <tr>
                  <td>
                    {/* Zone vidéo */}
                    <div className="video-container">
                      <video ref={videoRef} width="400">
                        <source
                          src="https://www.w3schools.com/html/mov_bbb.mp4"
                          type="video/mp4"
                        />
                        Ton navigateur ne supporte pas la vidéo.
                      </video>

                      {/* Bouton Play/Pause au centre, visible si maître */}
                      {isFirstUser && !roomClosed && (
                        <button
                          className="overlay-play-btn"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? "⏸" : "▶"}
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    {/* Zone chat */}
                    <div className="messages-container">
                      <div className="messages-list">
                        {messages.map((msg, index) => (
                          <p key={index} className="message">
                            {msg}
                          </p>
                        ))}
                      </div>

                      <div className="message-input-container">
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Écris ton message..."
                          className="message-input"
                          onKeyDown={handleKeyDown}
                        />
                        <button className="send-btn" onClick={sendMessage}>
                          Envoyer
                        </button>
                      </div>
                    </div>

                    {/* Contrôles utilisateur */}
                    <div className="controls">
                      {/* Le maître a déjà "closeRoom" + "togglePlayPause" */}
                      {/* Les autres peuvent quitter (mais pas fermer) */}
                      {!isFirstUser && (
                        <button onClick={quitRoom}>Quitter la room</button>
                      )}
                    </div>

                    {/* Affichage si la room a été fermée */}
                    {roomClosed && (
                      <div className="controls">
                        <p>La room a été fermée par le maître de la room.</p>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;