// src/utils/youtubeApiLoader.js
let _loading = false;
let _ready = false;
const _callbacks = [];

export function loadYouTubeAPI(callback) {
  if (_ready) {
    callback();
    return;
  }
  _callbacks.push(callback);
  if (_loading) return;
  _loading = true;

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.body.appendChild(tag);

  window.onYouTubeIframeAPIReady = () => {
    _ready = true;
    _callbacks.forEach(cb => cb());
  };
}
