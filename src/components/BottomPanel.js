"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { useWindowStore } from "../store/windowStore";
import { useAudioStore } from "../store/audioStore";
import { FiFolder, FiTerminal, FiUser, FiSettings, FiGlobe, FiMonitor, FiGrid, FiEdit3, FiVolume2, FiVolume1, FiVolumeX, FiWifi, FiWifiOff } from "react-icons/fi";
import { FaUbuntu } from "react-icons/fa";
import { getSmallIcon } from "../data/iconRegistry";

const dockApps = [
  { id: "files", icon: FiFolder, label: "Projects" },
  { id: "terminal", icon: FiTerminal, label: "Terminal" },
  { id: "about", icon: FiUser, label: "About Me" },
  { id: "browser", icon: FiGlobe, label: "Web Browser" },
  { id: "settings", icon: FiSettings, label: "Settings" },
  { id: "doom", icon: FiMonitor, label: "Doom" },
  { id: "minesweeper", icon: FiGrid, label: "Minesweeper" },
  { id: "paint", icon: FiEdit3, label: "Paint" },
  { id: "typing", icon: FiEdit3, label: "Typing" },
];

function useBattery() {
  const [info, setInfo] = useState({ level: 87, charging: false });
  useEffect(() => {
    if (!("getBattery" in navigator)) return;
    navigator.getBattery().then((b) => {
      const update = () => setInfo({ level: Math.round(b.level * 100), charging: b.charging });
      update();
      b.addEventListener("levelchange", update);
      b.addEventListener("chargingchange", update);
    });
  }, []);
  return info;
}

function useNetwork() {
  const [info, setInfo] = useState({ connected: true, strength: 80 });
  useEffect(() => {
    const update = () => {
      const online = navigator.onLine;
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const strengthMap = { "4g": 90, "3g": 60, "2g": 30, "slow-2g": 10 };
      const strength = conn ? (strengthMap[conn.effectiveType] || 75) : (online ? 75 : 0);
      setInfo({ connected: online, strength });
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if (navigator.connection) navigator.connection.addEventListener("change", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  return info;
}

function WifiBars({ strength, connected }) {
  if (!connected) return <FiWifiOff size={14} style={{ display: "block" }} />;
  const bars = strength >= 70 ? 3 : strength >= 40 ? 2 : 1;
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {[0, 1, 2].map(i => (
        <rect key={i} x={1 + i * 4.5} y={14 - 3 - (i + 1) * 3} width="3.5" height={(i + 1) * 3} rx="1" fill="currentColor" opacity={i < bars ? 0.9 : 0.2} />
      ))}
    </svg>
  );
}

function BatteryBar({ level, charging }) {
  const fillColor = charging ? "#4ade80" : level <= 20 ? "#f87171" : level <= 40 ? "#fbbf24" : "currentColor";
  const filled = Math.round((level / 100) * 4);
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <rect x="0.5" y="1.5" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.65" />
      <rect x="19" y="4.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.5" />
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={2 + i * 4} y={3} width="3.2" height="8" rx="0.8" fill={fillColor} opacity={i < filled ? 0.9 : 0.13} />
      ))}
    </svg>
  );
}

