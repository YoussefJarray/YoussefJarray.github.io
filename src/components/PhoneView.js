"use client";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWindowStore } from "../store/windowStore";
import { useThemeStore } from "../store/themeStore";
import { useWallpaperStore, wallpapers } from "../store/wallpaperStore";
import { useAudioStore } from "../store/audioStore";
import { getAppIcon } from "../data/iconRegistry";
import {
  FiVolume2, FiVolumeX, FiMoon, FiSun, FiSearch, FiArrowLeft, FiX,
  FiBattery, FiActivity, FiChevronDown,
  FiAlertCircle, FiMusic
} from "react-icons/fi";
import AudioPlayer from "./AudioPlayer";
import MusicWidget from "./MusicWidget";

const UTILITY_APPS = [
  { id: "about",       title: "About Me",     icon: "user",        app: "AboutApp"      },
  { id: "files",       title: "Projects",     icon: "folder",      app: "FileManager"   },
  { id: "terminal",    title: "Terminal",     icon: "terminal",    app: "Terminal"      },
  { id: "browser",     title: "Web Browser",  icon: "browser",     app: "BrowserApp"    },
  { id: "photos",      title: "Photos",       icon: "photos",      app: "PhotosApp"     },
  { id: "resume",      title: "Resume",       icon: "pdf",         app: "PdfViewer"     },
  { id: "calculator",  title: "Calculator",   icon: "calculator",  app: "CalculatorApp" },
  { id: "githubstats", title: "GitHub Stats", icon: "githubstats", app: "GitHubStatsApp"},
  { id: "settings",    title: "Settings",     icon: "settings",    app: "SettingsApp"   },
  { id: "markdown",    title: "Markdown",     icon: "file",        app: "MarkdownViewer", hidden: true },
];

const LAUNCHER_APPS = UTILITY_APPS.filter((a) => !a.hidden);

import FileManager    from "./FileManager";
import Terminal       from "./Terminal";
import AboutApp       from "./AboutApp";
import SettingsApp    from "./SettingsApp";
import BrowserApp     from "./BrowserApp";
import PhotosApp      from "./PhotosApp";
import MarkdownViewer from "./MarkdownViewer";
import PdfViewer      from "./PdfViewer";
import CalculatorApp  from "./CalculatorApp";
import GitHubStatsApp from "./GitHubStatsApp";

const appComponents = {
  FileManager, Terminal, AboutApp, SettingsApp, BrowserApp, PhotosApp,
  MarkdownViewer, PdfViewer, CalculatorApp, GitHubStatsApp,
};

const DOCK_IDS = ["about", "browser", "files", "terminal"];

function useWallpaperBrightness(wpUrl) {
  const [isDark, setIsDark] = useState(true);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 32, 32);
        const data = ctx.getImageData(0, 0, 32, 32).data;
        let total = 0;
        for (let i = 0; i < data.length; i += 4) {
          total += data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        }
        setIsDark(total / (data.length / 4) < 140);
      } catch {}
    };
    img.onerror = () => setIsDark(true);
    img.src = wpUrl;
  }, [wpUrl]);
  return isDark;
}

