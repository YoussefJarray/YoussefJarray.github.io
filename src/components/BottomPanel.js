"use client";
import { useWindowStore } from "../store/windowStore";
import { FiFolder, FiTerminal, FiUser, FiSettings, FiGlobe, FiMonitor } from "react-icons/fi";

const dockApps = [
  { id: "files", icon: FiFolder, label: "Files" },
  { id: "terminal", icon: FiTerminal, label: "Terminal" },
  { id: "about", icon: FiUser, label: "About" },
  { id: "browser", icon: FiGlobe, label: "Browser" },
  { id: "settings", icon: FiSettings, label: "Settings" },
  { id: "doom", icon: FiMonitor, label: "Doom" },
];

export default function BottomPanel() {
  const { windows, openWindow, focusWindow, toggleMaximize } = useWindowStore();

  const handleClick = (id) => {
    const win = windows[id];
    if (!win) return;
    if (win.isOpen && !win.isMinimized) {
      focusWindow(id);
    } else {
      openWindow(id);
    }
  };

  const handleDoubleClick = (id) => {
    const win = windows[id];
    if (!win || !win.isOpen || win.isMinimized) return;
    toggleMaximize(id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[50] flex items-center justify-center pointer-events-none select-none" style={{ padding: "10px 12px" }}>
      <div
        className="flex items-center gap-1 px-4 py-2 rounded-2xl pointer-events-auto"
        style={{
          background: "rgba(15, 15, 35, 0.8)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        {dockApps.map(({ id, icon: Icon, label }) => {
          const win = windows[id];
          const isActive = win?.isOpen && !win?.isMinimized;
          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              onDoubleClick={() => handleDoubleClick(id)}
              className="relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 group min-w-[52px]"
              title={label}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-indigo-500/15" : ""}`}>
                <Icon
                  className={`text-xl transition-all duration-200 ${
                    isActive
                      ? "text-indigo-400 scale-110"
                      : "text-white/50 group-hover:text-white/80"
                  }`}
                />
              </div>
              <span className={`text-[9px] transition-colors ${isActive ? "text-indigo-400/80" : "text-white/20 group-hover:text-white/40"}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