export default function BottomPanel() {
  const { windows, openWindow, focusWindow, toggleMaximize, closeWindow, minimizeWindow, focusedWindowId, setStartMenuOpen } = useWindowStore();
  const [time, setTime] = useState("");
  const [showClock, setShowClock] = useState(false);
  const clockRef = useRef(null);
  const battery = useBattery();
  const network = useNetwork();
  const audioStore = useAudioStore();
  const volume = Math.round(audioStore.volume * 100);
  const muted = audioStore.muted;
  const panelRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(panelRef.current, { y: 44, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", delay: 0.2 });
  }, []);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!showClock) return;
    const handler = (e) => {
      if (clockRef.current && !clockRef.current.contains(e.target)) setShowClock(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showClock]);

  const handleDockClick = (id) => {
    const win = windows[id];
    if (!win) return;
    if (win.isOpen && !win.isMinimized) {
      focusWindow(id);
    } else {
      openWindow(id);
    }
  };

  const handleWindowClick = (id) => {
    const w = windows[id];
    if (w?.isMinimized) openWindow(id);
    else focusWindow(id);
  };

  const handleMuteToggle = () => {
    audioStore.toggleMute();
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value);
    audioStore.setVolume(val / 100);
  };

  const openWindows = Object.values(windows).filter((w) => w.isOpen);
  const VolumeIcon = muted || volume === 0 ? FiVolumeX : volume < 50 ? FiVolume1 : FiVolume2;
  const displayVolume = muted ? 0 : volume;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-0 left-0 right-0 z-[9999] flex items-center select-none"
        style={{
          height: 44,
          background: "var(--panel-bg)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid var(--panel-border)",
          padding: "0 8px",
        }}
    >
      {/* ── KDE Application Launcher ── */}
      <button
        onClick={() => setStartMenuOpen(true)}
        className="flex items-center justify-center w-10 h-9 rounded-lg hover:bg-white/10 transition-all mr-1"
        title="Application Launcher"
      >
        <FaUbuntu className="text-lg text-orange-500" />
      </button>

      {/* ── Divider ── */}
      <div className="w-px h-6 mx-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />

      {/* ── Pinned Dock Apps ── */}
      <div className="flex items-center gap-0.5 mr-1">
        {dockApps.map(({ id, icon: Icon }, idx) => {
          const win = windows[id];
          const isOpen = win?.isOpen && !win?.isMinimized;
          const isActive = win?.id === focusedWindowId;
          const dockRef = useRef(null);
          return (
            <button
              key={id}
              ref={dockRef}
              onClick={() => handleDockClick(id)}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget.querySelector("svg"), { y: -4, scale: 1.25, duration: 0.2, ease: "back.out(2)" });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget.querySelector("svg"), { y: 0, scale: 1, duration: 0.18, ease: "power2.out" });
              }}
              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition-all group"
            >
              <Icon className={`text-lg transition-all ${isOpen ? "text-white" : "text-white/40 group-hover:text-white/70"}`} />
              {isOpen && (
                <span
                  className="absolute bottom-0.5 left-1/2 -translate-x-1/2 rounded-full transition-all"
                  style={{
                    width: isActive ? 16 : 4,
                    height: 3,
                    background: isActive ? "var(--accent)" : "rgba(255,255,255,0.3)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Divider ── */}
      <div className="w-px h-6 mx-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />

      {/* ── Task Manager (Open Windows) ── */}
      <div className="flex items-center gap-0.5 flex-1 overflow-x-auto hide-scrollbar mx-1">
        {openWindows.map((w) => {
          const isActive = w.id === focusedWindowId;
          const isMin = w.isMinimized;
          return (
            <button
              key={w.id}
              onClick={() => handleWindowClick(w.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (w.isMinimized) openWindow(w.id);
                else focusWindow(w.id);
              }}
              onDoubleClick={() => {
                if (!w.isMinimized) toggleMaximize(w.id);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all shrink-0 max-w-[160px] ${
                isActive ? "bg-white/12 text-white" : isMin ? "text-white/30 hover:text-white/60 hover:bg-white/5" : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <span className="text-sm shrink-0">{getSmallIcon(w.icon)}</span>
              <span className="text-[11px] truncate">{w.title}</span>
              {isActive && (
                <span className="absolute left-0.5 top-1 bottom-1 w-0.5 rounded-full" style={{ background: "var(--accent)" }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── System Tray ── */}
      <div className="flex items-center gap-1 shrink-0 ml-auto">
        {/* Volume */}
        <button
          onClick={handleMuteToggle}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-all"
          title={`Volume: ${volume}%`}
        >
          <VolumeIcon size={15} className="text-white/60" />
        </button>
        <div className="relative" style={{ width: 60 }}>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 rounded-full" style={{ height: 3, background: "rgba(255,255,255,0.1)" }} />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full" style={{ height: 3, width: `${displayVolume}%`, background: "var(--accent)", transition: "width 0.05s" }} />
          <input
            type="range"
            min="0" max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="relative w-full h-8 cursor-pointer opacity-0"
          />
        </div>

        {/* WiFi */}
        <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-all" title={network.connected ? "Connected" : "Offline"}>
          <WifiBars strength={network.strength} connected={network.connected} />
        </button>

        {/* Battery */}
        <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-all" title={`${battery.level}% ${battery.charging ? "(charging)" : ""}`}>
          <BatteryBar level={battery.level} charging={battery.charging} />
        </button>

        {/* Clock */}
        <div ref={clockRef} className="relative">
          <button
            onClick={() => setShowClock(!showClock)}
            className="flex flex-col items-end justify-center px-3 h-8 rounded-lg hover:bg-white/10 transition-all ml-1"
          >
            <span className="text-[11px] font-medium leading-tight text-white/80">{time}</span>
          </button>
          {showClock && (
            <div className="absolute bottom-full right-0 mb-2 z-[200]" onClick={(e) => e.stopPropagation()}>
              <div className="rounded-xl shadow-2xl border border-white/10 overflow-hidden p-3" style={{ width: 200, background: "rgba(10, 10, 28, 0.95)", backdropFilter: "blur(30px)" }}>
                <div className="text-center text-sm font-medium text-white/80">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