export default function PhoneView() {
  const { windows, focusedWindowId, openWindow, closeWindow, focusWindow } = useWindowStore();
  const { selected } = useWallpaperStore();
  const themeMode = useThemeStore((s) => s.mode);
  const toggleTheme = useThemeStore((s) => s.toggle);
  const { volume, muted, toggleMute } = useAudioStore();

  const selectedWp = useMemo(
    () => wallpapers.find((w) => w.id === selected.wallpaper) || wallpapers[0],
    [selected.wallpaper]
  );

  const isWallpaperDark = useWallpaperBrightness(selectedWp.url);

  const [time, setTime]               = useState("");
  const [date, setDate]               = useState("");
  const [battery, setBattery]         = useState(85);
  const [isLocked, setIsLocked]       = useState(true);
  const [recentsOpen, setRecentsOpen] = useState(false);
  const [quickOpen, setQuickOpen]     = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [brightness, setBrightness]   = useState(100);

  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const isSwiping = useRef(false);
  const touchStartAtQuickEdge = useRef(false);
  const touchStartScrollTop = useRef(0);
  const quickScrollMoved = useRef(false);
  const touchStartedInQuickContent = useRef(false);

  const mainAreaRef = useRef(null);
  const quickScrollRef = useRef(null);

  const activeApp = useMemo(() => {
    if (!focusedWindowId) return null;
    const u = UTILITY_APPS.find((a) => a.id === focusedWindowId);
    if (!u) return null;
    return windows[focusedWindowId]?.isOpen ? u : null;
  }, [focusedWindowId, windows]);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = false;
    quickScrollMoved.current = false;
    const el = quickScrollRef.current;
    touchStartedInQuickContent.current = !!(el && el.contains(e.target));
    if (el && el.contains(e.target)) {
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      const atTop = el.scrollTop <= 0;
      touchStartAtQuickEdge.current = atBottom || atTop;
      touchStartScrollTop.current = el.scrollTop;
    } else {
      touchStartAtQuickEdge.current = true;
      touchStartScrollTop.current = 0;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    const dy = e.touches[0].clientY - touchStartY.current;
    const dx = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(dy) > 15 || Math.abs(dx) > 15) {
      isSwiping.current = true;
    }
    const el = quickScrollRef.current;
    if (el && Math.abs(el.scrollTop - touchStartScrollTop.current) > 2) {
      quickScrollMoved.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dy) < 25 || Math.abs(dy) < Math.abs(dx)) {
      if (Math.abs(dy) < 10 && Math.abs(dx) < 10 && !activeApp && !isLocked && !drawerOpen && !recentsOpen && !quickOpen) {
        return;
      }
      return;
    }

    if (dy > 0) {
      if (isLocked) return;
      if (!drawerOpen && !recentsOpen) setQuickOpen(true);
      else if (drawerOpen) setDrawerOpen(false);
    } else {
      if (isLocked) { setIsLocked(false); return; }
      if (quickOpen) {
        if (quickScrollMoved.current) return;
        if (touchStartedInQuickContent.current) {
          const el = quickScrollRef.current;
          if (el) {
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
            const atTop = el.scrollTop <= 0;
            if (!atTop && !atBottom) return;
            if (!touchStartAtQuickEdge.current) return;
            if (atBottom && dy > -60) return;
          }
          setQuickOpen(false);
          return;
        }
        setQuickOpen(false);
        return;
      }
      if (!activeApp && !recentsOpen && !drawerOpen) setDrawerOpen(true);
    }
  }, [isLocked, activeApp, drawerOpen, recentsOpen, quickOpen]);

  useEffect(() => {
    const update = () => {
      const n = new Date();
      setTime(n.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
      setDate(n.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }));
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.getBattery) {
      navigator.getBattery().then((bat) => {
        setBattery(Math.round(bat.level * 100));
        bat.addEventListener("levelchange", () => setBattery(Math.round(bat.level * 100)));
      });
    }
  }, []);

  const filteredApps = useMemo(
    () => LAUNCHER_APPS.filter((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .sort((a, b) => a.title.localeCompare(b.title)),
    [searchQuery]
  );

  const openAppsList = useMemo(
    () => Object.entries(windows)
      .filter(([id, w]) => w.isOpen && UTILITY_APPS.some((a) => a.id === id))
      .map(([id]) => UTILITY_APPS.find((a) => a.id === id))
      .filter(Boolean),
    [windows]
  );

  const launchApp = (id) => {
    openWindow(id);
    setDrawerOpen(false);
    setRecentsOpen(false);
    setQuickOpen(false);
  };

  const handleBack = () => {
    if (quickOpen)    return setQuickOpen(false);
    if (drawerOpen)   return setDrawerOpen(false);
    if (recentsOpen)  return setRecentsOpen(false);
    if (activeApp)    closeWindow(activeApp.id);
  };

  const handleHome = () => {
    setQuickOpen(false);
    setDrawerOpen(false);
    setRecentsOpen(false);
    if (activeApp) closeWindow(activeApp.id);
  };

  const wpTextColor = isWallpaperDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.7)";
  const wpTextSecondary = isWallpaperDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)";
  const wpTextMuted = isWallpaperDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)";

  const showHomeIndicators = !isLocked && !activeApp && !drawerOpen && !recentsOpen && !quickOpen;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden select-none flex flex-col"
      style={{ filter: `brightness(${Math.max(20, brightness)}%)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Wallpaper */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src={selectedWp.url} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.35) 100%)" }} />
      </div>

      {/* ─── LOCK SCREEN ─────────────────────────────── */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.35, ease: [0.32, 0, 0.67, 0] }}
            className="absolute inset-0 z-[100] flex flex-col justify-between px-7 py-10"
            style={{
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            <div className="flex justify-between items-center" style={{ color: "rgba(255,255,255,0.7)" }}>
              <span className="text-[12px] font-semibold tracking-wide">{time}</span>
              <div className="flex items-center gap-2 text-[12px]">
                <FiBattery size={14} />
                <span>{battery}%</span>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <p className="text-sm font-medium tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>hello my name is</p>
              <h1 className="font-extrabold tracking-tight leading-none text-white" style={{ fontSize: "clamp(48px, 15vw, 76px)" }}>
                Youssef Jarray
              </h1>
              <p className="text-base font-medium mt-3" style={{ color: "rgba(255,255,255,0.6)" }}>{time} · {date}</p>
            </div>

            <motion.div
              onClick={() => setIsLocked(false)}
              className="flex flex-col items-center gap-2 cursor-pointer"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </div>
              <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.35)" }}>Swipe Up</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── STATUS BAR ──────────────────────────────── */}
      <div
        className="relative w-full shrink-0 flex items-center justify-between px-5 z-40"
        style={{
          height: 32,
          background: "var(--panel-bg)",
          borderBottom: "1px solid var(--panel-border)",
          color: "var(--panel-text)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }}
      >
        <span className="text-[11px] font-semibold tracking-wide">{time}</span>
        <div className="flex items-center gap-2 text-[11px] font-semibold" style={{ color: "var(--panel-text)" }}>
          <FiActivity size={9} className="text-emerald-400" />
          {muted ? <FiVolumeX size={11} /> : <FiVolume2 size={11} />}
          <FiBattery size={12} />
          <span>{battery}%</span>
        </div>
      </div>

      {/* ─── MAIN AREA ───────────────────────────────── */}
      <div
        ref={mainAreaRef}
        className="relative flex-1 w-full flex flex-col overflow-hidden z-10"
      >
        {/* ── ACTIVE APP SHELL ── */}
        <AnimatePresence mode="wait">
          {activeApp && !recentsOpen && (
            <motion.div
              key={activeApp.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.2, ease: [0.32, 0, 0.67, 0] }}
              className="absolute inset-0 z-20 flex flex-col"
              style={{ background: "var(--window-bg)", color: "var(--text-primary)" }}
            >
              <div
                className="w-full shrink-0 flex items-center justify-between px-4 border-b"
                style={{ height: 44, background: "var(--window-titlebar)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleBack}
                    className="flex items-center justify-center transition-all active:scale-90"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <FiArrowLeft size={17} />
                  </button>
                  <span className="text-[11px]">{getAppIcon(activeApp.icon, "sm")}</span>
                  <span className="text-[13px] font-semibold truncate max-w-[160px]" style={{ color: "var(--text-primary)" }}>
                    {activeApp.title}
                  </span>
                </div>
                <button
                  onClick={() => closeWindow(activeApp.id)}
                  className="flex items-center justify-center transition-all active:scale-90"
                  style={{ color: "var(--text-muted)" }}
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-auto min-h-0 w-full relative">
                {(() => {
                  const Comp = appComponents[activeApp.app];
                  if (!Comp) return <div className="p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>App not found</div>;
                  return <Comp id={activeApp.id} isMobile={true} />;
                })()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HOME SCREEN ── */}
        <div className="flex-1 flex flex-col z-10 px-5 pb-2 pt-4">
          {/* Widget */}
          <div
            className="rounded-2xl p-5 pointer-events-none select-none"
            style={{
              background: "var(--panel-bg)",
              border: "1px solid var(--panel-border)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "var(--accent-light)" }}>
                <span className="text-lg">{(() => {
                  const h = new Date().getHours();
                  if (h >= 5 && h < 12) return "☀️";
                  if (h >= 12 && h < 17) return "⛅";
                  if (h >= 17 && h < 21) return "🌅";
                  return "🌙";
                })()}</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-wide" style={{ color: "var(--text-secondary)" }}>
                  {(() => {
                    const h = new Date().getHours();
                    if (h >= 5 && h < 12) return "Good Morning";
                    if (h >= 12 && h < 17) return "Good Afternoon";
                    if (h >= 17 && h < 21) return "Good Evening";
                    return "Good Night";
                  })()}
                </p>
                <p className="text-[22px] font-bold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>
                  {time}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>Youssef Jarray</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>{date}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
                <FiBattery size={12} />
                {battery}%
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* App grid */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-5 w-full max-w-xs mx-auto mb-3">
            {LAUNCHER_APPS.slice(0, 8).map((app) => (
              <button
                key={app.id}
                onClick={() => launchApp(app.id)}
                className="flex flex-col items-center gap-1 focus:outline-none active:scale-90 transition-transform duration-100"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center relative"
                  style={{
                    background: isWallpaperDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                  }}
                >
                  <span className="scale-100">{getAppIcon(app.icon, "md")}</span>
                  {windows[app.id]?.isOpen && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: "var(--accent)" }} />
                  )}
                </div>
                <span className="text-[9px] font-medium truncate max-w-[60px] text-center leading-tight" style={{ color: wpTextSecondary }}>
                  {app.title}
                </span>
              </button>
            ))}
          </div>

          {/* Drawer trigger */}
          {showHomeIndicators && (
            <div className="flex justify-center mb-2">
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-1.5 text-[9px] font-semibold tracking-widest uppercase active:opacity-70 transition-opacity py-2"
                style={{ color: wpTextMuted }}
              >
                <FiChevronDown size={10} className="rotate-180" />
                All Apps
                <FiChevronDown size={10} className="rotate-180" />
              </button>
            </div>
          )}

          {/* Dock */}
          <div
            className="w-full py-2.5 px-4 rounded-2xl flex justify-around"
            style={{
              background: "var(--panel-bg)",
              border: "1px solid var(--panel-border)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {LAUNCHER_APPS.filter((a) => DOCK_IDS.includes(a.id)).map((app) => (
              <button
                key={app.id}
                onClick={() => launchApp(app.id)}
                className="flex flex-col items-center focus:outline-none active:scale-90 transition-transform duration-100 relative"
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 48, height: 48,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                  }}
                >
                  <span className="scale-105">{getAppIcon(app.icon, "md")}</span>
                </div>
                {windows[app.id]?.isOpen && (
                  <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: "var(--accent)" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── APP DRAWER (Launcher) ── */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              key="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute inset-x-0 bottom-0 top-0 z-30 flex flex-col overflow-hidden"
              style={{
                background: "var(--menu-bg)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
              }}
            >
              {/* Handle bar */}
              <div className="pt-2 pb-1 flex justify-center shrink-0 cursor-pointer" onClick={() => setDrawerOpen(false)}>
                <div className="w-9 h-1 rounded-full" style={{ background: "var(--text-muted-2)" }} />
              </div>

              {/* Search */}
              <div className="px-5 py-2 shrink-0">
                <div
                  className="h-10 rounded-xl flex items-center px-4 gap-2.5"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
                >
                  <FiSearch size={14} style={{ color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-[14px] focus:outline-none"
                    style={{ color: "var(--text-primary)", caretColor: "var(--accent)" }}
                    autoFocus
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} style={{ color: "var(--text-muted)" }}>
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Section title */}
              {!searchQuery && (
                <div className="px-6 py-1.5 shrink-0">
                  <span className="text-[11px] font-semibold tracking-wide" style={{ color: "var(--text-secondary)" }}>All Apps</span>
                </div>
              )}

              {/* Grid */}
              <div className="flex-1 overflow-y-auto px-5 pb-6">
                <div className="grid grid-cols-4 gap-x-3 gap-y-6 pt-2">
                  {filteredApps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => launchApp(app.id)}
                      className="flex flex-col items-center gap-1.5 focus:outline-none active:scale-90 transition-transform duration-100"
                    >
                      <div
                        className="w-13 h-13 rounded-2xl flex items-center justify-center"
                        style={{
                          width: 52,
                          height: 52,
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <span className="scale-105">{getAppIcon(app.icon, "md")}</span>
                      </div>
                      <span className="text-[10px] font-medium text-center truncate max-w-[64px] leading-tight" style={{ color: "var(--text-secondary)" }}>
                        {app.title}
                      </span>
                    </button>
                  ))}
                  {filteredApps.length === 0 && (
                    <div className="col-span-4 text-center py-16 text-sm" style={{ color: "var(--text-muted)" }}>No matching apps</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RECENTS ── */}
        <AnimatePresence>
          {recentsOpen && (
            <motion.div
              key="recents"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
            >
              <div className="pt-8 pb-3 px-6 shrink-0">
                <h3 className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Recents</h3>
                <p className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Swipe card up to close</p>
              </div>

              <div className="flex-1 w-full flex items-center overflow-x-auto gap-4 px-5 py-4">
                {openAppsList.map((app) => (
                  <motion.div
                    key={app.id}
                    drag="y"
                    dragConstraints={{ top: -250, bottom: 80 }}
                    dragElastic={0.35}
                    onDragEnd={(_, info) => { if (info.offset.y < -100) closeWindow(app.id); }}
                    className="relative shrink-0 flex flex-col overflow-hidden border rounded-xl cursor-grab active:cursor-grabbing"
                    style={{ width: 180, height: 280, background: "var(--window-bg)", borderColor: "var(--border)" }}
                  >
                    <div
                      className="px-3 py-2.5 flex justify-between items-center border-b shrink-0"
                      style={{ background: "var(--window-titlebar)", borderColor: "var(--border)" }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]">{getAppIcon(app.icon, "sm")}</span>
                        <span className="text-[11px] font-semibold truncate max-w-[90px]" style={{ color: "var(--text-primary)" }}>{app.title}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); closeWindow(app.id); }}
                        className="p-0.5 transition-colors"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <FiX size={11} />
                      </button>
                    </div>
                    <div
                      className="flex-1 flex flex-col items-center justify-center gap-2 p-4"
                      onClick={() => { focusWindow(app.id); setRecentsOpen(false); }}
                    >
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center border"
                        style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
                      >
                        <span className="scale-150">{getAppIcon(app.icon, "md")}</span>
                      </div>
                      <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>Tap to resume</p>
                    </div>
                  </motion.div>
                ))}
                {openAppsList.length === 0 && (
                  <div className="w-full text-center text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>No running apps</div>
                )}
              </div>

              {openAppsList.length > 0 && (
                <div className="flex justify-center shrink-0 pb-4">
                  <button
                    onClick={() => { openAppsList.forEach((a) => closeWindow(a.id)); setRecentsOpen(false); }}
                    className="px-4 py-1.5 rounded-lg text-[11px] font-semibold border transition-all active:scale-95"
                    style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── QUICK SETTINGS (Notification Shade) ── */}
        <AnimatePresence>
          {quickOpen && (
            <motion.div
              key="quick-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
            />
          )}
          {quickOpen && (
            <motion.div
              key="quick"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
              className="absolute inset-x-0 top-0 z-50 flex flex-col rounded-b-3xl"
              style={{
                background: "var(--menu-bg)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                maxHeight: "90%",
              }}
            >
              {/* Handle */}
              <div className="pt-2.5 pb-1 flex justify-center shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: "var(--text-muted-2)" }} />
              </div>

              {/* Date/Time header */}
              <div className="px-6 pt-1 pb-3 shrink-0">
                <p className="text-[22px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {time}
                </p>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  {date}
                </p>
              </div>

              {/* Scrollable content */}
              <div ref={quickScrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-0 pb-2">
              {/* Quick toggles — 2-column grid */}
              <div className="px-5 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  {/* Theme */}
                  <button
                    onClick={toggleTheme}
                    className="rounded-xl flex flex-col items-center justify-center gap-1 py-2.5 active:scale-95 transition-transform"
                    style={{ background: "var(--bg-surface)" }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: "var(--accent)", background: "var(--accent-light)" }}>
                      {themeMode === "dark" ? <FiMoon size={15} /> : <FiSun size={15} />}
                    </div>
                    <span className="text-[8px] font-semibold" style={{ color: "var(--text-muted)" }}>{themeMode === "dark" ? "Dark" : "Light"}</span>
                  </button>
                  {/* Audio */}
                  <button
                    onClick={toggleMute}
                    className="rounded-xl flex flex-col items-center justify-center gap-1 py-2.5 active:scale-95 transition-transform"
                    style={{ background: "var(--bg-surface)" }}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ color: "var(--accent)", background: "var(--accent-light)" }}>
                      {muted ? <FiVolumeX size={15} /> : <FiVolume2 size={15} />}
                    </div>
                    <span className="text-[8px] font-semibold" style={{ color: "var(--text-muted)" }}>{muted ? "Muted" : "Audio"}</span>
                  </button>
                </div>
              </div>

              {/* Brightness */}
              <div className="px-6 pb-3 flex items-center gap-3 shrink-0">
                <FiSun size={12} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                <input
                  type="range" min="20" max="100" value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="flex-1 cursor-pointer"
                  style={{ height: 3, accentColor: "var(--accent)" }}
                />
              </div>

              {/* Divider */}
              <div className="px-6 pb-1 shrink-0">
                <div className="h-[0.5px] w-full" style={{ background: "var(--border)" }} />
              </div>

              {/* Notification card */}
              <div className="px-5 pb-4 shrink-0">
                <div className="p-3.5 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                      <FiAlertCircle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>Youssef Jarray</span>
                        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>now</span>
                      </div>
                      <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Welcome to the mobile portfolio. Tap icons or swipe up for all apps.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Music card */}
              {true && (
                <div className="px-5 pb-6">
                  <div className="p-3.5 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                    <div className="flex items-center gap-3">
                      <FiMusic size={16} style={{ color: "var(--accent)" }} />
                      <span className="text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Now Playing</span>
                    </div>
                    <div className="mt-2">
                      <MusicWidget />
                    </div>
                  </div>
                </div>
              )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AudioPlayer />

      {/* ─── NAVIGATION BAR ─────────────────────────── */}
      <div
        className="w-full shrink-0 flex items-center justify-around px-8 z-40 border-t"
        style={{
          height: 48,
          background: "var(--panel-bg)",
          borderColor: "var(--panel-border)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
        }}
      >
        <button onClick={handleBack} className="w-11 h-11 flex items-center justify-center active:scale-90 transition-all focus:outline-none" style={{ color: "var(--panel-text-secondary)" }}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <button onClick={handleHome} className="w-11 h-11 flex items-center justify-center active:scale-90 transition-all focus:outline-none" style={{ color: "var(--panel-text-secondary)" }}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        </button>
        <button onClick={() => { if (!isLocked) { setQuickOpen(false); setDrawerOpen(false); setRecentsOpen(!recentsOpen); }}} className="w-11 h-11 flex items-center justify-center active:scale-90 transition-all focus:outline-none" style={{ color: "var(--panel-text-secondary)" }}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="4" rx="1.5"/>
            <rect x="3" y="10" width="18" height="4" rx="1.5"/>
            <rect x="3" y="16" width="18" height="4" rx="1.5"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
