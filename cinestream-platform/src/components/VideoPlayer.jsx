import React, { useState, useRef, useEffect } from 'react';

export default function VideoPlayer({ movie, onClose }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let timeoutId;
    const resetTimer = () => {
      setShowControls(true);
      if (timeoutId) clearTimeout(timeoutId);
      if (isPlaying) {
        timeoutId = setTimeout(() => setShowControls(false), 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', resetTimer);
    }
    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (container) container.removeEventListener('mousemove', resetTimer);
    };
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handleSeek = (e) => {
    const targetTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      videoRef.current.muted = nextMuted;
    }
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-black flex items-center justify-center select-none" style={{ cursor: showControls ? 'default' : 'none' }}>
      <video
        ref={videoRef}
        src={movie.videoUrl}
        className="w-full h-full object-contain"
        onClick={handlePlayPause}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        autoPlay
      />

      {/* TOP CONTROLS */}
      <div className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent flex justify-between transition duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={onClose} className="flex items-center gap-2 text-zinc-300 hover:text-white font-bold">
          ← Close Player
        </button>
        <span className="font-bold text-white text-md">{movie.title}</span>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 to-transparent space-y-4 transition duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-400 font-mono">{formatTime(currentTime)}</span>
          <input
            type="range" min="0" max="100" step="0.1"
            value={progressPercentage} onChange={handleSeek}
            className="flex-grow h-1.5 appearance-none bg-zinc-700 rounded-lg cursor-pointer outline-none"
            style={{ background: `linear-gradient(to right, #e50914 0%, #e50914 ${progressPercentage}%, #515151 ${progressPercentage}%, #515151 100%)` }}
          />
          <span className="text-xs text-zinc-400 font-mono">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={handlePlayPause} className="text-white hover:text-red-500 font-bold transition">
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={toggleMute} className="text-white hover:text-zinc-300 transition">
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          </div>

          <select
            value={playbackSpeed}
            onChange={(e) => {
              const speed = parseFloat(e.target.value);
              setPlaybackSpeed(speed);
              if (videoRef.current) videoRef.current.playbackRate = speed;
            }}
            className="bg-zinc-900 text-xs font-semibold px-2.5 py-1.5 border border-zinc-800 rounded text-zinc-300 focus:outline-none"
          >
            {[0.5, 1, 1.5, 2].map(speed => <option key={speed} value={speed}>{speed}x Speed</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
