"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiVolumeX, FiHeart } from "react-icons/fi";
import { useAudioStore } from "../store/audioStore";

const tracks = [
  { name: "Lo-Fi Beats 1", src: "/music/Lo-Fi%20Beats%201.mp3" },
  { name: "Lo-Fi Beats 2", src: "/music/Lo-Fi%20Beats%202.mp3" },
  { name: "Lo-Fi Beats 3", src: "/music/Lo-Fi%20Beats%203.mp3" },
  { name: "Lo-Fi Beats 4", src: "/music/Lo-Fi%20Beats%204.mp3" },
  { name: "Lo-Fi Beats 5", src: "/music/Lo-Fi%20Beats%205.mp3" },
  { name: "Lo-Fi Beats 6", src: "/music/Lo-Fi%20Beats%206.mp3" },
  { name: "Lo-Fi Beats 7", src: "/music/Lo-Fi%20Beats%207.mp3" },
  { name: "Lo-Fi Beats 8", src: "/music/Lo-Fi%20Beats%208.mp3" },
];

const placeholderColors = [
  ["#f97316", "#ec4899"],
  ["#14b8a6", "#3b82f6"],
  ["#a855f7", "#ec4899"],
  ["#f59e0b", "#ef4444"],
  ["#10b981", "#14b8a6"],
  ["#6366f1", "#8b5cf6"],
  ["#f43f5e", "#f97316"],
  ["#0ea5e9", "#8b5cf6"],
];

