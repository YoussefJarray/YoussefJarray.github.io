"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useWindowStore } from "../store/windowStore";
import { useAudioStore } from "../store/audioStore";
import gsap from "gsap";
import { FiSearch, FiVolume2, FiVolume1, FiVolumeX, FiWifiOff } from "react-icons/fi";
import { FaCog, FaPowerOff } from "react-icons/fa";
import { categories, allApps, getAppsByCategory } from "../data/appRegistry";
import { getAppIcon, getSmallIcon } from "../data/iconRegistry";
import ContextMenu from "./ContextMenu";

const uniqueApps = allApps.filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i);

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

function WifiBars({ strength, connected }) {
  if (!connected) return <FiWifiOff size={16} style={{ display: "block" }} />;
  const bars = strength >= 70 ? 3 : strength >= 40 ? 2 : 1;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: "block", flexShrink: 0 }}>
      {[0, 1, 2].map(i => (
        <rect key={i} x={1 + i * 5} y={16 - 3 - (i + 1) * 3.5} width="4" height={(i + 1) * 3.5} rx="1" fill="currentColor" opacity={i < bars ? 1 : 0.25} />
      ))}
    </svg>
  );
}

function BatteryBar({ level, charging }) {
  const isLow = level <= 20;
  const isMid = level > 20 && level <= 40;
  const fillColor = charging ? "#4ade80" : isLow ? "#f87171" : isMid ? "#fbbf24" : "currentColor";
  const filled = Math.round((level / 100) * 4);
  return (
    <svg width="24" height="14" viewBox="0 0 24 14" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <rect x="0.5" y="1" width="19" height="12" rx="2.5" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.7" />
      <rect x="20.5" y="4" width="2.5" height="6" rx="1" fill="currentColor" opacity="0.5" />
      {[0, 1, 2, 3].map(i => (
        <rect key={i} x={2.5 + i * 4.5} y="2.5" width="3.5" height="9" rx="0.8" fill={fillColor} opacity={i < filled ? 1 : 0.1} />
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
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const days = [];
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="absolute top-full right-0 mt-2 z-[200]" onClick={(e) => e.stopPropagation()}>
      <div className="rounded-2xl shadow-2xl border border-white/10 overflow-hidden" style={{ width: 260, background: "rgba(15, 15, 30, 0.95)", backdropFilter: "blur(24px)" }}>
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }} className="text-gray-200/40 hover:text-gray-200/80 transition-colors text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-white/5">&lsaquo;</button>
          <span className="text-xs font-semibold text-gray-200/80">{monthName}</span>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }} className="text-gray-200/40 hover:text-gray-200/80 transition-colors text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-white/5">&rsaquo;</button>
        </div>
        <div className="grid grid-cols-7 gap-0 px-4 pt-2">
          {dayNames.map((d) => <div key={d} className="text-[9px] text-gray-300 text-center h-6 flex items-center justify-center font-semibold tracking-wider uppercase">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0 px-4 pb-3">
          {days.map((d, i) => (
            <div key={i} className={`text-xs text-center h-7 flex items-center justify-center rounded-lg transition-all ${d === null ? "" : isCurrentMonth && d === today ? "text-gray-200 font-bold" : "text-gray-200/50 hover:text-gray-200 hover:bg-white/5 cursor-pointer"}`}
              style={isCurrentMonth && d === today ? { background: "var(--accent)", boxShadow: "0 2px 8px rgba(59,130,246,0.3)" } : {}}
            >
              {d || ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemTrayPopup({ title, children }) {
  return (
    <div className="absolute top-full mt-2 z-[200]" style={{ right: 0 }}>
      <div className="rounded-xl shadow-2xl border border-white/10 overflow-hidden p-3" style={{ width: 220, background: "rgba(15, 15, 30, 0.95)", backdropFilter: "blur(24px)" }}>
        <div className="text-[9px] text-gray-300 uppercase tracking-[0.15em] font-semibold mb-2.5">{title}</div>
        {children}
      </div>
    </div>
  );
}

function ApplicationsMenu({ searchQuery, activeCategory, setSearchQuery, setActiveCategory, filteredApps, handleOpenApp, closeMenu }) {
  const gridRef = useRef(null);
  const menuRef = useRef(null);
  const sidebarRef = useRef(null);
  const itemsRef = useRef([]);
  itemsRef.current = [];

  useEffect(() => {
    if (gridRef.current) gridRef.current.scrollTop = 0;
  }, [activeCategory]);

  useEffect(() => {
    if (!menuRef.current) return;
    gsap.fromTo(menuRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.25, ease: "back.out(1.4)" });
    if (sidebarRef.current) {
      gsap.fromTo(sidebarRef.current.children, { opacity: 0, x: -8 }, { opacity: 1, x: 0, stagger: 0.04, duration: 0.2, ease: "power2.out", delay: 0.1 });
    }
  }, []);

  useEffect(() => {
    if (itemsRef.current.length > 0) {
      gsap.fromTo(itemsRef.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.02, duration: 0.18, ease: "power2.out" });
    }
  }, [filteredApps]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      style={{
        background: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
      onClick={closeMenu}
    >
      <div
        ref={menuRef}
        className="rounded-2xl shadow-2xl border border-white/[0.06] overflow-hidden flex"
        style={{
          width: 720,
          height: 520,
          background: "var(--menu-bg)",
          backdropFilter: "blur(40px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
          {/* ─── Sidebar ─── */}
          <div ref={sidebarRef} className="w-[164px] shrink-0 flex flex-col p-3 gap-1 border-r border-white/[0.05] bg-white/[0.015]">
          {/* Search */}
          <div className="flex items-center gap-2.5 bg-white/[0.05] rounded-xl px-3 h-9 border border-white/[0.04] transition-all duration-200 focus-within:border-[var(--accent)]/30 focus-within:bg-white/[0.07] mb-2">
            <FiSearch size={13} className="text-gray-200/25 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 bg-transparent outline-none text-xs text-gray-200/60 placeholder-white/20"
              autoFocus
            />
          </div>

          {categories.map((cat) => {
            const CatIcon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-[7px] rounded-lg text-xs transition-all duration-150 ${
                  isActive
                    ? "bg-white/[0.09] text-gray-200 font-medium"
                    : "text-gray-200/35 hover:text-gray-200/60 hover:bg-white/[0.04]"
                }`}
              >
                <span className="flex items-center justify-center w-4 shrink-0">
                  <CatIcon size={13} />
                </span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Main ─── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-5 pt-4 pb-1.5 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold text-gray-300 uppercase tracking-[0.12em]">
                {categories.find(c => c.id === activeCategory)?.label || "All"}
              </h2>
              <span className="text-[10px] text-gray-200/20">{filteredApps.length} apps</span>
            </div>
          </div>

          {/* Grid */}
          <div ref={gridRef} className="flex-1 overflow-y-auto px-4 pb-3 pt-1">
            <div className="grid grid-cols-3 gap-1.5 auto-rows-max">
              {filteredApps.map(({ id, title }) => (
                <button
                  key={id}
                  ref={(el) => { if (el) itemsRef.current.push(el); }}
                  onClick={() => handleOpenApp(id)}
                  className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl hover:bg-white/[0.05] active:bg-white/[0.08] transition-all duration-150 group"
                >
                  <span className="flex items-center justify-center w-[28px] h-[28px] text-[18px] leading-none">{getAppIcon(id, "lg")}</span>
                  <span className="text-[11px] font-medium text-gray-200/60 group-hover:text-gray-200/90 text-center leading-tight transition-colors truncate w-full">
                    {title}
                  </span>
                </button>
              ))}
              {filteredApps.length === 0 && (
                <div className="col-span-3 text-center py-16 text-gray-200/20 text-xs">No results found</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-[9px] border-t border-white/[0.04] bg-white/[0.015] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-[10px] font-bold text-gray-200 shadow-lg shadow-black/20">
                YJ
              </div>
              <div className="text-left leading-tight">
                <div className="text-xs font-medium text-gray-200/65">Yuki</div>
                <div className="text-[9px] text-gray-200/25">Online</div>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => { handleOpenApp("settings"); }}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-300 hover:text-gray-200/60 transition-all duration-150"
                title="Settings"
              >
                <FaCog size={12} />
              </button>
              <button
                onClick={() => { window.location.reload(); }}
                className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-300 hover:text-gray-200/60 transition-all duration-150"
                title="Restart"
              >
                <FaPowerOff size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function TopPanel() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("favorites");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showWifi, setShowWifi] = useState(false);
  const [showBattery, setShowBattery] = useState(false);
  const [tabCtxMenu, setTabCtxMenu] = useState(null);
  const [hoverPreview, setHoverPreview] = useState(null);
  const previewTimer = useRef(null);
  const trayRef = useRef(null);

  const { focusedWindowId, windows, openWindow, focusWindow, closeWindow, minimizeWindow, setStartMenuOpen, startMenuOpen } = useWindowStore();
  const audioStore = useAudioStore();
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(50);
  const battery = useBattery();
  const network = useNetwork();

  const closeAllPopups = useCallback(() => {
    setShowCalendar(false);
    setShowVolume(false);
    setShowWifi(false);
    setShowBattery(false);
  }, []);

  useEffect(() => {
    if (!showCalendar && !showVolume && !showWifi && !showBattery) return;
    const handler = (e) => {
      if (!trayRef.current || !trayRef.current.contains(e.target)) closeAllPopups();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCalendar, showVolume, showWifi, showBattery, closeAllPopups]);

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

  const closeMenu = useCallback(() => {
    setStartMenuOpen(false);
    setSearchQuery("");
    setActiveCategory("favorites");
  }, [setStartMenuOpen]);

  const handleOpenApp = useCallback((id) => {
    openWindow(id);
    closeMenu();
  }, [openWindow, closeMenu]);

  const handleWindowClick = (id) => {
    const w = windows[id];
    if (w?.isMinimized) openWindow(id);
    else focusWindow(id);
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
      return getAppsByCategory(activeCategory);
    }
    const q = searchQuery.toLowerCase();
    return uniqueApps.filter((a) => a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q));
  }, [searchQuery, activeCategory]);

  const VolumeIcon = muted || volume === 0 ? FiVolumeX : volume < 50 ? FiVolume1 : FiVolume2;
  const displayVolume = muted ? 0 : volume;

  return (
    <>
      {/* ── Panel bar ── */}
      <div
        data-gsap="top-panel"
        className="fixed top-0 left-0 right-0 z-[50] flex items-center px-2 text-xs select-none"
        style={{
          height: 44,
          background: "var(--panel-bg)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderBottom: "1px solid var(--panel-border)",
          color: "var(--panel-text)",
        }}
      >
        {/* ── LEFT: Application Launcher ── */}
        <button
          onClick={() => { setStartMenuOpen(true); setSearchQuery(""); setActiveCategory("favorites"); }}
          onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.08, duration: 0.15, ease: "back.out(1.5)" })}
          onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.12 })}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-150"
          title="Applications"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2" opacity="0.4" />
            <circle cx="12" cy="4" r="1.5" opacity="0.6" />
            <circle cx="12" cy="20" r="1.5" opacity="0.6" />
            <circle cx="4" cy="12" r="1.5" opacity="0.6" />
            <circle cx="20" cy="12" r="1.5" opacity="0.6" />
            <circle cx="5.5" cy="5.5" r="1.2" opacity="0.4" />
            <circle cx="18.5" cy="5.5" r="1.2" opacity="0.4" />
            <circle cx="5.5" cy="18.5" r="1.2" opacity="0.4" />
            <circle cx="18.5" cy="18.5" r="1.2" opacity="0.4" />
          </svg>
        </button>

        {/* ── CENTER: KDE Icons-Only Task Manager ── */}
        <div className="flex items-center gap-0.5 flex-1 overflow-x-auto hide-scrollbar mx-1" style={{ height: 36 }}>
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
                    setHoverPreview({ id: w.id, title: w.title, icon: w.icon, app: w.app, x: rect.left, y: rect.bottom + 6 });
                  }, 600);
                }}
                onMouseLeave={() => { if (previewTimer.current) clearTimeout(previewTimer.current); setHoverPreview(null); }}
                className="relative flex items-center gap-2.5 px-3 rounded-md transition-all duration-100 shrink-0 group"
                style={{
                  height: 32,
                  background: isActive ? "var(--accent-light)" : "transparent",
                  color: isActive ? "var(--accent)" : isMin ? "var(--text-muted)" : "var(--text-secondary)",
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "var(--bg-surface)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = isMin ? "var(--text-muted)" : "var(--text-secondary)";
                  }
                }}
              >
                <span className="text-sm shrink-0 leading-none">{getSmallIcon(w.icon)}</span>
                <span className="truncate max-w-[80px] text-[11px] font-medium">{w.title}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1 right-1 h-[2px] rounded-full" style={{ background: "var(--accent)" }} />
                )}
                {!isActive && !isMin && (
                  <span className="absolute bottom-0 left-4 right-4 h-[1px] rounded-full" style={{ background: "var(--border)", opacity: 0.5 }} />
                )}
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
          <div className="fixed z-[9999] rounded-xl shadow-2xl border border-white/10 overflow-hidden p-3 pointer-events-none"
            style={{ left: hoverPreview.x, top: hoverPreview.y, minWidth: 140, background: "rgba(15, 15, 30, 0.95)", backdropFilter: "blur(24px)" }}>
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{getSmallIcon(hoverPreview.icon)}</span>
              <div>
                <div className="text-xs font-medium text-gray-200/80">{hoverPreview.title}</div>
                <div className="text-[8px] text-gray-300 mt-0.5">{hoverPreview.app || "Window"}</div>
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT: System tray ── */}
        <div ref={trayRef} className="flex items-center gap-0.5 shrink-0 ml-auto">
          {/* YJ Avatar */}
          <button
            onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); spawnConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2); }}
            onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.12, rotate: -5, duration: 0.2, ease: "back.out(1.7)" })}
            onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, rotate: 0, duration: 0.2, ease: "power2.out" })}
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-rose-600 hover:from-orange-400 hover:to-rose-500 flex items-center justify-center text-[9px] font-bold text-gray-200 transition-all duration-150 mr-1"
            title="Click for confetti!"
          >YJ</button>

          {/* Volume */}
          <div className="relative">
            <button
              onClick={() => { setShowVolume(!showVolume); setShowWifi(false); setShowBattery(false); setShowCalendar(false); }}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.08, duration: 0.15, ease: "back.out(1.5)" })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.12 })}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-150"
              title={`Volume: ${volume}%`}
            >
              <VolumeIcon size={15} style={{ display: "block" }} />
            </button>
            {showVolume && (
              <SystemTrayPopup title="Volume">
                <div className="flex items-center gap-2.5">
                  <button onClick={handleMuteToggle} className="text-gray-200/50 hover:text-gray-200/80 transition-colors shrink-0">
                    {muted || volume === 0 ? <FiVolumeX size={15} /> : volume < 50 ? <FiVolume1 size={15} /> : <FiVolume2 size={15} />}
                  </button>
                  <div className="relative flex-1 flex items-center" style={{ height: 20 }}>
                    <div className="absolute inset-x-0 rounded-full" style={{ height: 3, background: "rgba(255,255,255,0.08)" }} />
                    <div className="absolute left-0 rounded-full" style={{ height: 3, width: `${displayVolume}%`, background: "var(--accent)", transition: "width 0.08s" }} />
                    <input
                      type="range" min="0" max="100" value={volume} onChange={handleVolumeChange}
                      style={{ position: "relative", width: "100%", margin: 0, appearance: "none", WebkitAppearance: "none", background: "transparent", cursor: "pointer", height: 20 }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-200/40 w-6 text-right shrink-0 font-mono">{displayVolume}</span>
                </div>
                <style>{`
                  input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%;
                    background: var(--accent); border: 2px solid rgba(255,255,255,0.15);
                    cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.5); margin-top: -5px;
                  }
                  input[type=range]::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--accent); border: 2px solid rgba(255,255,255,0.15); cursor: pointer; }
                  input[type=range]::-webkit-slider-runnable-track { height: 3px; background: transparent; }
                  input[type=range]::-moz-range-track { height: 3px; background: transparent; }
                  input[type=range]:focus { outline: none; }
                `}</style>
              </SystemTrayPopup>
            )}
          </div>

          {/* WiFi */}
          <div className="relative">
            <button
              onClick={() => { setShowWifi(!showWifi); setShowVolume(false); setShowBattery(false); setShowCalendar(false); }}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.08, duration: 0.15, ease: "back.out(1.5)" })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.12 })}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-150"
              title={network.connected ? "Connected" : "Offline"}
            >
              <WifiBars strength={network.strength} connected={network.connected} />
            </button>
            {showWifi && (
              <SystemTrayPopup title="Network">
                <div className="space-y-2">
                  {["Status", "IP Address", "Signal", "Type"].map((label, i) => {
                    const vals = [
                      <span key="s" className={network.connected ? "text-green-400" : "text-red-400"}>{network.connected ? "Connected" : "Offline"}</span>,
                      <span key="ip" className="text-gray-200/60 font-mono text-[10px]">{network.ip}</span>,
                      <span key="sig" className="text-gray-200/60">{network.connected ? `${network.strength}% — ${network.strength >= 70 ? "Excellent" : network.strength >= 40 ? "Good" : "Weak"}` : "—"}</span>,
                      <span key="t" className="text-gray-200/60">{network.type}</span>,
                    ];
                    return (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-gray-200/40 text-[10px]">{label}</span>
                        <span className="text-[11px]">{vals[i]}</span>
                      </div>
                    );
                  })}
                </div>
              </SystemTrayPopup>
            )}
          </div>

          {/* Battery */}
          <div className="relative">
            <button
              onClick={() => { setShowBattery(!showBattery); setShowVolume(false); setShowWifi(false); setShowCalendar(false); }}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.08, duration: 0.15, ease: "back.out(1.5)" })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.12 })}
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-150"
              title={`${battery.level}% ${battery.charging ? "(charging)" : ""}`}
            >
              <BatteryBar level={battery.level} charging={battery.charging} />
            </button>
            {showBattery && (
              <SystemTrayPopup title="Power">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200/40 text-[10px]">Charge</span>
                    <span className="text-[11px] font-medium" style={{ color: battery.level <= 20 ? "#f87171" : battery.level <= 40 ? "#fbbf24" : "#4ade80" }}>{battery.level}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200/40 text-[10px]">State</span>
                    <span className="text-gray-200/60 text-[11px]">{battery.charging ? "Charging" : "Discharging"}</span>
                  </div>
                  {battery.charging && battery.timeToFull && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-200/40 text-[10px]">Full in</span>
                      <span className="text-gray-200/60 text-[11px]">~{battery.timeToFull}</span>
                    </div>
                  )}
                  {!battery.charging && battery.timeLeft && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-200/40 text-[10px]">Remaining</span>
                      <span className="text-gray-200/60 text-[11px]">~{battery.timeLeft}</span>
                    </div>
                  )}
                  <div className="rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${battery.level}%`, background: battery.level <= 20 ? "#f87171" : battery.level <= 40 ? "#fbbf24" : "#4ade80" }} />
                  </div>
                </div>
              </SystemTrayPopup>
            )}
          </div>

          {/* Clock / Calendar */}
          <div className="relative">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.15, ease: "back.out(1.5)" })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.12 })}
              className="flex flex-col items-end justify-center px-2.5 h-9 rounded-lg hover:bg-white/[0.06] active:bg-white/[0.1] transition-all duration-150 ml-0.5"
            >
              <span className="text-[12px] font-medium leading-none text-gray-200/85">{time}</span>
              <span className="text-[8px] mt-0.5 text-gray-200/40">{date}</span>
            </button>
            {showCalendar && <CalendarPopup onClose={() => setShowCalendar(false)} />}
          </div>
        </div>
      </div>

      {/* ════ START MENU ════ */}
      {startMenuOpen && (
        <ApplicationsMenu
          searchQuery={searchQuery}
          activeCategory={activeCategory}
          setSearchQuery={setSearchQuery}
          setActiveCategory={setActiveCategory}
          filteredApps={filteredApps}
          handleOpenApp={handleOpenApp}
          closeMenu={closeMenu}
        />
      )}
    </>
  );
}
