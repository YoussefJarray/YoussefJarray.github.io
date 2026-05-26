"use client";
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiVolumeX, FiHeart } from "react-icons/fi";
import { useMusicStore, tracks, placeholderColors } from "../store/musicStore";
import { useAudioStore } from "../store/audioStore";

function formatTime(t) {
  if (!t || !isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function MusicWidget() {
  const currentIdx = useMusicStore((s) => s.currentIdx);
  const progress = useMusicStore((s) => s.progress);
  const duration = useMusicStore((s) => s.duration);
  const liked = useMusicStore((s) => s.liked);
  const playing = useMusicStore((s) => s.playing);

  const setLiked = useMusicStore((s) => s.setLiked);
  const toggle = useMusicStore((s) => s.toggle);
  const next = useMusicStore((s) => s.next);
  const prev = useMusicStore((s) => s.prev);
  const seek = useMusicStore((s) => s.seek);

  const { muted, volume, setVolume, setMuted } = useAudioStore();

  const track = tracks[currentIdx];
  const colors = placeholderColors[currentIdx];

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
            value={progress} onChange={(e) => seek(parseFloat(e.target.value))}
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
        <button onClick={prev} className="transition-all duration-150 hover:scale-110" style={{ color: "var(--text-secondary)" }}>
          <FiSkipBack size={16} />
        </button>
        <button
          onClick={toggle}
          className="flex items-center justify-center rounded-full transition-all duration-150 hover:scale-105"
          style={{
            width: 36, height: 36,
            background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`,
            boxShadow: `0 4px 14px ${colors[0]}40`,
            color: "#fff",
          }}
        >
          {playing ? <FiPause size={16} /> : <FiPlay size={16} style={{ marginLeft: 2 }} />}
        </button>
        <button onClick={next} className="transition-all duration-150 hover:scale-110" style={{ color: "var(--text-secondary)" }}>
          <FiSkipForward size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-1.5 flex-1">
          <button onClick={() => setMuted(!muted)} className="transition-colors" style={{ color: muted ? "var(--text-muted-2)" : "var(--text-secondary)" }}>
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
    </div>
  );
}
