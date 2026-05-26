"use client";
import { useState } from "react";
import { useThemeStore } from "../store/themeStore";
import { useWallpaperStore, wallpapers, accentColors } from "../store/wallpaperStore";
import { useAudioStore } from "../store/audioStore";
import { useSettingsStore } from "../store/settingsStore";
import { FiSun, FiMoon, FiMonitor, FiCpu, FiDroplet, FiCheck, FiVolume2 } from "react-icons/fi";

const sections = [
  { id: "appearance", label: "Appearance", icon: FiDroplet },
  { id: "system", label: "System", icon: FiCpu },
];

export default function SettingsApp() {
  const { mode, toggle } = useThemeStore();
  const { selected, setWallpaper, setAccent } = useWallpaperStore();
  const { volume, setVolume } = useAudioStore();
  useSettingsStore();
  const [activeSection, setActiveSection] = useState("appearance");

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="w-full md:w-44 border-b md:border-b-0 md:border-r border-subtle shrink-0 overflow-auto p-2 flex md:flex-col gap-1" style={{ background: "var(--bg-surface)" }}>
        <div className="hidden md:flex items-center gap-2.5 px-3 py-3 border-b border-subtle mb-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-light)" }}>
            <FiMonitor style={{ color: "var(--accent)" }} size={14} />
          </div>
          <div>
            <div className="text-xs font-medium text-primary">Settings</div>
            <div className="text-[9px] text-muted">System Preferences</div>
          </div>
        </div>
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center justify-center md:justify-start gap-2.5 flex-1 md:flex-none px-3 py-2 rounded-lg text-xs transition-all duration-150 btn-hover ${
                isActive
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-muted hover:text-secondary hover:bg-surface-hover"
              }`}
            >
              <Icon size={14} />
              {sec.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto p-5">
        {activeSection === "appearance" && (
          <div>
            <h2 className="text-sm font-semibold text-primary mb-4">Appearance</h2>

            <div className="mb-6">
              <p className="text-xs font-medium text-secondary mb-3">Wallpaper</p>
              <div className="grid grid-cols-3 gap-3">
                {wallpapers.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setWallpaper(wp.id)}
                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all btn-hover ${
                      selected.wallpaper === wp.id ? "border-accent" : "border-subtle hover:border-secondary"
                    }`}
                  >
                    <img src={wp.url} alt="" className="w-full h-full object-cover" />
                    {selected.wallpaper === wp.id && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                        <FiCheck size={10} color="white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-medium text-secondary mb-3">Accent Color</p>
              <div className="flex flex-wrap gap-2.5">
                {accentColors.map((ac) => {
                  const isActive = selected.accent === ac.value;
                  const isMatch = ac.value === "match";
                  return (
                    <button
                      key={ac.value}
                      onClick={() => setAccent(ac.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] transition-all btn-hover ${
                        isActive
                          ? "border-accent bg-accent/10"
                          : "border-subtle hover:border-secondary"
                      }`}
                      title={ac.name}
                    >
                      {isMatch ? (
                        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-400 via-rose-400 to-purple-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full" style={{ background: ac.value }} />
                      )}
                      <span className="text-secondary">{ac.name}</span>
                      {isActive && <FiCheck size={10} style={{ color: "var(--accent)" }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { if (mode !== "dark") toggle(); }}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-150 btn-hover ${
                  mode === "dark" ? "bg-surface-hover" : "bg-surface border-subtle hover:bg-surface-hover"
                }`}
                style={{ borderColor: mode === "dark" ? "var(--accent-light)" : "var(--border)" }}
              >
                <FiMoon size={22} style={{ color: mode === "dark" ? "var(--accent)" : "var(--text-muted)" }} />
                <div className="text-center">
                  <div className="text-xs font-medium text-primary">Dark</div>
                  <div className="text-[10px] text-muted mt-0.5">Easy on the eyes</div>
                </div>
              </button>
              <button
                onClick={() => { if (mode !== "light") toggle(); }}
                className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-150 btn-hover ${
                  mode === "light" ? "bg-surface-hover" : "bg-surface border-subtle hover:bg-surface-hover"
                }`}
                style={{ borderColor: mode === "light" ? "var(--accent-light)" : "var(--border)" }}
              >
                <FiSun size={22} style={{ color: mode === "light" ? "var(--accent)" : "var(--text-muted)" }} />
                <div className="text-center">
                  <div className="text-xs font-medium text-primary">Light</div>
                  <div className="text-[10px] text-muted mt-0.5">Bright & clean</div>
                </div>
              </button>
            </div>

            <div className="mt-6 p-4 rounded-xl border border-subtle" style={{ background: "var(--bg-surface)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-secondary">Current theme</p>
                  <p className="text-[10px] text-muted mt-0.5 capitalize">{mode} mode</p>
                </div>
                <button
                  onClick={toggle}
                  className="text-[10px] font-medium px-3 py-1.5 rounded-lg border transition-colors btn-hover"
                  style={{ color: "var(--accent)", borderColor: "var(--accent-light)", background: "var(--accent-light)" }}
                >
                  Toggle
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === "system" && (
          <div>
            <h2 className="text-sm font-semibold text-primary mb-4">System</h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-secondary">Volume</p>
                <span className="text-[10px] text-muted font-mono">{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <FiVolume2 size={14} className="text-muted shrink-0" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={Math.round(volume * 100)}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  className="flex-1 slider-accent"
                  style={{ accentColor: "var(--accent)" }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-subtle p-4" style={{ background: "var(--bg-surface)" }}>
              <p className="text-xs text-secondary">Wallpapers sourced from <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="font-medium" style={{ color: "var(--accent)" }}>Unsplash</a>.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
