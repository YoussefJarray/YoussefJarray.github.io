import { create } from "zustand";

const STORAGE_KEY = "portfolio-icon-positions";

const defaultPositions = {
  files: { x: 24, y: 72 },
  terminal: { x: 130, y: 72 },
  about: { x: 24, y: 148 },
  browser: { x: 24, y: 224 },
  photos: { x: 130, y: 148 },
  settings: { x: 24, y: 300 },
  doom: { x: 130, y: 224 },
  pong: { x: 24, y: 376 },
  tictactoe: { x: 130, y: 300 },
  sudoku: { x: 130, y: 376 },
  resume: { x: 24, y: 452 },
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
  positions: { ...defaultPositions, ...loadPositions() },
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
