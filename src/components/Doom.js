"use client";
import { useEffect, useRef } from "react";
import { DOOM } from "wasm-doom";
import { useAudioStore } from "../store/audioStore";

function fadeTo(from, to, duration, setter) {
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / (duration * 1000), 1);
    setter(Math.max(0, Math.min(1, from + (to - from) * t)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function playShoot(ctx) {
  const duration = 0.12;
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const env = 1 - i / data.length;
    const noise = (Math.random() * 2 - 1) * env;
    const tone = Math.sin(2 * Math.PI * 200 * (i / ctx.sampleRate)) * env * 0.3;
    data[i] = noise * 0.6 + tone * 0.4;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.value = 0.15;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

function playStep(ctx) {
  const duration = 0.06;
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const env = 1 - i / data.length;
    data[i] = (Math.random() * 2 - 1) * env * 0.3;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.value = 0.04;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

function playUse(ctx) {
  const duration = 0.2;
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    const env = 1 - i / data.length;
    data[i] = Math.sin(2 * Math.PI * (300 + t * 800) * t) * env * 0.2;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const gain = ctx.createGain();
  gain.gain.value = 0.08;
  src.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

export default function Doom() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const setDuckVolume = useAudioStore((s) => s.setDuckVolume);
  const firedRef = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    fadeTo(1, 0, 1.2, setDuckVolume);

    let audioCtx = null;
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
    audioRef.current = audioCtx;

    const doom = new DOOM({
      screenWidth: 320,
      screenHeight: 200,
      keyboardTarget: canvas,
      onFrameRender: ({ screen }) => {
        const imageData = new ImageData(screen, 640, 400);
        ctx.putImageData(imageData, 0, 0);
      },
    });

    doom.start();

    const onDown = (e) => {
      if (!audioCtx) return;
      if (audioCtx.state === "suspended") audioCtx.resume();
      const k = e.key.toLowerCase();
      if ((k === "control" || e.key === "Control") && !firedRef.current.ctrl) {
        firedRef.current.ctrl = true;
        playShoot(audioCtx);
      }
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k) && !firedRef.current[k]) {
        firedRef.current[k] = true;
        playStep(audioCtx);
      }
      if (k === " " && !firedRef.current.space) {
        firedRef.current.space = true;
        playUse(audioCtx);
      }
    };
    const onUp = (e) => {
      const k = e.key.toLowerCase();
      firedRef.current[k === "control" || e.key === "Control" ? "ctrl" : k] = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    return () => {
      fadeTo(0, 1, 1.2, setDuckVolume);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      try { audioCtx?.close(); } catch {}
    };
  }, [setDuckVolume]);

  return (
    <div className="h-full flex flex-col items-center justify-center p-2 select-none" style={{ background: "#000" }}>
      <canvas
        ref={canvasRef}
        width={640}
        height={400}
        tabIndex={0}
        className="rounded-xl outline-none"
        style={{ maxWidth: "100%", height: "auto", aspectRatio: "640/400" }}
        onClick={(e) => e.currentTarget.focus()}
      />
      <div className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
        Click to focus · ↑↓←→ move · Ctrl shoot · Space open · Alt+←→ strafe
      </div>
    </div>
  );
}
