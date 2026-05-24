"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useWindowStore } from "../store/windowStore";
import { useIconStore } from "../store/iconStore";
import ContextMenu from "./ContextMenu";

function PhotosIcon({ wallpaperDark }) {
  const stroke = wallpaperDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const fill = wallpaperDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 19" />
    </svg>
  );
}

const desktopItems = [
  { id: "files", icon: "\uD83D\uDCC1", label: "Projects" },
  { id: "terminal", icon: ">_", label: "Terminal" },
  { id: "about", icon: "\uD83D\uDC64", label: "About Me" },
  { id: "browser", icon: "\uD83C\uDF10", label: "Web Browser" },
  { id: "photos", icon: "custom-photos", label: "Photos" },
  { id: "settings", icon: "\u2699\uFE0F", label: "Settings" },
];

function DesktopIcon({ id, icon, label, onActivate, wallpaperDark, defaultPos, selected, onSelect }) {
  const { moveIcon } = useIconStore();
  const posRef = useRef(defaultPos);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef(null);
  const clickTimer = useRef(null);
  const clickCount = useRef(0);
  const [ctxMenu, setCtxMenu] = useState(null);
  const [hovered, setHovered] = useState(false);

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
      setOffset({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY });
    };
    const onUp = (e) => {
      setDragging(false);
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist < 8) {
        clickCount.current += 1;
        if (clickCount.current === 2) { onActivate(); clickCount.current = 0; clearTimeout(clickTimer.current); }
        else { onSelect(); clearTimeout(clickTimer.current); clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 350); }
      } else {
        const finalY = Math.max(48, Math.min(dragRef.current.startPosY + dy, window.innerHeight - 80));
        moveIcon(id, dragRef.current.startPosX + dx, finalY);
        posRef.current = { x: dragRef.current.startPosX + dx, y: finalY };
        setOffset({ x: 0, y: 0 });
      }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, [dragging, id, moveIcon, onActivate, onSelect]);

  const currentX = dragging ? defaultPos.x + offset.x : defaultPos.x;
  const currentY = dragging ? defaultPos.y + offset.y : defaultPos.y;

  const iconFilter = wallpaperDark
    ? "drop-shadow(0 2px 6px rgba(0,0,0,0.5)) drop-shadow(0 4px 12px rgba(0,0,0,0.3))"
    : "drop-shadow(0 2px 6px rgba(255,255,255,0.3)) drop-shadow(0 4px 12px rgba(255,255,255,0.15))";

  const bgHover = wallpaperDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const bgSelected = wallpaperDark ? "rgba(249,115,22,0.2)" : "rgba(234,88,12,0.15)";
  const borderSelected = wallpaperDark ? "rgba(249,115,22,0.4)" : "rgba(234,88,12,0.35)";

  return (
    <div
      data-no-desktop-ctx
      className="flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl w-[78px] cursor-grab active:cursor-grabbing"
      style={{
        position: "absolute",
        left: currentX, top: currentY,
        transition: dragging ? "none" : "left 0.2s ease, top 0.2s ease",
        zIndex: dragging ? 10000 : 2,
        background: selected ? bgSelected : hovered ? bgHover : "transparent",
        backdropFilter: selected ? "blur(4px)" : "none",
        outline: selected ? `1.5px solid ${borderSelected}` : "none",
      }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: defaultPos.x, startPosY: defaultPos.y };
        setOffset({ x: 0, y: 0 });
        setDragging(true);
      }}
    >
      {icon === "custom-photos" ? (
        <span className="flex items-center justify-center select-none pointer-events-none" style={{ width: 36, height: 36, filter: iconFilter }}>
          <PhotosIcon wallpaperDark={wallpaperDark} />
        </span>
      ) : (
        <span
          className="text-3xl select-none pointer-events-none"
          style={{
            filter: iconFilter,
            color: icon === ">_" ? (wallpaperDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)") : undefined,
          }}
        >
          {icon}
        </span>
      )}
      <span
        className="text-[11px] text-center leading-tight px-1 py-0.5 rounded-md select-none pointer-events-none"
        style={{
          color: wallpaperDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)",
          background: wallpaperDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.25)",
          textShadow: wallpaperDark ? "0 1px 3px rgba(0,0,0,0.5)" : "0 1px 3px rgba(255,255,255,0.3)",
        }}
      >
        {label}
      </span>

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={[
            { label: "Open", icon: "▸", onClick: onActivate },
          ]}
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
      key={id}
      id={id}
      icon={icon}
      label={label}
      onActivate={() => handleActivate(id)}
      onSelect={() => setSelectedId(id)}
      selected={selectedId === id}
      wallpaperDark={wallpaperDark}
      defaultPos={positions[id] || { x: 24, y: 72 }}
    />
  ));
}
