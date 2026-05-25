"use client";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useWidgetStore } from "../store/widgetStore";
import { useThemeStore } from "../store/themeStore";
import { useSettingsStore } from "../store/settingsStore";
import ContextMenu from "./ContextMenu";
import MusicWidget from "./MusicWidget";

function AnalogClock() {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  const mode = useThemeStore((s) => s.mode);
  const isLight = mode === "light";

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime({ h: now.getHours() % 12, m: now.getMinutes(), s: now.getSeconds() });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const hDeg = time.h * 30 + time.m * 0.5;
  const mDeg = time.m * 6 + time.s * 0.1;
  const sDeg = time.s * 6;

  const faceBg = isLight ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.3)";
  const faceBorder = isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)";
  const dot = isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)";
  const dotSmall = isLight ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)";
  const handH = isLight ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)";
  const handM = isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)";

  return (
    <div className="flex flex-col items-center select-none">
      <div
        className="relative rounded-full"
        style={{ width: 130, height: 130, background: faceBg, border: `2px solid ${faceBorder}` }}
      >
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const isHour = i % 3 === 0;
          const r = 52;
          const x = 65 + r * Math.cos(angle);
          const y = 65 + r * Math.sin(angle);
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: x - (isHour ? 2 : 1), top: y - (isHour ? 2 : 1),
                width: isHour ? 4 : 2, height: isHour ? 4 : 2,
                background: isHour ? dot : dotSmall,
              }}
            />
          );
        })}
        <div className="absolute rounded-full origin-bottom"
          style={{ left: 63, top: 28, width: 4, height: 37, background: handH, transform: `rotate(${hDeg}deg)`, transformOrigin: "2px 37px", borderRadius: 2 }}
        />
        <div className="absolute rounded-full origin-bottom"
          style={{ left: 64, top: 20, width: 2, height: 45, background: handM, transform: `rotate(${mDeg}deg)`, transformOrigin: "1px 45px", borderRadius: 1 }}
        />
        <div className="absolute rounded-full origin-bottom"
          style={{ left: 64, top: 14, width: 2, height: 51, background: "var(--accent)", transform: `rotate(${sDeg}deg)`, transformOrigin: "1px 51px", borderRadius: 1 }}
        />
        <div className="absolute rounded-full"
          style={{ left: 62, top: 62, width: 6, height: 6, background: "var(--accent)", borderRadius: "50%" }}
        />
      </div>
    </div>
  );
}

function StickyNote() {
  return (
    <div className="select-none">
      <div
        className="absolute z-10"
        style={{
          left: "50%", top: -4,
          width: 20, height: 20, borderRadius: "50%",
          marginLeft: -10,
          background: "radial-gradient(circle at 35% 30%, #fbbf24, #f59e0b)",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
          zIndex: 20,
        }}
      />

      <div
        className="relative"
        style={{
          background: "#fef3c7",
          borderRadius: "2px 2px 2px 0",
          padding: "0 0 24px 0",
          filter: "drop-shadow(2px 4px 8px rgba(0,0,0,0.18))",
        }}
      >
        <div
          style={{
            padding: "20px 16px 14px",
            background: "linear-gradient(180deg, #fff9e0 0%, #fef3c7 8px, #fef3c7 100%)",
            borderRadius: "2px 2px 0 0",
          }}
        >
          <p style={{ textAlign: "center", fontFamily: "'Segoe UI', 'Comic Sans MS', cursive, sans-serif", color: "#1a1a24", fontSize: 11, lineHeight: 1.5 }}>
            TIP:<br/>
            <strong style={{ fontSize: 13 }}>Check out my Projects!</strong>
          </p>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0, right: 0,
            width: 0, height: 0,
            borderStyle: "solid",
            borderWidth: "0 0 24px 24px",
            borderColor: "transparent transparent #e5d5aa transparent",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 2, right: 2,
            width: 0, height: 0,
            borderStyle: "solid",
            borderWidth: "0 0 22px 22px",
            borderColor: "transparent transparent #d4c494 transparent",
            opacity: 0.4,
          }}
        />
      </div>
    </div>
  );
}

function CatWidget() {
  const [catSrc, setCatSrc] = useState(`https://cataas.com/cat?init=${Date.now()}`);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  const DURATION = 12000;

  const newCat = () => {
    setLoading(true);
    setProgress(0);
    setCatSrc(`https://cataas.com/cat?${Date.now()}`);
  };

  useEffect(() => {
    if (loading) return;
    const start = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / DURATION, 1);
      setProgress(pct);
      if (pct >= 1) {
        clearInterval(progressRef.current);
        newCat();
      }
    }, 50);
    return () => clearInterval(progressRef.current);
  }, [loading, catSrc]);

  return (
    <div className="select-none">
      <div className="relative rounded-xl overflow-hidden cursor-pointer" style={{ aspectRatio: "4/3", background: "var(--bg-surface)" }} onClick={newCat}>
        {loading && <div className="w-full h-full flex items-center justify-center text-[10px]" style={{ color: "var(--text-muted-2)" }}>Loading...</div>}
        <img
          src={catSrc} alt="Random cat"
          className={`w-full h-full object-cover transition-opacity ${loading ? "opacity-0 h-0" : "opacity-100"}`}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setCatSrc("https://cataas.com/cat?fallback=" + Date.now()); }}
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div
            className="h-full transition-none"
            style={{ width: `${progress * 100}%`, background: "rgba(255,255,255,0.25)", borderRadius: "0 2px 2px 0" }}
          />
        </div>
      </div>
    </div>
  );
}

