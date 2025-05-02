/* global YT */
import React, { useRef, useEffect, useState } from "react";
import { loadYouTubeAPI } from '../utils/youtubeApiLoader';

export default function LecteurYoutube({
  url,
  socket,
  roomId,
  isOwner,
  playerRef
}) {
  const iframeRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  // 1) Initialise le player une fois
  useEffect(() => {
    loadYouTubeAPI(() => {
      const id = extractVideoID(url);
      if (!id) return console.error("URL YouTube invalide :", url);

      const player = new YT.Player(iframeRef.current, {
        videoId: id,
        width: "100%",
        height: "360",
        playerVars: {
          controls: 0,       // cache l'UI native
          disablekb: 1,      // désactive le clavier
          modestbranding: 1,
          rel: 0
        },
        events: {
          onReady: () => {
            playerRef.current = player;
            setReady(true);
          },
          onStateChange: ({ data }) => {
            if (!isOwner && data === YT.PlayerState.PLAYING) setPlaying(true);
            if (!isOwner && data === YT.PlayerState.PAUSED)  setPlaying(false);
          }
        }
      });
    });
  }, [url, playerRef, isOwner]);

  // 2) Écoute le socket “video-sync” pour forcer la sync
  useEffect(() => {
    if (!socket) return;
    socket.on("video-sync", ({ isPlaying, currentTime }) => {
      if (!playerRef.current) return;
      // repositionne d’abord
      playerRef.current.seekTo(currentTime, true);
      // puis play/pause
      if (isPlaying) playerRef.current.playVideo();
      else           playerRef.current.pauseVideo();
      setPlaying(isPlaying);
      setTime(currentTime);
    });
    return () => socket.off("video-sync");
  }, [socket, playerRef]);

  // 3) Fonctions propriétaires ▶ émettent immédiatement
  const handlePlay = () => {
    playerRef.current.playVideo();
    const ct = playerRef.current.getCurrentTime();
    socket.emit("video-sync", { roomId, isPlaying: true, currentTime: ct });
    setPlaying(true);
    setTime(ct);
  };
  const handlePause = () => {
    playerRef.current.pauseVideo();
    const ct = playerRef.current.getCurrentTime();
    socket.emit("video-sync", { roomId, isPlaying: false, currentTime: ct });
    setPlaying(false);
    setTime(ct);
  };
  const handleSeek = e => {
    const newTime = parseFloat(e.target.value);
    playerRef.current.seekTo(newTime, true);
    socket.emit("video-sync", { roomId, isPlaying: playing, currentTime: newTime });
    setTime(newTime);
  };

  return (
    <div className="yt-player-custom" style={{ width: "100%" }}>
      <div ref={iframeRef} style={{ width: "100%", height: "360px" }} />
      
      {/* Contrôles perso */}
      {ready && (
        <div className="yt-controls-custom" style={{ padding: "8px", textAlign: "center" }}>
          {isOwner ? (
            <>
              <button onClick={handlePlay}  style={{ margin: "0 4px" }}>Play</button>
              <button onClick={handlePause} style={{ margin: "0 4px" }}>Pause</button>
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={time}
                onChange={handleSeek}
                style={{ width: "60%", verticalAlign: "middle", margin: "0 8px" }}
              />
            </>
          ) : (
            <button disabled style={{ margin: "0 4px", opacity: 0.5 }}>
              {playing ? "En lecture…" : "En pause"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Extraction d'ID YouTube robuste
function extractVideoID(u) {
  const m = u.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}
