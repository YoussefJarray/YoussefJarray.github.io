import { create } from "zustand";

export const useAudioStore = create((set) => ({
  volume: 0.5,
  muted: false,
  setVolume: (v) => set({ volume: v }),
  setMuted: (m) => set({ muted: m }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}));
