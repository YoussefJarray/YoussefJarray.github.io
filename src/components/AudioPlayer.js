"use client";
import { useRef, useEffect } from "react";
import { useMusicStore, tracks } from "../store/musicStore";
import { useAudioStore } from "../store/audioStore";

export default function AudioPlayer() {
  const audioRef = useRef(null);
  const attachAudio = useMusicStore((s) => s.attachAudio);
  const detachAudio = useMusicStore((s) => s.detachAudio);
  const currentIdx = useMusicStore((s) => s.currentIdx);

  const { muted, volume, duckVolume } = useAudioStore();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = tracks[currentIdx].src;
    audio.load();
    attachAudio(audio, duckVolume, muted, volume);
    return () => detachAudio();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const track = tracks[currentIdx];
    if (!audio.src.endsWith(track.src.split("/").pop())) {
      audio.src = track.src;
      audio.load();
      audio.play().catch(() => {});
    }
  }, [currentIdx]);

  return <audio ref={audioRef} preload="auto" />;
}
