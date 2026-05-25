"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { useWindowStore } from "../store/windowStore";
import { useIconStore } from "../store/iconStore";
import { useSettingsStore } from "../store/settingsStore";
import { desktopItems } from "../data/appRegistry";
import { getDesktopIcon } from "../data/iconRegistry";
import ContextMenu from "./ContextMenu";

function DesktopIcon({ id, icon, label, onActivate, wallpaperDark, defaultPos, selected, onSelect }) {
  const { moveIcon } = useIconStore();
  const scale = useSettingsStore((s) => s.scale);
  const posRef = useRef(defaultPos);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const clickTimer = useRef(null);
  const clickCount = useRef(0);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const iconRef = useRef(null);
  const labelRef = useRef(null);
  const hoverTween = useRef(null);

  useEffect(() => {
    posRef.current = defaultPos;
    setOffset({ x: 0, y: 0 });
  }, [defaultPos.x, defaultPos.y]);

  useEffect(() => {
    return () => clearTimeout(clickTimer.current);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      setOffset({ x: (e.clientX - dragRef.current.startX) / scale, y: (e.clientY - dragRef.current.startY) / scale });
    };
    const onUp = (e) => {
      setDragging(false);
      const dx = (e.clientX - dragRef.current.startX) / scale;
      const dy = (e.clientY - dragRef.current.startY) / scale;
      const dist = Math.abs(e.clientX - dragRef.current.startX) + Math.abs(e.clientY - dragRef.current.startY);
      if (dist < 8) {
        clickCount.current += 1;
        if (clickCount.current === 2) { onActivate(); clickCount.current = 0; clearTimeout(clickTimer.current); }
        else { onSelect(); clearTimeout(clickTimer.current); clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 350); }
      } else {
        const finalY = Math.max(48 / scale, Math.min(dragRef.current.startPosY + dy, (window.innerHeight - 80) / scale));
        moveIcon(id, dragRef.current.startPosX + dx, finalY);
        posRef.current = { x: dragRef.current.startPosX + dx, y: finalY };
        setOffset({ x: 0, y: 0 });
      }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, [dragging, id, moveIcon, onActivate, onSelect, scale]);

  const currentX = dragging ? defaultPos.x + offset.x : defaultPos.x;
  const currentY = dragging ? defaultPos.y + offset.y : defaultPos.y;

  const iconFilter = wallpaperDark
    ? "drop-shadow(0 2px 6px rgba(0,0,0,0.5)) drop-shadow(0 4px 12px rgba(0,0,0,0.3))"
    : "drop-shadow(0 2px 6px rgba(255,255,255,0.3)) drop-shadow(0 4px 12px rgba(255,255,255,0.15))";

  const bgHover = wallpaperDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const bgSelected = wallpaperDark ? "rgba(249,115,22,0.2)" : "rgba(234,88,12,0.15)";
  const borderSelected = wallpaperDark ? "rgba(249,115,22,0.4)" : "rgba(234,88,12,0.35)";

  const handleMouseEnter = () => {
    setHovered(true);
    hoverTween.current = gsap.to(iconRef.current, {
      y: -4, scale: 1.08, duration: 0.25, ease: "back.out(1.7)",
    });
    gsap.to(labelRef.current, { opacity: 1, duration: 0.2 });
  };

  const handleMouseLeave = () => {
    setHovered(false);
    hoverTween.current?.kill();
    gsap.to(iconRef.current, { y: 0, scale: 1, duration: 0.2, ease: "power2.out" });
    gsap.to(labelRef.current, { opacity: 0.85, duration: 0.15 });
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    hoverTween.current?.kill();
    gsap.to(iconRef.current, { scale: 0.9, y: 0, duration: 0.1, ease: "power2.out" });
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: defaultPos.x, startPosY: defaultPos.y };
    setOffset({ x: 0, y: 0 });
    setDragging(true);
  };

  return (
    <div
      data-gsap="desktop-icon"
      data-no-desktop-ctx
      className="flex flex-col items-center gap-0.5 px-2 py-2.5 rounded-xl w-[96px] cursor-grab active:cursor-grabbing"
      style={{
        position: "absolute",
        left: currentX, top: currentY,
        transition: dragging ? "none" : "left 0.2s ease, top 0.2s ease",
        zIndex: dragging ? 10000 : 2,
        background: selected ? bgSelected : hovered ? bgHover : "transparent",
        backdropFilter: selected ? "blur(4px)" : "none",
        outline: selected ? `1.5px solid ${borderSelected}` : "none",
      }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX / scale, y: e.clientY / scale }); }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { handleMouseLeave(); setShowFull(false); }}
      onMouseDown={handleMouseDown}
      onClick={() => setShowFull(s => !s)}
    >
      <span ref={iconRef} className="flex items-center justify-center select-none pointer-events-none will-change-transform" style={{ width: 36, height: 36, filter: iconFilter }}>
        {getDesktopIcon(id, wallpaperDark)}
      </span>
      <span ref={labelRef} className="text-[11px] text-center leading-tight px-1 py-0.5 rounded-md select-none pointer-events-none" style={{
        color: wallpaperDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)",
        background: wallpaperDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)",
        textShadow: wallpaperDark ? "0 1px 3px rgba(0,0,0,0.5)" : "0 1px 3px rgba(255,255,255,0.3)",
        maxWidth: showFull ? 200 : 76,
        whiteSpace: showFull ? "normal" : "nowrap",
        overflow: "hidden",
        textOverflow: showFull ? "clip" : "ellipsis",
      }}>
        {label}
      </span>
      {ctxMenu && (
        <ContextMenu x={ctxMenu.x} y={ctxMenu.y} scale={scale}
          items={[{ label: "Open", icon: "▸", onClick: onActivate }]}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  );
}

export default function DesktopIcons({ wallpaperDark }) {
  const { windows, openWindow, focusWindow } = useWindowStore();
  const { positions } = useIconStore();
  const [selectedId, setSelectedId] = useState(null);

  const handleActivate = useCallback((id) => {
    const win = windows[id];
    if (win?.isOpen) {
      if (win?.isMinimized) openWindow(id);
      else focusWindow(id);
    } else {
      openWindow(id);
    }
    setSelectedId(null);
  }, [windows, openWindow, focusWindow]);

  useEffect(() => {
    const clear = () => setSelectedId(null);
    document.addEventListener("mousedown", clear);
    return () => document.removeEventListener("mousedown", clear);
  }, []);

  return desktopItems.map(({ id, icon, label }) => (
    <DesktopIcon
      key={id} id={id} icon={icon} label={label}
      onActivate={() => handleActivate(id)}
      onSelect={() => setSelectedId(id)}
      selected={selectedId === id}
      wallpaperDark={wallpaperDark}
      defaultPos={positions[id] || { x: 20, y: 68 }}
    />
  ));
}
