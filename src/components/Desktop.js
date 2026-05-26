"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { useWindowStore } from "../store/windowStore";
import { useThemeStore } from "../store/themeStore";
import { useIconStore } from "../store/iconStore";
import { useWallpaperStore, wallpapers } from "../store/wallpaperStore";
import TopPanel from "./TopPanel";
import DesktopIcons from "./DesktopIcons";
import BootScreen from "./BootScreen";
import Window from "./Window";
import ContextMenu from "./ContextMenu";
import FileManager from "./FileManager";
import Terminal from "./Terminal";
import AboutApp from "./AboutApp";
import SettingsApp from "./SettingsApp";
import BrowserApp from "./BrowserApp";
import PhotosApp from "./PhotosApp";
import MarkdownViewer from "./MarkdownViewer";
import DesktopWidgets from "./DesktopWidgets";
import TicTacToe from "./TicTacToe";
import Sudoku from "./Sudoku";
import Pong from "./Pong";
import Doom from "./Doom";
import PdfViewer from "./PdfViewer";
import CalculatorApp from "./CalculatorApp";
import MinesweeperApp from "./MinesweeperApp";
import GitHubStatsApp from "./GitHubStatsApp";
import MemoryApp from "./MemoryApp";
import PaintApp from "./PaintApp";
import SnakeApp from "./SnakeApp";
import BreakoutApp from "./BreakoutApp";
import MonkeyTypeApp from "./MonkeyTypeApp";
import AudioPlayer from "./AudioPlayer";
import DVDScrnSaver from "./DVDScrnSaver";

const appComponents = {
  FileManager, Terminal, AboutApp, SettingsApp, BrowserApp, PhotosApp, MarkdownViewer, TicTacToe, Sudoku, Pong, Doom, PdfViewer,
  CalculatorApp, MinesweeperApp, GitHubStatsApp, MemoryApp, PaintApp, Snake: SnakeApp, Breakout: BreakoutApp, MonkeyTypeApp,
};

function hexToRgb(hex) {
  const v = parseInt(hex.replace("#", ""), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0")).join("")}`;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = l * 255; return { r: v, g: v, b: v }; }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return {
    r: hue2rgb(p, q, h + 1/3) * 255,
    g: hue2rgb(p, q, h) * 255,
    b: hue2rgb(p, q, h - 1/3) * 255,
  };
}

function forceAccentLightness(hex, targetLightness) {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);
  const { r: nr, g: ng, b: nb } = hslToRgb(hsl.h, hsl.s, targetLightness);
  return rgbToHex(nr, ng, nb);
}

function extractAccent(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0, 1, 1);
        const d = ctx.getImageData(0, 0, 1, 1).data;
        resolve(rgbToHex(d[0], d[1], d[2]));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

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
        const avg = total / (data.length / 4);
        setIsDark(avg < 140);
      } catch {}
    };
    img.onerror = () => setIsDark(true);
    img.src = wpUrl;
  }, [wpUrl]);

  return isDark;
}

function Wallpaper({ url }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <img key={url} src={url} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.3) 100%)" }} />
    </div>
  );
}

export default function Desktop() {
  const { windows } = useWindowStore();
  const init = useThemeStore((s) => s.init);
  const mode = useThemeStore((s) => s.mode);
  const { selected, setAccent } = useWallpaperStore();
  const selectedWp = useMemo(() => wallpapers.find((w) => w.id === selected.wallpaper) || wallpapers[0], [selected.wallpaper]);
  const isWallpaperDark = useWallpaperBrightness(selectedWp.url);
  const [booted, setBooted] = useState(false);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [afk, setAfk] = useState(false);
  const afkTimerRef = useRef(null);

  useEffect(() => {
    const reset = () => {
      setAfk(false);
      clearTimeout(afkTimerRef.current);
      afkTimerRef.current = setTimeout(() => setAfk(true), 30000);
    };
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      clearTimeout(afkTimerRef.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    const base = async () => {
      const raw = selected.accent === "match" ? await extractAccent(selectedWp.url) : selected.accent;
      if (!raw) return;
      const accent = mode === "dark"
        ? forceAccentLightness(raw, 68)
        : forceAccentLightness(raw, 28);
      document.documentElement.style.setProperty("--accent", accent);
      document.documentElement.style.setProperty("--accent-light", `${accent}25`);
    };
    base();
  }, [selected.accent, selectedWp.url, mode]);

  const rootRef = useRef(null);
  const bootTimeline = useRef(null);

  const handleBootFinish = useCallback(() => setBooted(true), []);

  useEffect(() => {
    if (!booted) return;
    const el = rootRef.current;
    if (!el) return;
    const topPanel = el.querySelector("[data-gsap='top-panel']");
    const icons = el.querySelectorAll("[data-gsap='desktop-icon']");
    const widgets = el.querySelectorAll("[data-gsap='widget']");

    gsap.set([topPanel, icons, widgets], { opacity: 0, y: -10 });
    bootTimeline.current = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.4 } })
      .to(topPanel, { opacity: 1, y: 0, duration: 0.3 }, 0)
      .to(icons, { opacity: 1, y: 0, stagger: 0.04 }, 0.1)
      .to(widgets, { opacity: 1, y: 0, stagger: 0.06 }, 0.2);

    return () => { bootTimeline.current?.kill(); };
  }, [booted]);

  if (!booted) return <BootScreen onFinish={handleBootFinish} />;

  return (
    <div
      ref={rootRef}
      className="relative w-screen h-screen overflow-hidden select-none desktop-root"
      data-wallpaper={isWallpaperDark ? "dark" : "light"}
      onContextMenu={(e) => {
        if (e.target.closest("[data-no-desktop-ctx]")) return;
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY });
      }}
      onClick={() => setCtxMenu(null)}
    >
      <Wallpaper url={selectedWp.url} />

      <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-[1]"
        style={{ paddingBottom: "8vh" }}>
        <p className="text-sm md:text-base font-medium tracking-wide" style={{
          color: isWallpaperDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.5)",
          marginBottom: 4,
        }}>
          hello my name is
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight" style={{
          color: isWallpaperDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.65)",
          textShadow: isWallpaperDark ? "0 0 60px rgba(255,255,255,0.08)" : "0 0 40px rgba(0,0,0,0.06)",
          lineHeight: 1.1,
        }}>
          Youssef Jarray
        </h1>
      </div>

      <TopPanel />

      <div>
        <DesktopIcons wallpaperDark={isWallpaperDark} />
        <DesktopWidgets wallpaperDark={isWallpaperDark} />
      </div>

      <AnimatePresence>
        {Object.entries(windows).map(([id, win]) => {
          if (!win.isOpen) return null;
          const AppComponent = appComponents[win.app];
          if (!AppComponent) return null;
          return (
            <Window key={id} id={id} title={win.title} icon={win.icon}>
              <AppComponent id={id} />
            </Window>
          );
        })}
      </AnimatePresence>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={[
            { label: "Reset icon positions", icon: "↺", onClick: () => useIconStore.getState().resetPositions() },
            { label: "Reload page", icon: "⟳", onClick: () => window.location.reload() },
          ]}
          onClose={() => setCtxMenu(null)}
        />
      )}

      <AudioPlayer />
      {afk && <DVDScrnSaver onDismiss={() => setAfk(false)} />}
    </div>
  );
}
