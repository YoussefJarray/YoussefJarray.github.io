"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useWindowStore } from "../store/windowStore";
import { useAudioStore } from "../store/audioStore";
import { FiWifi, FiWifiOff, FiVolume2, FiVolume1, FiVolumeX, FiSearch, FiStar, FiMonitor, FiTerminal, FiGlobe, FiImage, FiPlay } from "react-icons/fi";
import { FaUbuntu, FaCog, FaPowerOff } from "react-icons/fa";
import ContextMenu from "./ContextMenu";
import { DoomIcon, PongIcon, TicTacToeIcon, SudokuIcon, PdfIcon } from "./icons/GameIcons";

const confettiColors = ["#f97316", "#ef4444", "#34d399", "#3b82f6", "#a855f7", "#fbbf24", "#ec4899"];

function spawnConfetti(cx, cy) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const particles = [];
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 4;
    particles.push({
      x: cx + (Math.random() - 0.5) * 20,
      y: cy + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      size: 4 + Math.random() * 4,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      life: 1,
      rot: Math.random() * 360,
      rv: (Math.random() - 0.5) * 10,
    });
  }
  let frame = 0;
  const maxFrames = 90;
  function animate() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.rot += p.rv;
      p.life = Math.max(0, 1 - frame / maxFrames);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
      ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    if (frame < maxFrames) requestAnimationFrame(animate);
    else canvas.remove();
  }
  animate();
}

const appIcons = {
  folder: "\uD83D\uDCC1",
  terminal: "\u276F_",
  user: "\uD83D\uDC64",
  settings: "\u2699\uFE0F",
  browser: "\uD83C\uDF10",
  photos: "\uD83D\uDDBC",
  doom: <DoomIcon size={14} />,
  pong: <PongIcon size={14} />,
  tictactoe: <TicTacToeIcon size={14} />,
  sudoku: <SudokuIcon size={14} />,
  pdf: <PdfIcon size={14} />,
};

const categories = [
  { id: "favorites", label: "Favorites", icon: FiStar },
  { id: "development", label: "Development", icon: FiTerminal },
  { id: "internet", label: "Internet", icon: FiGlobe },
  { id: "graphics", label: "Graphics", icon: FiImage },
  { id: "games", label: "Games", icon: FiPlay },
  { id: "system", label: "System", icon: FiMonitor },
];

const appsByCategory = {
  favorites: [
    { id: "files", icon: "\uD83D\uDCC1", label: "Files", desc: "Browse projects" },
    { id: "terminal", icon: "\u276F_", label: "Terminal", desc: "Command line" },
    { id: "browser", icon: "\uD83C\uDF10", label: "Web Browser", desc: "Browse the web" },
    { id: "photos", icon: "\uD83D\uDDBC", label: "Photos", desc: "Image gallery" },
    { id: "doom", icon: <DoomIcon size={22} />, label: "Doom", desc: "Raycasting FPS" },
    { id: "pong", icon: <PongIcon size={22} />, label: "Pong", desc: "Classic paddle ball" },
  ],
  development: [
    { id: "terminal", icon: "\u276F_", label: "Terminal", desc: "Command line" },
    { id: "files", icon: "\uD83D\uDCC1", label: "Files", desc: "Browse projects" },
  ],
  internet: [{ id: "browser", icon: "\uD83C\uDF10", label: "Web Browser", desc: "Browse the web" }],
  graphics: [{ id: "photos", icon: "\uD83D\uDDBC", label: "Photos", desc: "Image gallery" }],
  games: [
    { id: "doom", icon: <DoomIcon size={22} />, label: "Doom", desc: "Raycasting FPS" },
    { id: "pong", icon: <PongIcon size={22} />, label: "Pong", desc: "Classic paddle ball" },
    { id: "tictactoe", icon: <TicTacToeIcon size={22} />, label: "Tic-Tac-Toe", desc: "3-in-a-row" },
    { id: "sudoku", icon: <SudokuIcon size={22} />, label: "Sudoku", desc: "Number puzzle" },
  ],
  system: [
    { id: "settings", icon: "\u2699\uFE0F", label: "Settings", desc: "Preferences" },
    { id: "about", icon: "\uD83D\uDC64", label: "About Me", desc: "Personal info" },
    { id: "resume", icon: <PdfIcon size={22} />, label: "Resume", desc: "View my CV" },
  ],
};

