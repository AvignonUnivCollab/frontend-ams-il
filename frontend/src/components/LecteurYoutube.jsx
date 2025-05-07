/* global YT */
import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './LecteurYoutube.css';

let apiLoading = false;
let apiReady   = false;
const apiQueue = [];
function loadYouTubeAPI(cb) {
  if (apiReady) return void cb();
  apiQueue.push(cb);
  if (apiLoading) return;
  apiLoading = true;
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.body.appendChild(tag);
  window.onYouTubeIframeAPIReady = () => {
    apiReady = true;
    apiQueue.splice(0).forEach(fn => fn());
  };
}

function extractVideoID(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export default function LecteurYoutube({ url, socket, roomId, isOwner }) {
  const containerRef = useRef(null);
  const playerRef    = useRef(null);

  const [ready, setReady]       = useState(false);
  const [playing, setPlaying]   = useState(false);
  const [currentTime, setTime]  = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const id = extractVideoID(url);
    if (!id) return console.error('URL YouTube invalide :', url);

    loadYouTubeAPI(() => {
      containerRef.current.innerHTML = '';
      const iframeContainer = document.createElement('div');
      containerRef.current.appendChild(iframeContainer);

      playerRef.current = new YT.Player(iframeContainer, {
        videoId: id,
        playerVars: {
          enablejsapi:    1,
          controls:       0,
          disablekb:      1,
          modestbranding: 1,
          rel:            0
        },
        events: {
          onReady: e => {
            setReady(true);
            const dur = e.target.getDuration();
            setDuration(dur);

            e.target.playVideo();
            setTimeout(() => e.target.pauseVideo(), 200);

            if (!isOwner) socket.emit('request-sync', { roomId });
          },
          onStateChange: ({ data, target }) => {
            const t = target.getCurrentTime();
            setTime(t);
            const isPlay = data === YT.PlayerState.PLAYING;
            setPlaying(isPlay);

            if (isOwner) {
              socket.emit('video-sync', {
                roomId,
                isPlaying: isPlay,
                currentTime: t
              });
            }
          }
        }
      });
    });
  }, [url, roomId, isOwner, socket]);

  useEffect(() => {
    if (!socket) return;
    const handler = ({ isPlaying, currentTime }) => {
      const pl = playerRef.current;
      if (!pl || typeof pl.seekTo !== 'function') return;
      pl.seekTo(currentTime, true);
      isPlaying ? pl.playVideo() : pl.pauseVideo();
      setPlaying(isPlaying);
      setTime(currentTime);
    };
    socket.on('video-sync', handler);
    return () => socket.off('video-sync', handler);
  }, [socket]);

  const post = (func, args=[]) => {
    const iframe = containerRef.current.querySelector('iframe');
    if (!iframe) return;
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func, args }), '*'
    );
  };
  const handlePlay  = () => post('playVideo');
  const handlePause = () => post('pauseVideo');
  const handleSeek  = e => {
    const t = parseFloat(e.target.value);
    post('seekTo', [t, true]);
    setTime(t);
    if (isOwner) {
      socket.emit('video-sync', { roomId, isPlaying: playing, currentTime: t });
    }
  };

  return (
    <div className="custom-yt-player">
      {/* zone vidéo */}
      <div className="player-container">
        <div ref={containerRef} className="player-frame"/>
        <div className="click-blocker"/>
      </div>

      {/* contrôles personnalisés */}
      {ready && (
        <div className="controls">
          {isOwner ? (
            <>
              <button onClick={handlePlay}  disabled={playing}>Play</button>
              <button onClick={handlePause} disabled={!playing}>Pause</button>
              <input
                type="range"
                min="0" max={duration} step="0.1"
                value={currentTime} onChange={handleSeek}
              />
              <span>{Math.floor(currentTime)}/{Math.floor(duration)}s</span>
            </>
          ) : (
            <span>{playing ? 'Lecture en cours...' : 'Vidéo mise en pause'}</span>
          )}
        </div>
      )}
    </div>
  );
}

LecteurYoutube.propTypes = {
  url:      PropTypes.string.isRequired,
  socket:   PropTypes.object.isRequired,
  roomId:   PropTypes.string.isRequired,
  isOwner:  PropTypes.bool.isRequired
};
