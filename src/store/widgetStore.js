import { create } from "zustand";

const STORAGE_KEY = "portfolio-widget-state";

function getZoom() {
  if (typeof document === "undefined") return 1;
  return parseFloat(document.documentElement.style.zoom) || 1;
}

function getDefaultWidgets() {
  const zoom = getZoom();
  const vw = typeof window !== "undefined" ? window.innerWidth * zoom : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight * zoom : 900;
  return {
    clock: { enabled: true, x: vw - 224, y: 60 },
    sticky: { enabled: true, x: vw - 444, y: 60 },
    cat: { enabled: true, x: vw - 224, y: 200 },
    music: { enabled: true, x: Math.max(0, vw / 2 - 132), y: vh - 260 },
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
