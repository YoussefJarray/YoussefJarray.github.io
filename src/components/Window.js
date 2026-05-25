"use client";
import { useRef, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useWindowStore } from "../store/windowStore";
import { FiX, FiMinus, FiSquare } from "react-icons/fi";
import { getSmallIcon } from "../data/iconRegistry";
import { WindowContext } from "../utils/windowContext";

const MIN_W = 360;
const MIN_H = 200;

const resizeCursorMap = {
  n: "n-resize", s: "s-resize", e: "e-resize", w: "w-resize",
  ne: "ne-resize", nw: "nw-resize", se: "se-resize", sw: "sw-resize",
};

export default function Window({ id, title, icon, scale = 1, children }) {
  const { windows, focusedWindowId, closeWindow, minimizeWindow, focusWindow, moveWindow, toggleMaximize, resizeWindow, startMenuOpen } = useWindowStore();
  const win = windows[id];
  const isFocused = focusedWindowId === id;

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });
  const wasMaximized = useRef(false);
  const windowRef = useRef(null);
  const titleBarRef = useRef(null);

  useEffect(() => {
    if (!windowRef.current) return;
    gsap.fromTo(windowRef.current,
      { opacity: 0, scale: 0.88, y: -20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" }
    );
  }, []);

  const handleMouseDown = useCallback((e) => {
    focusWindow(id);
    if (e.target.closest("button")) return;

    if (win.isMaximized) {
      const maxW = window.innerWidth;
      const maxH = window.innerHeight - 44;
      const ratioX = e.clientX / maxW;
      const ratioY = (e.clientY - 44) / maxH;
      const newW = Math.max(MIN_W, Math.min(win.size.width, maxW * 0.8 / scale));
      const newH = Math.max(MIN_H, Math.min(win.size.height, maxH * 0.8 / scale));
      const newX = Math.max(0, Math.min((e.clientX - newW * ratioX * scale) / scale, (window.innerWidth - newW * scale) / scale));
      const newY = Math.max(0, Math.min((e.clientY - 44 - newH * ratioY * scale) / scale, (window.innerHeight - 44 - newH * scale) / scale));
      toggleMaximize(id);
      moveWindow(id, newX, newY);
      dragOffset.current = { x: e.clientX - newX * scale, y: e.clientY - 44 - newY * scale };
      wasMaximized.current = true;
      setDragging(true);
      return;
    }

    setDragging(true);
    wasMaximized.current = false;
    dragOffset.current = { x: e.clientX - win.position.x * scale, y: e.clientY - 44 - win.position.y * scale };
  }, [id, focusWindow, win, toggleMaximize, moveWindow, scale]);

  const handleResizeStart = useCallback((dir, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (win.isMaximized) return;
    focusWindow(id);
    setResizing(dir);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: win.size.width, h: win.size.height, px: win.position.x, py: win.position.y };
  }, [id, focusWindow, win]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const x = (e.clientX - dragOffset.current.x) / scale;
      const y = (e.clientY - 44 - dragOffset.current.y) / scale;
      moveWindow(id, x, y);
    };
    const onUp = () => {
      setDragging(false);
      wasMaximized.current = false;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [dragging, id, moveWindow, scale]);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e) => {
      const dx = (e.clientX - resizeStart.current.x) / scale;
      const dy = (e.clientY - resizeStart.current.y) / scale;
      let newW = resizeStart.current.w;
      let newH = resizeStart.current.h;
      let newX = resizeStart.current.px;
      let newY = resizeStart.current.py;

      if (resizing.includes("e")) newW = Math.max(MIN_W, resizeStart.current.w + dx);
      if (resizing.includes("w")) {
        newW = Math.max(MIN_W, resizeStart.current.w - dx);
        newX = resizeStart.current.px + (resizeStart.current.w - newW);
      }
      if (resizing.includes("s")) newH = Math.max(MIN_H, resizeStart.current.h + dy);
      if (resizing.includes("n")) {
        newH = Math.max(MIN_H, resizeStart.current.h - dy);
        newY = resizeStart.current.py + (resizeStart.current.h - newH);
      }

      resizeWindow(id, newW, newH);
      if (newX !== resizeStart.current.px || newY !== resizeStart.current.py) {
        moveWindow(id, newX, newY);
      }
    };
    const onUp = () => setResizing(null);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [resizing, id, resizeWindow, moveWindow, scale]);

  if (!win || !win.isOpen) return null;

  const maxed = win.isMaximized;
  const pos = maxed ? { x: 0, y: 0 } : { x: win.position.x * scale, y: win.position.y * scale };
  const minimized = win.isMinimized;

  return (
    <motion.div
      data-no-desktop-ctx
      initial={{ opacity: 0, scale: 0.93, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.93, y: -10 }}
      transition={{ type: "spring", damping: 25, stiffness: 350, mass: 0.8 }}
      className="fixed"
      style={{
        left: pos.x,
        top: maxed ? 44 : pos.y + 44,
        width: maxed ? "100vw" : win.size.width * scale,
        height: maxed ? "calc(100vh - 44px)" : win.size.height * scale,
        zIndex: minimized ? -1 : (startMenuOpen ? 1 : win.zIndex),
        cursor: dragging ? "grabbing" : (resizing ? resizeCursorMap[resizing] : "default"),
        opacity: minimized ? 0 : 1,
        pointerEvents: minimized ? "none" : "auto",
        transform: minimized ? "scale(0.95)" : "none",
        transition: "opacity 0.15s ease, transform 0.15s ease",
      }}
      onMouseDown={() => focusWindow(id)}
    >
      <div
        ref={windowRef}
        className={`flex flex-col overflow-hidden shadow-2xl ${
          maxed ? "rounded-none" : "rounded-xl"
        } ${isFocused ? "shadow-black/60" : "shadow-black/30"}`}
        style={{
          height: "100%",
          background: "var(--window-bg)",
          border: isFocused ? "1px solid var(--border-strong)" : "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "relative",
        }}
      >
        <div
          ref={titleBarRef}
          className="flex items-center justify-between px-3 py-[7px] select-none shrink-0"
          style={{
            background: isFocused ? "var(--window-titlebar)" : "var(--window-titlebar-inactive)",
            borderBottom: "1px solid var(--border)",
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={() => { if (!win.noMaximize) toggleMaximize(id); }}
          onMouseEnter={() => {
            gsap.to(titleBarRef.current, { background: "var(--window-titlebar)", duration: 0.2 });
          }}
          onMouseLeave={() => {
            if (!isFocused) gsap.to(titleBarRef.current, { background: "var(--window-titlebar-inactive)", duration: 0.2 });
          }}
        >
          <div className="flex items-center gap-2.5 text-sm min-w-0" style={{ color: "var(--text-muted)" }}>
            <span className="text-xs shrink-0">{getSmallIcon(icon)}</span>
            <span className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>{title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
              onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.2, duration: 0.15, ease: "back.out(2)" })}
              onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.12 })}
              className="w-[13px] h-[13px] rounded-full flex items-center justify-center"
              style={{ background: "#fbbf24" }}
              title="Minimize"
            >
              <FiMinus className="text-[7px] text-black/50" />
            </button>
            {!win.noMaximize && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.2, duration: 0.15, ease: "back.out(2)" })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.12 })}
                className="w-[13px] h-[13px] rounded-full flex items-center justify-center"
                style={{ background: "#34d399" }}
                title="Maximize"
              >
                <FiSquare className="text-[5px] text-black/50" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
              onMouseEnter={(e) => { gsap.to(e.currentTarget, { scale: 1.2, duration: 0.15, ease: "back.out(2)" }); gsap.to(e.currentTarget, { boxShadow: "0 0 12px rgba(239,68,68,0.5)", duration: 0.15 }); }}
              onMouseLeave={(e) => { gsap.to(e.currentTarget, { scale: 1, duration: 0.12 }); gsap.to(e.currentTarget, { boxShadow: "none", duration: 0.12 }); }}
              className="w-[13px] h-[13px] rounded-full flex items-center justify-center"
              style={{ background: "#ef4444" }}
              title="Close"
            >
              <FiX className="text-[7px] text-black/50" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          <WindowContext.Provider value={{ id, isMaximized: win.isMaximized, size: win.size }}>
            {children}
          </WindowContext.Provider>
        </div>

        {!maxed && (
          <>
            <div className="absolute top-0 left-0 w-3 h-3 z-10 cursor-nw-resize" onMouseDown={(e) => handleResizeStart("nw", e)} />
            <div className="absolute top-0 right-0 w-3 h-3 z-10 cursor-ne-resize" onMouseDown={(e) => handleResizeStart("ne", e)} />
            <div className="absolute bottom-0 left-0 w-3 h-3 z-10 cursor-sw-resize" onMouseDown={(e) => handleResizeStart("sw", e)} />
            <div className="absolute bottom-0 right-0 w-3 h-3 z-10 cursor-se-resize" onMouseDown={(e) => handleResizeStart("se", e)} />
            <div className="absolute top-0 left-3 right-3 h-1 z-10 cursor-n-resize" onMouseDown={(e) => handleResizeStart("n", e)} />
            <div className="absolute bottom-0 left-3 right-3 h-1 z-10 cursor-s-resize" onMouseDown={(e) => handleResizeStart("s", e)} />
            <div className="absolute top-3 bottom-3 left-0 w-1 z-10 cursor-w-resize" onMouseDown={(e) => handleResizeStart("w", e)} />
            <div className="absolute top-3 bottom-3 right-0 w-1 z-10 cursor-e-resize" onMouseDown={(e) => handleResizeStart("e", e)} />
          </>
        )}
      </div>
    </motion.div>
  );
}