const allApps = Object.values(appsByCategory).flat();
const uniqueApps = allApps.filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i);

/* ── Real battery hook using Battery API ── */
function useBattery() {
  const [info, setInfo] = useState({ level: 87, charging: false, timeLeft: null, timeToFull: null });
  useEffect(() => {
    if (!("getBattery" in navigator)) return;
    navigator.getBattery().then((b) => {
      function update() {
        const level = Math.round(b.level * 100);
        const timeLeft = b.dischargingTime && isFinite(b.dischargingTime) ? formatTime(b.dischargingTime) : null;
        const timeToFull = b.chargingTime && isFinite(b.chargingTime) ? formatTime(b.chargingTime) : null;
        setInfo({ level, charging: b.charging, timeLeft, timeToFull });
      }
      update();
      b.addEventListener("levelchange", update);
      b.addEventListener("chargingchange", update);
      b.addEventListener("chargingtimechange", update);
      b.addEventListener("dischargingtimechange", update);
    });
  }, []);
  return info;
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ── Real network hook ── */
function useNetwork() {
  const [info, setInfo] = useState({ connected: true, ip: "—", strength: 80, type: "Wi-Fi" });
  useEffect(() => {
    function update() {
      const online = navigator.onLine;
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      const strengthMap = { "4g": 90, "3g": 60, "2g": 30, "slow-2g": 10 };
      const strength = conn ? (strengthMap[conn.effectiveType] || 75) : (online ? 75 : 0);
      const type = conn ? (conn.effectiveType || conn.type || "Wi-Fi") : "Wi-Fi";
      setInfo(prev => ({ ...prev, connected: online, strength, type }));
    }
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    if (navigator.connection) navigator.connection.addEventListener("change", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json())
      .then(d => setInfo(prev => ({ ...prev, ip: d.ip })))
      .catch(() => {});
  }, []);
  return info;
}

/* ── KDE wifi bars SVG ── */
function WifiBars({ strength, connected }) {
  if (!connected) return <FiWifiOff size={14} style={{ display: "block" }} />;
  const bars = strength >= 70 ? 3 : strength >= 40 ? 2 : 1;
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {[0, 1, 2].map(i => (
        <rect key={i}
          x={1 + i * 4.5} y={14 - 3 - (i + 1) * 3}
          width="3.5" height={(i + 1) * 3}
          rx="1"
          fill="currentColor"
          opacity={i < bars ? 0.9 : 0.2}
        />
      ))}
    </svg>
  );
}

/* ── KDE battery SVG — uses currentColor, colors only for low/charging ── */
function BatteryBar({ level, charging }) {
  const isLow = level <= 20;
  const isMid = level > 20 && level <= 40;
  const fillColor = charging ? "#4ade80" : isLow ? "#f87171" : isMid ? "#fbbf24" : "currentColor";
  const filled = Math.round((level / 100) * 4);
  return (
    <svg width="22" height="14" viewBox="0 0 22 14" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {/* body outline */}
      <rect x="0.5" y="1.5" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.65" />
      {/* terminal nub */}
      <rect x="19" y="4.5" width="2.5" height="5" rx="1" fill="currentColor" opacity="0.5" />
      {/* fill segments */}
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={2 + i * 4} y={3} width="3.2" height="8" rx="0.8"
          fill={fillColor} opacity={i < filled ? 0.9 : 0.13} />
      ))}
    </svg>
  );
}

