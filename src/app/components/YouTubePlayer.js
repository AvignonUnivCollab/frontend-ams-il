"use client"; // Important pour indiquer que c'est un composant client

import React, { useRef, useEffect, useState, forwardRef } from "react";
import YouTube from "react-youtube";
import PropTypes from "prop-types";

const YouTubePlayer = forwardRef(function YouTubePlayer(
  { src, onPlayPause, isOwner, playing },
  ref // Cette ref viendra de la page parent
) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [htmlPlaying, setHtmlPlaying] = useState(false);

  const isYouTube = src.includes("/embed/");

  // Synchronisation vidéo HTML5
  useEffect(() => {
    if (!isYouTube && videoRef.current) {
      htmlPlaying ? videoRef.current.play().catch(() => {}) : videoRef.current.pause();
    }
  }, [htmlPlaying, isYouTube]);

  if (isYouTube) {
    const videoId = new URL(src)
      .pathname.split("/embed/")[1]
      .split("?")[0];
    return (
      <div
        ref={ref}
        style={{
          position: "relative",
          maxWidth: "1000px",
          maxHeight: "500px",
        }}
      >
        <YouTube
          videoId={videoId}
          opts={{
            height: "360",
            width: "640",
            playerVars: {
              controls: 0,
              enablejsapi: 1,
              modestbranding: 1,
              origin: window.location.origin,
            },
          }}
          onReady={(e) => {
            playerRef.current = e.target;
          }}
          iframeClassName="youtube-iframe"
        />
      </div>
    );
  }

  // Vidéo HTML5 avec bouton central
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        maxWidth: "1000px",
        maxHeight: "500px",
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full rounded"
        controls={false}
        style={{ width: "100%", height: "auto", display: "block" }}
      />
      {isOwner && (
        <button
          onClick={() => {
            const next = !htmlPlaying;
            setHtmlPlaying(next);
            onPlayPause();
          }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.6)",
            border: "none",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <span style={{ color: "white", fontSize: "24px" }}>
            {htmlPlaying ? "⏸" : "▶"}
          </span>
        </button>
      )}
    </div>
  );
});

YouTubePlayer.propTypes = {
  src: PropTypes.string.isRequired,
  onPlayPause: PropTypes.func.isRequired,
  isOwner: PropTypes.bool,
  playing: PropTypes.bool,
};

export default YouTubePlayer;
