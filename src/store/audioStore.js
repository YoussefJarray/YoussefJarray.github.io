import { create } from "zustand";

export const useAudioStore = create((set) => ({
  volume: 0.5,
  muted: false,
  duckVolume: 1,
  setVolume: (v) => set({ volume: v }),
  setMuted: (m) => set({ muted: m }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setDuckVolume: (v) => set({ duckVolume: v }),
}));
