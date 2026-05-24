import { create } from "zustand";

const STORAGE_KEY = "portfolio-theme";

const getInitial = () => {
  if (typeof document === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {}
  return "dark";
};

const applyTheme = (mode) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", mode);
  }
};

export const useThemeStore = create((set) => ({
  mode: getInitial(),
  toggle: () =>
    set((s) => {
      const next = s.mode === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return { mode: next };
    }),
  init: () => {
    const mode = getInitial();
    applyTheme(mode);
    set({ mode });
  },
}));
