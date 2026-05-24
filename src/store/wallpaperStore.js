import { create } from "zustand";

const STORAGE_KEY = "portfolio-wallpaper";

export const wallpapers = [
  { id: "night-city", url: "/wallpaper.jpg", label: "Night City" },
  { id: "abstract-neon", url: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?fm=jpg&q=60&w=3000&auto=format&fit=crop", label: "Abstract Neon" },
  { id: "abstract-warm", url: "https://images.unsplash.com/photo-1620207418302-439b387441b0?fm=jpg&q=60&w=3000&auto=format&fit=crop", label: "Abstract Warm" },
];

export const accentColors = [
  { name: "Match Wallpaper", value: "match", desc: "Auto from wallpaper" },
  { name: "Orange", value: "#f97316" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Purple", value: "#a855f7" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#eab308" },
  { name: "Pink", value: "#ec4899" },
];

function load() {
  if (typeof document === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export const useWallpaperStore = create((set, get) => ({
  selected: load() || { wallpaper: "night-city", accent: "match" },
  setWallpaper: (id) => {
    const cur = get().selected;
    const next = { ...cur, wallpaper: id };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    set({ selected: next });
  },
  setAccent: (color) => {
    const cur = get().selected;
    const next = { ...cur, accent: color };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    set({ selected: next });
  },
}));
