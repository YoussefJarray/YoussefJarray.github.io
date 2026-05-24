import { create } from "zustand";

const STORAGE_KEY = "portfolio-widget-state";

function getDefaultWidgets() {
  const rx = typeof window !== "undefined" ? window.innerWidth - 224 : 1200;
  const musicX = typeof window !== "undefined" ? window.innerWidth - 290 : 1130;
  return {
    clock: { enabled: true, x: rx, y: 60 },
    sticky: { enabled: true, x: rx, y: 220 },
    cat: { enabled: true, x: rx, y: 370 },
    music: { enabled: false, x: musicX, y: 520 },
  };
}

function loadState() {
  if (typeof document === "undefined") return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const def = getDefaultWidgets();
      Object.keys(def).forEach((k) => { if (!parsed[k]) parsed[k] = { enabled: false, x: def[k].x, y: def[k].y }; });
      return parsed;
    }
  } catch {}
  return null;
}

export const useWidgetStore = create((set) => ({
  widgets: loadState() || getDefaultWidgets(),
  toggleWidget: (id) =>
    set((s) => {
      const next = { ...s.widgets, [id]: { ...s.widgets[id], enabled: !s.widgets[id].enabled } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return { widgets: next };
    }),
  moveWidget: (id, x, y) =>
    set((s) => {
      const next = { ...s.widgets, [id]: { ...s.widgets[id], x, y } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return { widgets: next };
    }),
  resetPositions: () => {
    const def = getDefaultWidgets();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(def)); } catch {}
    return set({ widgets: def });
  },
}));