function CalendarPopup({ onClose }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = now.getDate();
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year;
  const monthName = new Date(year, month).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="absolute top-full right-0 mt-2 z-[200]" onClick={(e) => e.stopPropagation()}>
      <div className="rounded-2xl shadow-2xl border border-subtle overflow-hidden" style={{ width: 280, background: "var(--menu-bg)", backdropFilter: "blur(30px)" }}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-subtle">
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="text-muted hover:text-secondary text-sm px-1">&lsaquo;</button>
          <span className="text-xs font-medium text-secondary">{monthName}</span>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="text-muted hover:text-secondary text-sm px-1">&rsaquo;</button>
        </div>
        <div className="grid grid-cols-7 gap-0 px-3 pt-2">
          {dayNames.map((d) => <div key={d} className="text-[10px] text-muted text-center h-6 flex items-center justify-center font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0 px-3 pb-3">
          {days.map((d, i) => (
            <div key={i} className={`text-xs text-center h-7 flex items-center justify-center rounded-md transition-colors ${d === null ? "" : isCurrentMonth && d === today ? "bg-accent text-white font-semibold" : "text-secondary hover:bg-surface-hover cursor-pointer"}`}>
              {d || ""}
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-subtle flex items-center justify-between text-[10px] text-muted">
          <span>{now.toLocaleDateString("en-US", { weekday: "long" })}</span>
          <span>{now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
    </div>
  );
}

function SystemTrayPopup({ title, children, onClose }) {
  return (
    <div className="absolute top-full mt-2 z-[200]" data-tray-popup style={{ right: 0 }}>
      <div className="rounded-xl shadow-2xl border border-subtle overflow-hidden p-3" style={{ width: 220, background: "var(--menu-bg)", backdropFilter: "blur(30px)" }}>
        <div className="text-[10px] text-muted uppercase tracking-wider font-semibold mb-2">{title}</div>
        {children}
      </div>
    </div>
  );
}

export default function TopPanel() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [showOverview, setShowOverview] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showWifi, setShowWifi] = useState(false);
  const [showBattery, setShowBattery] = useState(false);

  const closeAllPopups = useCallback(() => {
    setShowCalendar(false);
    setShowVolume(false);
    setShowWifi(false);
    setShowBattery(false);
  }, []);

  const trayRef = useRef(null);

  useEffect(() => {
    if (!showCalendar && !showVolume && !showWifi && !showBattery) return;
    const handler = (e) => {
      if (!trayRef.current || !trayRef.current.contains(e.target)) closeAllPopups();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCalendar, showVolume, showWifi, showBattery, closeAllPopups]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("favorites");
  const [tabCtxMenu, setTabCtxMenu] = useState(null);
  const [hoverPreview, setHoverPreview] = useState(null);
  const previewTimer = useRef(null);
  const { focusedWindowId, windows, openWindow, focusWindow, closeWindow, minimizeWindow, setStartMenuOpen } = useWindowStore();
  const audioStore = useAudioStore();
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const battery = useBattery();
  const network = useNetwork();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }));
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const openWindows = Object.values(windows).filter((w) => w.isOpen);

  const handleWindowClick = (id) => {
    const w = windows[id];
    if (w?.isMinimized) openWindow(id);
    else focusWindow(id);
  };

  const handleOpenApp = (id) => {
    openWindow(id);
    setShowOverview(false);
    setStartMenuOpen(false);
  };

  const handleVolumeChange = (e) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    audioStore.setVolume(val / 100);
    setMuted(val === 0);
  };

  const handleMuteToggle = () => {
    audioStore.toggleMute();
    setMuted(!muted);
  };

  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeCategory === "favorites" ? appsByCategory.favorites : appsByCategory[activeCategory] || uniqueApps;
    }
    const q = searchQuery.toLowerCase();
    return uniqueApps.filter((a) => a.label.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));
  }, [searchQuery, activeCategory]);

  const VolumeIcon = muted || volume === 0 ? FiVolumeX : volume < 50 ? FiVolume1 : FiVolume2;
  const displayVolume = muted ? 0 : volume;

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[50] flex items-center px-3 text-xs select-none"
        style={{
          height: 48,
          background: "var(--panel-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--panel-border)",
          color: "var(--panel-text)",
        }}
      >
        {/* ── LEFT: start button ── */}
        <div className="flex items-center gap-1 min-w-0">
          <button
            onClick={() => { setShowOverview(true); setStartMenuOpen(true); setSearchQuery(""); setActiveCategory("favorites"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all duration-150 font-medium text-sm btn-hover"
          >
            <FaUbuntu className="text-base text-orange-500" />
            <span className="opacity-70 hidden sm:inline">Start</span>
          </button>
        </div>

        {/* ── LEFT: window task buttons ── */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto hide-scrollbar ml-1">
          {openWindows.map((w) => {
            const isActive = w.id === focusedWindowId;
            const isMin = w.isMinimized;
            return (
              <button
                key={w.id}
                onClick={() => handleWindowClick(w.id)}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setTabCtxMenu({ x: e.clientX, y: e.clientY, id: w.id }); }}
                onMouseEnter={(e) => {
                  if (previewTimer.current) clearTimeout(previewTimer.current);
                  const rect = e.currentTarget.getBoundingClientRect();
                  previewTimer.current = setTimeout(() => {
                    setHoverPreview({ id: w.id, title: w.title, icon: w.icon, app: w.app, x: rect.left, y: rect.bottom + 4 });
                  }, 600);
                }}
                onMouseLeave={() => { if (previewTimer.current) clearTimeout(previewTimer.current); setHoverPreview(null); }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all duration-150 text-[11px] shrink-0 btn-hover relative ${
                  isActive ? "bg-white/25 text-white font-semibold shadow-sm" : isMin ? "opacity-30 hover:opacity-60 hover:bg-white/5" : "opacity-50 hover:opacity-80 hover:bg-white/5"
                }`}
                style={{ borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent", color: "var(--panel-text)" }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style={{ background: "var(--accent)" }} />
                )}
                <span className="text-xs">{appIcons[w.icon] || "\uD83D\uDCC4"}</span>
                <span className="truncate max-w-[100px]">{w.title}</span>
              </button>
            );
          })}
        </div>

        {tabCtxMenu && (
          <ContextMenu
            x={tabCtxMenu.x} y={tabCtxMenu.y}
            items={[
              { label: "Minimize", icon: "—", onClick: () => minimizeWindow(tabCtxMenu.id) },
              { label: "Close", icon: "✕", onClick: () => closeWindow(tabCtxMenu.id), danger: true },
            ]}
            onClose={() => setTabCtxMenu(null)}
          />
        )}

        {hoverPreview && (
          <div className="fixed z-[9999] rounded-xl shadow-2xl border border-subtle overflow-hidden p-3 pointer-events-none"
            style={{ left: hoverPreview.x, top: hoverPreview.y, minWidth: 140, background: "var(--menu-bg)", backdropFilter: "blur(30px)" }}>
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{appIcons[hoverPreview.icon] || "\uD83D\uDCC4"}</span>
              <div>
                <div className="text-xs font-medium text-secondary">{hoverPreview.title}</div>
                <div className="text-[9px] text-muted mt-0.5">{hoverPreview.app || "Window"}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT: system tray ── */}
        <div ref={trayRef} className="flex items-center gap-0.5 shrink-0 ml-auto" style={{ color: "var(--panel-text-secondary)" }}>
          {/* avatar */}
          <button
            onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2); }}
            className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 btn-hover flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-white/10 cursor-pointer mr-1"
          >YJ</button>

          <div className="flex items-center relative">

            {/* ── Volume ── */}
            <button
              onClick={() => { setShowVolume(!showVolume); setShowWifi(false); setShowBattery(false); }}
              className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/10 transition-colors btn-hover"
            >
              <VolumeIcon size={14} style={{ display: "block" }} />
              {showVolume && (
                <SystemTrayPopup title="Volume" onClose={() => setShowVolume(false)}>
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={handleMuteToggle} className="text-muted hover:text-secondary transition-colors shrink-0">
                      {muted || volume === 0 ? <FiVolumeX size={14} /> : volume < 50 ? <FiVolume1 size={14} /> : <FiVolume2 size={14} />}
                    </button>
                    {/* Styled slider track */}
                    <div className="relative flex-1 flex items-center" style={{ height: 20 }}>
                      <div className="absolute inset-x-0 rounded-full" style={{ height: 4, background: "var(--bg-elevated)" }} />
                      <div className="absolute left-0 rounded-full" style={{ height: 4, width: `${displayVolume}%`, background: "var(--accent)", transition: "width 0.05s" }} />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={handleVolumeChange}
                        style={{
                          position: "relative",
                          width: "100%",
                          margin: 0,
                          appearance: "none",
                          WebkitAppearance: "none",
                          background: "transparent",
                          cursor: "pointer",
                          height: 20,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-muted w-6 text-right shrink-0">{displayVolume}</span>
                  </div>
                  <style>{`
                    .vol-thumb::-webkit-slider-thumb, input[type=range]::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      width: 14px; height: 14px;
                      border-radius: 50%;
                      background: var(--accent);
                      border: 2px solid rgba(255,255,255,0.2);
                      cursor: pointer;
                      box-shadow: 0 1px 6px rgba(0,0,0,0.4);
                      margin-top: -5px;
                    }
                    input[type=range]::-moz-range-thumb {
                      width: 14px; height: 14px;
                      border-radius: 50%;
                      background: var(--accent);
                      border: 2px solid rgba(255,255,255,0.2);
                      cursor: pointer;
                    }
                    input[type=range]::-webkit-slider-runnable-track { height: 4px; background: transparent; }
                    input[type=range]::-moz-range-track { height: 4px; background: transparent; }
                    input[type=range]:focus { outline: none; }
                  `}</style>
                </SystemTrayPopup>
              )}
            </button>

            {/* ── WiFi ── */}
            <button
              onClick={() => { setShowWifi(!showWifi); setShowVolume(false); setShowBattery(false); }}
              className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/10 transition-colors btn-hover"
            >
              <WifiBars strength={network.strength} connected={network.connected} />
              {showWifi && (
                <SystemTrayPopup title="Network" onClose={() => setShowWifi(false)}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-secondary">Status</span>
                      <span className={network.connected ? "text-green-400/80" : "text-red-400/80"}>{network.connected ? "Connected" : "Offline"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-secondary">IP</span>
                      <span className="text-muted">{network.ip}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-secondary">Signal</span>
                      <span className="text-muted">{network.connected ? `${network.strength}% — ${network.strength >= 70 ? "Excellent" : network.strength >= 40 ? "Good" : "Weak"}` : "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-secondary">Type</span>
                      <span className="text-muted">{network.type}</span>
                    </div>
                  </div>
                </SystemTrayPopup>
              )}
            </button>

            {/* ── Battery ── */}
            <button
              onClick={() => { setShowBattery(!showBattery); setShowVolume(false); setShowWifi(false); }}
              className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/10 transition-colors btn-hover"
            >
              <BatteryBar level={battery.level} charging={battery.charging} />
              {showBattery && (
                <SystemTrayPopup title="Power" onClose={() => setShowBattery(false)}>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-secondary">Battery</span>
                      <span className={`font-medium ${battery.level <= 20 ? "text-red-400" : battery.level <= 40 ? "text-amber-400" : "text-green-400/80"}`}>{battery.level}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-secondary">Status</span>
                      <span className="text-muted">{battery.charging ? "Charging" : "On battery"}</span>
                    </div>
                    {battery.charging && battery.timeToFull && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-secondary">Time to full</span>
                        <span className="text-muted">~{battery.timeToFull}</span>
                      </div>
                    )}
                    {!battery.charging && battery.timeLeft && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-secondary">Time left</span>
                        <span className="text-muted">~{battery.timeLeft}</span>
                      </div>
                    )}
                    {/* battery bar */}
                    <div className="mt-1 rounded-full overflow-hidden" style={{ height: 4, background: "var(--bg-elevated)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${battery.level}%`, background: battery.level <= 20 ? "#f87171" : battery.level <= 40 ? "#fbbf24" : "#4ade80" }} />
                    </div>
                  </div>
                </SystemTrayPopup>
              )}
            </button>
          </div>

          {/* ── Clock / Calendar ── */}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex flex-col items-end justify-center px-2 h-8 rounded-md border-l border-white/10 relative hover:bg-white/10 transition-colors btn-hover ml-1"
          >
            <div className="text-[11px] font-medium leading-none" style={{ color: "var(--panel-text)" }}>{time}</div>
            <div className="text-[9px] mt-0.5" style={{ color: "var(--panel-text-secondary)" }}>{date}</div>
            {showCalendar && <CalendarPopup onClose={() => setShowCalendar(false)} />}
          </button>
        </div>
      </div>

      {/* ════ APP OVERVIEW / START MENU ════ */}
      {showOverview && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]"
          style={{
            background: "rgba(5, 5, 15, 0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            animation: "fadeSlideIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          onClick={() => { setShowOverview(false); setStartMenuOpen(false); }}
        >
          <div
            className="rounded-2xl shadow-2xl border border-subtle overflow-hidden"
            style={{ width: 600, maxHeight: "70vh", background: "var(--menu-bg)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 pb-2">
              <div className="flex items-center gap-3 bg-black/20 rounded-xl px-4 py-2.5 border border-subtle transition-all duration-200 focus-within:border-accent/30">
                <FiSearch size={14} className="text-muted shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applications..."
                  className="flex-1 bg-transparent outline-none text-sm text-secondary placeholder-muted"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex" style={{ minHeight: 320 }}>
              <div className="w-36 shrink-0 p-2 space-y-0.5 border-r border-subtle">
                {categories.map((cat) => {
                  const CatIcon = cat.icon;
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs transition-all duration-150 btn-hover ${
                        isActive ? "bg-accent/15 text-accent font-medium" : "text-muted hover:text-secondary hover:bg-surface-hover"
                      }`}
                    >
                      <CatIcon size={14} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 p-3 overflow-auto">
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredApps.map(({ id, icon, label, desc }) => (
                    <button
                      key={id}
                      onClick={() => handleOpenApp(id)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-hover transition-all duration-150 group btn-hover"
                    >
                      <span className="text-2xl shrink-0">{icon}</span>
                      <div className="text-left min-w-0">
                        <div className="text-xs font-medium text-secondary truncate">{label}</div>
                        <div className="text-[10px] text-muted truncate">{desc}</div>
                      </div>
                    </button>
                  ))}
                  {filteredApps.length === 0 && <div className="col-span-2 text-center py-8 text-muted text-xs">No results found</div>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 border-t border-subtle bg-black/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-xs font-bold text-white">
                  YJ
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-secondary">Yuki</div>
                  <div className="text-[9px] text-muted">Online</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { handleOpenApp("settings"); }}
                  className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-secondary transition-all duration-150 btn-hover"
                  title="Settings"
                >
                  <FaCog size={12} />
                </button>
                <button
                  onClick={() => { window.location.reload(); }}
                  className="p-2 rounded-lg hover:bg-surface-hover text-muted hover:text-secondary transition-all duration-150 btn-hover"
                  title="Restart"
                >
                  <FaPowerOff size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}