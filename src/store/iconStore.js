import { create } from "zustand";

const STORAGE_KEY = "portfolio-icon-positions";

const defaultPositions = {
  files: { x: 24, y: 72 },
  terminal: { x: 24, y: 148 },
  about: { x: 24, y: 224 },
  browser: { x: 24, y: 300 },
  photos: { x: 24, y: 376 },
  settings: { x: 24, y: 452 },
};

const loadPositions = () => {
  if (typeof document === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
};

export const useIconStore = create((set) => ({
  positions: loadPositions() || defaultPositions,
  moveIcon: (id, x, y) =>
    set((s) => {
      const next = { ...s.positions, [id]: { x, y } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return { positions: next };
    }),
  resetPositions: () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    return set({ positions: defaultPositions });
  },
}));
