"use client";
import { useEffect, useRef } from "react";
import { DOOM } from "wasm-doom";
import { useAudioStore } from "../store/audioStore";

function fadeTo(from, to, duration, setter) {
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / (duration * 1000), 1);
    setter(from + (to - from) * t);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export default function Doom() {
  const canvasRef = useRef(null);
  const setDuckVolume = useAudioStore((s) => s.setDuckVolume);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    fadeTo(1, 0, 1.2, setDuckVolume);

    let audioCtx = null;
    let oscNodes = [];
    let gainNode = null;
    let noiseGain = null;

    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.08;
      gainNode.connect(audioCtx.destination);

      noiseGain = audioCtx.createGain();
      noiseGain.gain.value = 0;
      noiseGain.connect(audioCtx.destination);

      const freqs = [35, 42, 52];
      for (const f of freqs) {
        const osc = audioCtx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = f;
        const g = audioCtx.createGain();
        g.gain.value = 1 / freqs.length;
        osc.connect(g);
        g.connect(gainNode);
        osc.start();
        oscNodes.push(osc);
      }

      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 3;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      lfo.start();

      const bufferSize = audioCtx.sampleRate * 0.1;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noiseSrc = audioCtx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;
      noiseSrc.connect(noiseGain);
      noiseSrc.start();
    } catch {}

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

    return () => {
      fadeTo(0, 1, 1.2, setDuckVolume);
      oscNodes.forEach((o) => { try { o.stop(); } catch {} });
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
