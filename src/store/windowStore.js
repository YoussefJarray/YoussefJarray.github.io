import { create } from "zustand";

const defaultApps = [
  { id: "files", title: "Files", icon: "folder", app: "FileManager", x: 60, y: 20, w: 820, h: 520 },
  { id: "terminal", title: "Terminal", icon: "terminal", app: "Terminal", x: 100, y: 40, w: 700, h: 440 },
  { id: "about", title: "About Me", icon: "user", app: "AboutApp", x: 140, y: 30, w: 620, h: 480 },
  { id: "settings", title: "Settings", icon: "settings", app: "SettingsApp", x: 180, y: 40, w: 580, h: 480 },
  { id: "browser", title: "Web Browser", icon: "browser", app: "BrowserApp", x: 80, y: 10, w: 920, h: 580 },
  { id: "photos", title: "Photos", icon: "photos", app: "PhotosApp", x: 120, y: 30, w: 800, h: 520 },
  { id: "markdown", title: "Markdown Viewer", icon: "file", app: "MarkdownViewer", x: 120, y: 30, w: 600, h: 460 },
  { id: "tictactoe", title: "Tic-Tac-Toe", icon: "tictactoe", app: "TicTacToe", x: 200, y: 60, w: 320, h: 380 },
  { id: "sudoku", title: "Sudoku", icon: "sudoku", app: "Sudoku", x: 250, y: 80, w: 360, h: 440 },
  { id: "pong", title: "Pong", icon: "pong", app: "Pong", x: 150, y: 40, w: 680, h: 500 },
  { id: "doom", title: "Doom", icon: "doom", app: "Doom", x: 100, y: 30, w: 680, h: 500 },
];

const buildInitial = () => {
  const w = {};
  defaultApps.forEach((a) => {
    w[a.id] = {
      id: a.id, title: a.title, icon: a.icon, app: a.app,
      isOpen: false, isMinimized: false, isMaximized: false,
      position: { x: a.x, y: a.y }, size: { width: a.w, height: a.h }, zIndex: 1000,
      data: null,
    };
  });
  return w;
};

export const useWindowStore = create((set) => ({
  windows: buildInitial(),
  focusedWindowId: null,
  nextZIndex: 1001,
  startMenuOpen: false,
  setStartMenuOpen: (open) => set({ startMenuOpen: open }),

  openWindow: (id, data) =>
    set((s) => {
      const w = s.windows[id];
      if (!w) return s;
      return {
        windows: { ...s.windows, [id]: { ...w, isOpen: true, isMinimized: false, zIndex: s.nextZIndex, data: data || w.data || null } },
        focusedWindowId: id,
        nextZIndex: s.nextZIndex + 1,
      };
    }),

  closeWindow: (id) =>
    set((s) => {
      const w = s.windows[id];
      if (!w) return s;
      const next = { ...s.windows, [id]: { ...w, isOpen: false, isMinimized: false } };
      return { windows: next, focusedWindowId: s.focusedWindowId === id ? null : s.focusedWindowId };
    }),

  minimizeWindow: (id) =>
    set((s) => {
      const w = s.windows[id];
      if (!w) return s;
      const next = { ...s.windows, [id]: { ...w, isMinimized: !w.isMinimized } };
      return { windows: next, focusedWindowId: s.focusedWindowId === id ? null : s.focusedWindowId };
    }),

  toggleMaximize: (id) =>
    set((s) => {
      const w = s.windows[id];
      if (!w) return s;
      return { windows: { ...s.windows, [id]: { ...w, isMaximized: !w.isMaximized } } };
    }),

  focusWindow: (id) =>
    set((s) => {
      const w = s.windows[id];
      if (!w || !w.isOpen || w.isMinimized) return s;
      return {
        focusedWindowId: id, nextZIndex: s.nextZIndex + 1,
        windows: { ...s.windows, [id]: { ...w, zIndex: s.nextZIndex } },
      };
    }),

  moveWindow: (id, x, y) =>
    set((s) => {
      const w = s.windows[id];
      if (!w) return s;
      return { windows: { ...s.windows, [id]: { ...w, position: { x, y } } } };
    }),

  resizeWindow: (id, w_, h_) =>
    set((s) => {
      const w = s.windows[id];
      if (!w) return s;
      return { windows: { ...s.windows, [id]: { ...w, size: { width: w_, height: h_ } } } };
    }),
}));
