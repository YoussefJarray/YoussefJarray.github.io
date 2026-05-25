import { create } from "zustand";

const STORAGE_KEY = "portfolio-icon-positions";

const defaultPositions = {
  files: { x: 20, y: 68 },
  terminal: { x: 120, y: 68 },
  about: { x: 20, y: 140 },
  browser: { x: 20, y: 212 },
  photos: { x: 120, y: 140 },
  settings: { x: 20, y: 284 },
  doom: { x: 120, y: 212 },
  pong: { x: 20, y: 356 },
  tictactoe: { x: 120, y: 284 },
  sudoku: { x: 120, y: 356 },
  resume: { x: 20, y: 428 },
  calculator: { x: 120, y: 428 },
  minesweeper: { x: 220, y: 68 },
  githubstats: { x: 220, y: 140 },
  memory: { x: 220, y: 212 },
  paint: { x: 220, y: 284 },
  snake: { x: 220, y: 356 },
  breakout: { x: 220, y: 428 },
  typing: { x: 220, y: 500 },
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