function DraggableWidget({ id, children, defaultPos, wallpaperDark, onContextMenu, width = 200, noGlass = false, dragRotate = 0, themeMode }) {
  const { moveWidget } = useWidgetStore();
  const [dragging, setDragging] = useState(false);
  const [armed, setArmed] = useState(false);

  const isLight = themeMode === "light";
  const widgetBg = noGlass ? "transparent" : isLight
    ? "rgba(255,255,255,0.7)"
    : wallpaperDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.15)";
  const widgetBorder = noGlass ? "transparent" : isLight
    ? "rgba(0,0,0,0.1)"
    : wallpaperDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.2)";
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);
  const lastPos = useRef(defaultPos);
  const widgetRef = useRef(null);
  const hoverTween = useRef(null);

  useEffect(() => { lastPos.current = defaultPos; }, [defaultPos.x, defaultPos.y]);

  useEffect(() => {
    if (!armed) return;
    const onMove = (e) => {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      if (!dragRef.current.active && Math.abs(dx) + Math.abs(dy) > 8) {
        dragRef.current.active = true;
        setDragging(true);
      }
      if (dragRef.current.active) {
        setOffset({ x: dx, y: dy });
      }
    };
    const onUp = (e) => {
      if (dragRef.current.active) {
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        const newX = dragRef.current.startPosX + dx;
        const newY = Math.max(48, Math.min(dragRef.current.startPosY + dy, window.innerHeight - 80));
        moveWidget(id, newX, newY);
        lastPos.current = { x: newX, y: newY };
        setOffset({ x: 0, y: 0 });
        setDragging(false);
      }
      setArmed(false);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, [armed, id, moveWidget]);

  return (
    <div
      ref={widgetRef}
      data-gsap="widget"
      className={`absolute pointer-events-auto ${noGlass ? "" : "rounded-2xl p-4 border backdrop-blur-xl"}`}
      style={{
        left: dragging ? defaultPos.x + offset.x : defaultPos.x,
        top: dragging ? defaultPos.y + offset.y : defaultPos.y,
        width,
        zIndex: dragging ? 10000 : 3,
        transition: dragging ? "none" : "left 0.2s ease, top 0.2s ease",
        background: widgetBg,
        borderColor: widgetBorder,
        backdropFilter: noGlass ? "none" : "blur(12px)",
        WebkitBackdropFilter: noGlass ? "none" : "blur(12px)",
        cursor: dragging ? "grabbing" : "grab",
        transform: dragging && dragRotate ? `rotate(${dragRotate}deg)` : "rotate(0deg)",
      }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e); }}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
        e.preventDefault();
        hoverTween.current?.kill();
        gsap.to(widgetRef.current, { scale: 0.97, duration: 0.1, ease: "power2.out" });
        dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: defaultPos.x, startPosY: defaultPos.y, active: false };
        setOffset({ x: 0, y: 0 });
        setArmed(true);
      }}
    >
      {children}
    </div>
  );
}

const widgetComponents = {
  clock: AnalogClock,
  sticky: StickyNote,
  cat: CatWidget,
  music: MusicWidget,
};

const widgetLabels = {
  clock: "Clock",
  sticky: "Sticky Note",
  cat: "Cat Gallery",
  music: "Music Player",
};

export default function DesktopWidgets({ wallpaperDark }) {
  const { widgets, toggleWidget } = useWidgetStore();
  const mode = useThemeStore((s) => s.mode);
  const scale = useSettingsStore((s) => s.scale);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [ctxWidgetId, setCtxWidgetId] = useState(null);

  const handleWidgetContext = (e, wid) => {
    setCtxWidgetId(wid);
    setCtxMenu({ x: e.clientX / scale, y: e.clientY / scale });
  };

  const menuItems = Object.entries(widgetLabels).map(([wid, label]) => ({
    label: `${widgets[wid]?.enabled ? "Hide" : "Show"} ${label}`,
    icon: widgets[wid]?.enabled ? "✓" : "",
    onClick: () => toggleWidget(wid),
  }));

  return (
    <>
      {Object.entries(widgets).map(([id, cfg]) => {
        if (!cfg?.enabled) return null;
        const Comp = widgetComponents[id];
        if (!Comp) return null;
        return (
          <DraggableWidget
            key={id}
            id={id}
            defaultPos={cfg}
            wallpaperDark={wallpaperDark}
            onContextMenu={(e) => handleWidgetContext(e, id)}
            width={id === "music" ? 264 : 200}
            noGlass={id === "sticky" || id === "cat" || id === "clock"}
            dragRotate={id === "sticky" ? -2.8 : 0}
            themeMode={mode}
          >
            <Comp />
          </DraggableWidget>
        );
      })}

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          scale={scale}
          items={[
            ...menuItems,
            { divider: true },
            { label: "Reset widget positions", onClick: () => useWidgetStore.getState().resetPositions() },
          ]}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </>
  );
}
