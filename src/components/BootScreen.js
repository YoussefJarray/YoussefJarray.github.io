"use client";
import { useState, useEffect } from "react";

const bootLines = [
  "BIOS: Starting UEFI firmware...",
  "EFI: Loading bootloader...",
  "BOOT: Verifying kernel image...",
  "KERNEL: Decompressing YuOS...",
  "KERNEL: Mounting root filesystem...",
  "SYSTEMD: Starting user manager...",
  "DISPLAY: Initializing GPU (POTATO GPU)...",
  "DISPLAY: Starting compositor...",
  "SESSION: Loading YUKI Desktop Environment...",
  "SESSION: Ready.",
];

export default function BootScreen({ onFinish }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [progress, setProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") { setFadingOut(true); setTimeout(() => onFinish(), 500); } };
    document.addEventListener("keydown", handleKey);
    let lineIdx = 0;
    const lineInterval = setInterval(() => {
      if (lineIdx < bootLines.length) {
        setVisibleLines((prev) => [...prev, bootLines[lineIdx]]);
        setProgress(((lineIdx + 1) / bootLines.length) * 100);
        lineIdx++;
      } else {
        clearInterval(lineInterval);
        setTimeout(() => setFadingOut(true), 400);
        setTimeout(() => onFinish(), 900);
      }
    }, 180);
    return () => { clearInterval(lineInterval); document.removeEventListener("keydown", handleKey); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: "#0a0a10",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-2xl font-bold text-white shadow-2xl">
          YJ
        </div>
        <h1 className="text-lg font-semibold text-white/80 tracking-wide">YUKI OS</h1>
        <p className="text-[10px] text-white/20 mt-1">YuOS v0.15</p>
      </div>

      <div className="w-72 mb-4">
        <div className="h-1 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%`, background: "linear-gradient(90deg, #f97316, #ef4444)" }}
          />
        </div>
      </div>

      <div className="w-80 h-36 overflow-hidden">
        {visibleLines.map((line, i) => (
          <div
            key={i}
            className="text-[11px] leading-5 animate-pulse"
            style={{
              color: i === visibleLines.length - 1 ? "#f97316" : "rgba(255,255,255,0.35)",
              animation: i === visibleLines.length - 1 ? "none" : "none",
            }}
          >
            <span className="text-white/20 mr-2">[{(i + 1).toString().padStart(4, "0")}]</span>
            {line}
          </div>
        ))}
      </div>

      <p className="absolute bottom-6 text-[9px] text-white/10">Press ESC to skip</p>
    </div>
  );
}
