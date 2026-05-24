import { create } from "zustand";

const STORAGE_KEY = "portfolio-settings";

const getInitial = () => {
  if (typeof document === "undefined") return { scale: 1 };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (typeof parsed.scale === "number") return parsed;
    }
  } catch {}
  return { scale: 1 };
};

export const useSettingsStore = create((set) => ({
  ...getInitial(),
  setScale: (scale) =>
    set((s) => {
      const next = { ...s, scale };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ scale })); } catch {}
      return next;
    }),
}));