function fadeVolume(el, from, to, duration) {
  if (!el) return;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / (duration * 1000), 1);
    el.volume = from + (to - from) * t;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function MusicWidget() {
  const [currentIdx, setCurrentIdx] = useState(() => Math.floor(Math.random() * tracks.length));
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState(false);
  const audioRef = useRef(null);
  const playingRef = useRef(false);
  const fadingRef = useRef(false);
  const { volume, muted, duckVolume, setVolume, setMuted } = useAudioStore();
  const [, forceRender] = useState(0);

  const track = tracks[currentIdx];
  const colors = placeholderColors[currentIdx];

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const tryPlay = () => { a.play().catch(() => {}); a.volume = muted ? 0 : volume * duckVolume; };
    if (a.readyState >= 2) tryPlay();
    else { a.addEventListener("canplay", tryPlay, { once: true }); }
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (a && !fadingRef.current) a.volume = muted ? 0 : volume * duckVolume;
  }, [volume, muted, duckVolume]);

  const loadTrack = useCallback((idx) => {
    const a = audioRef.current;
    if (!a) return;
    setCurrentIdx(idx);
    setProgress(0);
    a.src = tracks[idx].src;
    a.load();
  }, []);

  const fadeToTrack = useCallback((idx) => {
    if (fadingRef.current) return;
    fadingRef.current = true;
    const a = audioRef.current;
    if (!a) { fadingRef.current = false; return; }

    const fadeTime = 1.2;
    const prevVol = a.volume;

    if (a.currentTime > 0) {
      fadeVolume(a, prevVol, 0, fadeTime);
    }

    setTimeout(() => {
      loadTrack(idx);
      const tryPlay = () => {
        a.play().catch(() => {});
        a.removeEventListener("canplay", tryPlay);
      };
      a.addEventListener("canplay", tryPlay);
      setTimeout(() => {
        fadeVolume(a, 0, muted ? 0 : volume * duckVolume, fadeTime);
        setTimeout(() => { fadingRef.current = false; }, fadeTime * 1000 + 50);
      }, 150);
    }, a.currentTime > 0 ? fadeTime * 1000 + 50 : 0);
  }, [volume, muted, loadTrack]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
      playingRef.current = true;
      forceRender((n) => n + 1);
    } else {
      a.pause();
      playingRef.current = false;
      forceRender((n) => n + 1);
    }
  }, []);

  const skipNext = useCallback(() => fadeToTrack((currentIdx + 1) % tracks.length), [currentIdx, fadeToTrack]);
  const skipPrev = useCallback(() => fadeToTrack((currentIdx - 1 + tracks.length) % tracks.length), [currentIdx, fadeToTrack]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTimeUpdate = () => {
      const pct = (a.currentTime / a.duration) * 100 || 0;
      setProgress(pct);
      if (!fadingRef.current && playingRef.current && a.duration - a.currentTime < 2.5) {
        fadeToTrack((currentIdx + 1) % tracks.length);
      }
    };
    const onLoadedMeta = () => setDuration(a.duration);
    const onPlay = () => { playingRef.current = true; forceRender((n) => n + 1); };
    const onPause = () => { playingRef.current = false; forceRender((n) => n + 1); };
    a.addEventListener("timeupdate", onTimeUpdate);
    a.addEventListener("loadedmetadata", onLoadedMeta);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    return () => {
      a.removeEventListener("timeupdate", onTimeUpdate);
      a.removeEventListener("loadedmetadata", onLoadedMeta);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
    };
  }, [currentIdx, fadeToTrack]);

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    const a = audioRef.current;
    if (a && duration) a.currentTime = (val / 100) * duration;
    setProgress(val);
  };

  const formatTime = (t) => {
    if (!t || !isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="select-none">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="relative shrink-0 rounded-xl overflow-hidden"
          style={{ width: 60, height: 60, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl drop-shadow-lg">🎵</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="text-sm font-semibold truncate"
            style={{ color: "var(--text-primary)", textShadow: "0 1px 4px rgba(0,0,0,0.3)" }}
          >
            {track.name}
          </div>
          <div
            className="text-[10px] truncate mt-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Lo-Fi Beats
          </div>
          <button
            onClick={() => setLiked(!liked)}
            className="mt-1 transition-all duration-200"
            style={{ color: liked ? "#f97316" : "var(--text-muted-2)" }}
          >
            <FiHeart size={11} fill={liked ? "#f97316" : "none"} />
          </button>
        </div>
      </div>

      <div className="mb-2">
        <div className="relative h-5 flex items-center cursor-pointer group">
          <div className="absolute inset-x-0 h-1 rounded-full" style={{ background: "var(--bg-surface)" }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]})` }} />
          </div>
          <div
            className="absolute w-3 h-3 rounded-full z-10"
            style={{
              left: `calc(${progress}% - 6px)`,
              background: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
            }}
          />
          <input
            type="range" min="0" max="100" step="0.1"
            value={progress} onChange={handleSeek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
            style={{ height: 20 }}
          />
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
            {formatTime((progress / 100) * duration)}
          </span>
          <span className="text-[9px] font-mono" style={{ color: "var(--text-muted)" }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-2.5">
        <button onClick={skipPrev} className="transition-all duration-150 hover:scale-110" style={{ color: "var(--text-secondary)" }}>
          <FiSkipBack size={16} />
        </button>
        <button
          onClick={togglePlay}
          className="flex items-center justify-center rounded-full transition-all duration-150 hover:scale-105"
          style={{
            width: 36, height: 36,
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
            boxShadow: `0 4px 14px ${colors[0]}40`,
            color: "#fff",
          }}
        >
          {playingRef.current ? <FiPause size={16} /> : <FiPlay size={16} style={{ marginLeft: 2 }} />}
        </button>
        <button onClick={skipNext} className="transition-all duration-150 hover:scale-110" style={{ color: "var(--text-secondary)" }}>
          <FiSkipForward size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-1.5 flex-1">
          <button onClick={() => { setMuted(!muted); }} className="transition-colors" style={{ color: muted ? "var(--text-muted-2)" : "var(--text-secondary)" }}>
            {muted ? <FiVolumeX size={12} /> : <FiVolume2 size={12} />}
          </button>
          <div className="relative flex-1 h-5 flex items-center cursor-pointer" style={{ maxWidth: 80 }}>
            <div className="absolute inset-x-0 h-1 rounded-full" style={{ background: "var(--bg-surface)" }}>
              <div className="h-full rounded-full" style={{ width: `${(muted ? 0 : volume) * 100}%`, background: "var(--text-secondary)" }} />
            </div>
            <div
              className="absolute w-2.5 h-2.5 rounded-full z-10"
              style={{
                left: `calc(${(muted ? 0 : volume) * 100}% - 5px)`,
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}
            />
            <input
              type="range" min="0" max="1" step="0.01"
              value={muted ? 0 : volume}
              onChange={(e) => { const v = parseFloat(e.target.value); setVolume(v); setMuted(v === 0); }}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
              style={{ height: 20 }}
            />
          </div>
        </div>
        <span className="text-[9px] font-mono" style={{ color: "var(--text-muted-2)" }}>
          {currentIdx + 1}/{tracks.length}
        </span>
      </div>

      <audio ref={audioRef} src={track.src} preload="auto" />
    </div>
  );
}
