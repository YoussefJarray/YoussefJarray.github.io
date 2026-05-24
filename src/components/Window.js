"use client";
import { useRef, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWindowStore } from "../store/windowStore";
import { FiX, FiMinus, FiSquare } from "react-icons/fi";
import { DoomIcon, PongIcon, TicTacToeIcon, SudokuIcon } from "./icons/GameIcons";

const appIcons = {
  folder: "\uD83D\uDCC1",
  terminal: "\u276F_",
  user: "\uD83D\uDC64",
  settings: "\u2699\uFE0F",
  browser: "\uD83C\uDF10",
  doom: <DoomIcon size={14} />,
  pong: <PongIcon size={14} />,
  tictactoe: <TicTacToeIcon size={14} />,
  sudoku: <SudokuIcon size={14} />,
  photos: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="white" stroke="black" strokeWidth="1.5" className="shrink-0">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="2" />
      <path d="M21 15l-5-5L5 19" />
    </svg>
  ),
};

const MIN_W = 360;
const MIN_H = 200;

const resizeCursorMap = {
  n: "n-resize", s: "s-resize", e: "e-resize", w: "w-resize",
  ne: "ne-resize", nw: "nw-resize", se: "se-resize", sw: "sw-resize",
};

export default function Window({ id, title, icon, children }) {
  const { windows, focusedWindowId, closeWindow, minimizeWindow, focusWindow, moveWindow, toggleMaximize, resizeWindow, startMenuOpen } = useWindowStore();
  const win = windows[id];
  const isFocused = focusedWindowId === id;

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });
  const wasMaximized = useRef(false);

  const handleMouseDown = useCallback((e) => {
    focusWindow(id);
    if (e.target.closest("button")) return;

    if (win.isMaximized) {
      const maxW = window.innerWidth;
      const maxH = window.innerHeight - 48;
      const ratioX = e.clientX / maxW;
      const ratioY = (e.clientY - 48) / maxH;
      const newW = Math.max(MIN_W, Math.min(win.size.width, maxW * 0.8));
      const newH = Math.max(MIN_H, Math.min(win.size.height, maxH * 0.8));
      const newX = Math.max(0, Math.min(e.clientX - newW * ratioX, window.innerWidth - newW));
      const newY = Math.max(0, Math.min(e.clientY - 48 - newH * ratioY, window.innerHeight - 48 - newH));
      toggleMaximize(id);
      moveWindow(id, newX, newY);
      dragOffset.current = { x: e.clientX - newX, y: e.clientY - 48 - newY };
      wasMaximized.current = true;
      setDragging(true);
      return;
    }

    setDragging(true);
    wasMaximized.current = false;
    dragOffset.current = { x: e.clientX - win.position.x, y: e.clientY - 48 - win.position.y };
  }, [id, focusWindow, win, toggleMaximize, moveWindow]);

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
      moveWindow(id, e.clientX - dragOffset.current.x, e.clientY - 48 - dragOffset.current.y);
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
  }, [dragging, id, moveWindow]);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e) => {
      const dx = e.clientX - resizeStart.current.x;
      const dy = e.clientY - resizeStart.current.y;
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
  }, [resizing, id, resizeWindow, moveWindow]);

  if (!win || !win.isOpen || win.isMinimized) return null;

  const maxed = win.isMaximized;
  const pos = maxed ? { x: 0, y: 0 } : win.position;

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
        top: maxed ? 48 : pos.y + 48,
        width: maxed ? "100vw" : win.size.width,
        height: maxed ? "calc(100vh - 48px)" : win.size.height,
        zIndex: startMenuOpen ? 1 : win.zIndex,
        cursor: dragging ? "grabbing" : (resizing ? resizeCursorMap[resizing] : "default"),
      }}
      onMouseDown={() => focusWindow(id)}
    >
      <div
        className={`flex flex-col overflow-hidden shadow-2xl transition-shadow duration-200 ${
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
          className="flex items-center justify-between px-3 py-[7px] select-none shrink-0"
          style={{
            background: isFocused ? "var(--window-titlebar)" : "var(--window-titlebar-inactive)",
            borderBottom: "1px solid var(--border)",
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2.5 text-sm min-w-0" style={{ color: "var(--text-muted)" }}>
            <span className="text-xs shrink-0">{appIcons[icon] || "\uD83D\uDCC4"}</span>
            <span className="text-xs font-medium truncate" style={{ color: "var(--text-secondary)" }}>{title}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0" onMouseDown={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
              className="w-[13px] h-[13px] rounded-full flex items-center justify-center hover:brightness-125 transition-all"
              style={{ background: "#fbbf24" }}
              title="Minimize"
            >
              <FiMinus className="text-[7px] text-black/50" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleMaximize(id); }}
              className="w-[13px] h-[13px] rounded-full flex items-center justify-center hover:brightness-125 transition-all"
              style={{ background: "#34d399" }}
              title="Maximize"
            >
              <FiSquare className="text-[5px] text-black/50" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
              className="w-[13px] h-[13px] rounded-full flex items-center justify-center hover:brightness-125 transition-all"
              style={{ background: "#ef4444" }}
              title="Close"
            >
              <FiX className="text-[7px] text-black/50" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto min-h-0">
          {children}
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
