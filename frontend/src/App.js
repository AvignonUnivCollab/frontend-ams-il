// App.js
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import CreateRoomForm from "./components/CreateRoomForm";
import LecteurYoutube from "./components/LecteurYoutube";
import "./App.css";

const SOCKET_URL = "http://localhost:8080";

function extractYouTubeID(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname.includes("youtu.be"))     return u.pathname.slice(1);
  } catch {
    return null;
  }
  return null;
}

function App() {
  const [socket, setSocket]     = useState(null);
  const [step, setStep]         = useState("login");
  const [pseudo, setPseudo]     = useState("");
  const [isGuest, setIsGuest]   = useState(false);
  const [rooms, setRooms]       = useState([]);
  const [roomMeta, setRoomMeta] = useState(null);
  const [roomId, setRoomId]     = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [joinId, setJoinId]     = useState("");
  const videoRef                = useRef(null);
  const [owner, setOwner]       = useState(false);
  const ytPlayerRef             = useRef(null);

  useEffect(() => {
    console.debug("🔧 Initialisation du socket...");
    const s = io(SOCKET_URL, { transports: ['polling', 'websocket'] });
    setSocket(s);

    s.on("connect", () => console.debug("✅ Socket connecté:", s.id));
    s.on("disconnect", (r) => console.debug("⛔ Socket déconnecté:", r));
    s.on("connect_error", (err) => console.error("❌ Erreur socket:", err));

    s.on("rooms-list", (list) => setRooms(list));

    s.on("room-created", ({ roomId: rid, meta }) => {
      console.debug("🏠 Salon créé/joint:", rid, meta);
      if (meta.source === "youtube") {
        const id = extractYouTubeID(meta.url);
        if (id) {
          meta.url = `https://www.youtube.com/embed/${id}?enablejsapi=1`;
        }
      }
      setRoomId(rid);
      setRoomMeta(meta);
      setMessages([]);

      if (meta.source === "mp4") {
        console.debug("▶ Demande état vidéo pour", rid);
        s.emit("get-room-state", { roomId: rid });
      }
    });

    s.on("room-state", ({ isPlaying, currentTime }) => {
      console.debug("📡 room-state reçu:", isPlaying, currentTime);
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
        isPlaying ? videoRef.current.play() : videoRef.current.pause();
      }
    });

    s.on("message", (msg) => setMessages((m) => [...m, msg]));

    s.on("user-joined", ({ pseudo: p, userId }) => {
      console.debug(`👤 ${p} (${userId}) a rejoint`);
      setMessages((m) => [...m, { pseudo: "***", text: `${p} a rejoint` }]);

      if (owner && roomMeta?.source === "mp4" && videoRef.current && userId !== s.id) {
        const st = {
          roomId,
          isPlaying: !videoRef.current.paused,
          currentTime: videoRef.current.currentTime,
        };
        console.debug("🔄 Rebroadcast video-sync:", st);
        s.emit("video-sync", st);
      }
    });

    s.on("user-left", ({ pseudo: p }) =>
      setMessages((m) => [...m, { pseudo: "***", text: `${p} a quitté` }])
    );

    s.on("new-owner", ({ newOwnerId }) => {
      console.debug("🔑 new-owner:", newOwnerId);
      if (s.id === newOwnerId) {
        setOwner(true);
        alert("🎉 Tu es le nouveau propriétaire !");
      }
    });

    s.on("video-sync", ({ isPlaying, currentTime }) => {
      console.debug("📡 video-sync reçu:", isPlaying, currentTime);
      if (roomMeta?.source === "mp4" && videoRef.current) {
        videoRef.current.currentTime = currentTime;
        isPlaying ? videoRef.current.play() : videoRef.current.pause();
      }
      if (roomMeta?.source === "youtube" && ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(currentTime, true);
        isPlaying
          ? ytPlayerRef.current.playVideo()
          : ytPlayerRef.current.pauseVideo();
      }
    });

    s.on("room-error", (err) => alert(err));
    s.on("room-closed", (msg) => {
      alert(msg);
      resetToLobby();
    });


    s.emit("get-rooms");
    const iv = setInterval(() => s.emit("get-rooms"), 5000);

    return () => {
      clearInterval(iv);
      s.disconnect();
      console.debug("🔌 Déconnexion socket");
    };

  }, []);

  // --- helpers ---
  const resetToLobby = () => {
    setStep("lobby");
    setOwner(false);
    setMessages([]);
    setRoomId("");
    setRoomMeta(null);
  };

  const handleLogin = (asGuest) => {
    const p = asGuest ? `user_${Date.now()}` : pseudo.trim();
    if (!p) return alert("Pseudo requis");
    setPseudo(p);
    setIsGuest(asGuest);
    setStep("lobby");
  };

  const createRoom = (meta) => {
    if (isGuest) return alert("🚫 Seuls les membres authentifiés peuvent créer");
    const id = `room_${Date.now()}`;
    setOwner(true);
    socket.emit("create-room", { roomId: id, meta });
    setStep("chat");
  };

  const joinRoom = (id = null) => {
    const rid = id ?? joinId.trim();
    if (!rid) return alert("ID requis");
    if (!rooms.find((r) => r.id === rid)) return alert("Salon inexistant");
    setOwner(false);
    socket.emit("join-room", { roomId: rid, pseudo });
    setStep("chat");
  };

  const leaveRoom = () => {
    socket.emit("leave-room", { roomId, pseudo });
    resetToLobby();
  };

  const sendMsg = () => {
    if (!input.trim()) return;
    socket.emit("message", { roomId, pseudo, text: input });
    setInput("");
  };

  const togglePlay = async () => {
    if (roomMeta?.source !== "mp4" || !videoRef.current) return;
    const v = videoRef.current;
    try {
      if (v.paused) {
        await v.play();
        if (owner) {
          socket.emit("video-sync", { roomId, isPlaying: true, currentTime: v.currentTime });
        }
      } else {
        v.pause();
        if (owner) {
          socket.emit("video-sync", { roomId, isPlaying: false, currentTime: v.currentTime });
        }
      }
    } catch (e) {
      console.warn("⚠️ play() interrompu :", e);
    }
  };

  return (
    <div className="App">
      {step === "login" && (
        <div className="login-panel">
          <h2>Connexion</h2>
          <input placeholder="Pseudo" value={pseudo} onChange={(e) => setPseudo(e.target.value)} />
          <button onClick={() => handleLogin(false)}>Login</button>
          <h2>ou</h2>
          <button onClick={() => handleLogin(true)}>Join Anonyme</button>
        </div>
      )}

      {step === "lobby" && (
        <div className="lobby-panel">
          <h2>Salons existants</h2>
          <ul className="rooms-list">
            {rooms.map((r) => (
              <li key={r.id}>
                <b>{r.id}</b> – {r.meta.name}
                <button onClick={() => joinRoom(r.id)}>Rejoindre</button>
              </li>
            ))}
          </ul>
          <button disabled={isGuest} onClick={() => setStep("create")}>
            Créer un salon
          </button>
          <hr />
          <input placeholder="ID de salon" value={joinId} onChange={(e) => setJoinId(e.target.value)} />
          <button onClick={() => joinRoom()}>Rejoindre</button>
        </div>
      )}

      {step === "create" && (
        <CreateRoomForm onCancel={() => setStep("lobby")} onCreate={createRoom} />
      )}

      {step === "chat" && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>Salon : <b>{roomId}</b></span>
            <button onClick={leaveRoom}>Quitter</button>
            {owner && <button onClick={() => socket.emit("close-room", roomId)}>Fermer Salon</button>}
          </div>

          <div className="video-area">
            {roomMeta?.source === "youtube" ? (
              <LecteurYoutube
                url={roomMeta.url}
                socket={socket}
                roomId={roomId}
                isOwner={owner}
                playerRef={ytPlayerRef}
              />
            ) : roomMeta?.source === "mp4" ? (
              <video ref={videoRef} controls style={{ width: "100%" }}>
                <source src={roomMeta.url} type="video/mp4" />
              </video>
            ) : (
              <div style={{ color: "red" }}>
                <strong>Erreur</strong> : Source inconnue.
              </div>
            )}
            {owner && roomMeta?.source === "mp4" && (
              <button onClick={togglePlay}>Play/Pause</button>
            )}
          </div>

          <div className="messages">
            {messages.map((m, i) => (
              <p key={i}>
                <b>{m.pseudo}</b>: {m.text}
              </p>
            ))}
          </div>

          <div className="input-fixed">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMsg()}
              placeholder="Écris un message..."
            />
            <button onClick={sendMsg}>Envoyer</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
