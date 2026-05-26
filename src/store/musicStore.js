"use client";
import { create } from "zustand";
import { useAudioStore } from "./audioStore";

export const tracks = [
  { name: "Lo-Fi Beats 1", src: "/music/Lo-Fi%20Beats%201.mp3" },
  { name: "Lo-Fi Beats 2", src: "/music/Lo-Fi%20Beats%202.mp3" },
  { name: "Lo-Fi Beats 3", src: "/music/Lo-Fi%20Beats%203.mp3" },
  { name: "Lo-Fi Beats 4", src: "/music/Lo-Fi%20Beats%204.mp3" },
  { name: "Lo-Fi Beats 5", src: "/music/Lo-Fi%20Beats%205.mp3" },
  { name: "Lo-Fi Beats 6", src: "/music/Lo-Fi%20Beats%206.mp3" },
  { name: "Lo-Fi Beats 7", src: "/music/Lo-Fi%20Beats%207.mp3" },
  { name: "Lo-Fi Beats 8", src: "/music/Lo-Fi%20Beats%208.mp3" },
];

export const placeholderColors = [
  ["#f97316", "#ec4899"],
  ["#14b8a6", "#3b82f6"],
  ["#a855f7", "#ec4899"],
  ["#f59e0b", "#ef4444"],
  ["#10b981", "#14b8a6"],
  ["#6366f1", "#8b5cf6"],
  ["#f43f5e", "#f97316"],
  ["#0ea5e9", "#8b5cf6"],
];

function safeVol(v) {
  return isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
}

function fadeVolume(el, from, to, duration) {
  if (!el) return;
  from = safeVol(from);
  to = safeVol(to);
  if (from === to) { el.volume = from; return; }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / (duration * 1000), 1);
    el.volume = safeVol(from + (to - from) * t);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export const useMusicStore = create((set, get) => ({
  currentIdx: Math.floor(Math.random() * 8),
  progress: 0,
  duration: 0,
  liked: false,
  playing: false,
  fading: false,

  setPlaying: (v) => set({ playing: v }),
  setCurrentIdx: (idx) => set({ currentIdx: idx }),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  setLiked: (v) => set({ liked: v }),

  play: () => {
    const audio = get()._audio;
    if (!audio) return;
    audio.play().catch(() => {});
    set({ playing: true });
  },

  pause: () => {
    const audio = get()._audio;
    if (!audio) return;
    audio.pause();
    set({ playing: false });
  },

  toggle: () => {
    const { playing, play, pause } = get();
    if (playing) pause();
    else play();
  },

  loadTrack: (idx) => {
    const audio = get()._audio;
    if (!audio) return;
    set({ currentIdx: idx, progress: 0 });
    audio.src = tracks[idx].src;
    audio.load();
  },

  fadeToTrack: (idx) => {
    const { fading, _audio, loadTrack } = get();
    if (fading) return;
    set({ fading: true });
    const a = _audio;
    if (!a) { set({ fading: false }); return; }

    const { muted, volume, duckVolume } = useAudioStore.getState();
    const fadeTime = 1.2;

    if (a.currentTime > 0) {
      fadeVolume(a, safeVol(a.volume), 0, fadeTime);
    }

    setTimeout(() => {
      loadTrack(idx);
      const tryPlay = () => {
        a.play().catch(() => {});
        a.removeEventListener("canplay", tryPlay);
      };
      a.addEventListener("canplay", tryPlay);
      setTimeout(() => {
        fadeVolume(a, 0, muted ? 0 : (volume ?? 0.5) * (duckVolume ?? 1), fadeTime);
        setTimeout(() => { set({ fading: false }); }, fadeTime * 1000 + 50);
      }, 150);
    }, a.currentTime > 0 ? fadeTime * 1000 + 50 : 0);
  },

  next: () => {
    const { currentIdx, fadeToTrack } = get();
    fadeToTrack((currentIdx + 1) % 8);
  },

  prev: () => {
    const { currentIdx, fadeToTrack } = get();
    fadeToTrack((currentIdx - 1 + 8) % 8);
  },

  seek: (val) => {
    const audio = get()._audio;
    const duration = get().duration;
    if (audio && duration) {
      audio.currentTime = (val / 100) * duration;
    }
    set({ progress: val });
  },

  _audio: null,
  _audioCleanup: null,

  attachAudio: (audio, duckVolume, muted, volume) => {
    const prev = get()._audioCleanup;
    if (prev) prev();

    set({ _audio: audio });

    const onTimeUpdate = () => {
      const pct = (audio.currentTime / audio.duration) * 100 || 0;
      set({ progress: pct });
      const { currentIdx, fading, next } = get();
      if (!fading && audio.duration - audio.currentTime < 2.5) {
        next();
      }
    };
    const onLoadedMeta = () => set({ duration: audio.duration });
    const onPlay = () => set({ playing: true });
    const onPause = () => set({ playing: false });

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    set({
      _audioCleanup: () => {
        audio.removeEventListener("timeupdate", onTimeUpdate);
        audio.removeEventListener("loadedmetadata", onLoadedMeta);
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
      },
    });

    const tryPlay = () => {
      audio.play().catch(() => {});
      audio.volume = safeVol(muted ? 0 : (volume ?? 0.5) * (duckVolume ?? 1));
      audio.removeEventListener("canplay", tryPlay);
    };
    if (audio.readyState >= 2) tryPlay();
    else audio.addEventListener("canplay", tryPlay, { once: true });
  },

  detachAudio: () => {
    const cleanup = get()._audioCleanup;
    if (cleanup) cleanup();
    set({ _audio: null, _audioCleanup: null });
  },
}));
