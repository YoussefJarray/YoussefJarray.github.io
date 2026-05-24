"use client";
import { useRef, useEffect, useState, useCallback } from "react";

const W = 600, H = 400;
const PAD_W = 8, PAD_H = 60, BALL_R = 5, SPEED = 3;
const AI_SPEED = 2.5;
const WIN_SCORE = 7;

function css(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export default function Pong() {
  const canvas = useRef(null);
  const keys = useRef({});
  const sRef = useRef(null);
  const [score, setScore] = useState({ p: 0, ai: 0 });
  const [phase, setPhase] = useState("idle");
  const [cdNum, setCdNum] = useState(null);
  const cdRef = useRef(null);
  const phaseRef = useRef("idle");

  const setPhaseBoth = useCallback((p) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const beginCountdown = useCallback(() => {
    setPhaseBoth("countdown");
    setCdNum(3);
    let n = 3;
    cdRef.current = setInterval(() => {
      n--;
      if (n > 0) {
        setCdNum(n);
      } else {
        setCdNum(0);
        clearInterval(cdRef.current);
        setTimeout(() => {
          setPhaseBoth("playing");
          setCdNum(null);
          const s = sRef.current;
          const angle = (Math.random() - 0.5) * Math.PI * 0.6;
          const dir = Math.random() > 0.5 ? 1 : -1;
          s.bvx = Math.cos(angle) * dir * SPEED;
          s.bvy = Math.sin(angle) * SPEED;
        }, 600);
      }
    }, 1000);
  }, [setPhaseBoth]);

  useEffect(() => {
    const onDown = (e) => {
      keys.current[e.key.toLowerCase()] = true;
      if (e.key === " " && phaseRef.current === "idle") beginCountdown();
    };
    const onUp = (e) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, [beginCountdown]);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");

    const cs = {
      bg: css("--bg-root"),
      border: css("--border"),
      fg: css("--text-primary"),
    };

    const s = {
      px: 20, py: H / 2 - PAD_H / 2,
      ax: W - 20 - PAD_W, ay: H / 2 - PAD_H / 2,
      bx: W / 2, by: H / 2, bvx: 0, bvy: 0,
    };

    if (sRef.current) {
      s.px = sRef.current.px; s.py = sRef.current.py;
      s.ax = sRef.current.ax; s.ay = sRef.current.ay;
      s.bx = sRef.current.bx; s.by = sRef.current.by;
      s.bvx = sRef.current.bvx; s.bvy = sRef.current.bvy;
    }
    sRef.current = s;

    const onGoal = (scorer) => {
      s.bx = W / 2; s.by = H / 2;
      s.bvx = 0; s.bvy = 0;
      clearInterval(cdRef.current);
      setScore((sc) => {
        const next = scorer === "p" ? { p: sc.p + 1, ai: sc.ai } : { p: sc.p, ai: sc.ai + 1 };
        if (next.p >= WIN_SCORE || next.ai >= WIN_SCORE) {
          setPhaseBoth("gameover");
        } else {
          setTimeout(() => beginCountdown(), 0);
        }
        return next;
      });
    };

    let raf, running = true;

    const loop = () => {
      if (!running) return;
      const k = keys.current;

      if (k["arrowup"] || k["w"]) s.py = Math.max(0, s.py - 5);
      if (k["arrowdown"] || k["s"]) s.py = Math.min(H - PAD_H, s.py + 5);

      const aiTarget = s.by - PAD_H / 2;
      if (Math.abs(s.ay - aiTarget) > 4) s.ay += Math.sign(aiTarget - s.ay) * AI_SPEED;
      s.ay = Math.max(0, Math.min(H - PAD_H, s.ay));

      if (phaseRef.current === "playing") {
        s.bx += s.bvx;
        s.by += s.bvy;

        if (s.by - BALL_R <= 0 || s.by + BALL_R >= H) s.bvy = -s.bvy;
        if (s.bx - BALL_R <= s.px + PAD_W && s.by >= s.py && s.by <= s.py + PAD_H) s.bvx = Math.abs(s.bvx);
        if (s.bx + BALL_R >= s.ax && s.by >= s.ay && s.by <= s.ay + PAD_H) s.bvx = -Math.abs(s.bvx);

        if (s.bx < -10) { onGoal("ai"); }
        if (s.bx > W + 10) { onGoal("p"); }
      }

      ctx.fillStyle = cs.bg;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = cs.border;
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = cs.fg;
      ctx.fillRect(s.px, s.py, PAD_W, PAD_H);
      ctx.fillRect(s.ax, s.ay, PAD_W, PAD_H);

      ctx.beginPath(); ctx.arc(s.bx, s.by, BALL_R, 0, Math.PI * 2); ctx.fill();

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => { running = false; cancelAnimationFrame(raf); };
  }, [beginCountdown, setPhaseBoth]);

  const restart = () => {
    clearInterval(cdRef.current);
    const s = sRef.current;
    if (s) { s.bx = W / 2; s.by = H / 2; s.bvx = 0; s.bvy = 0; }
    setScore({ p: 0, ai: 0 });
    setPhaseBoth("idle");
    setCdNum(null);
  };

  const cdOverlay = phase === "countdown" && cdNum !== null && (
    <div className="absolute inset-0 flex items-center justify-center rounded-xl pointer-events-none"
      style={{ background: "rgba(0,0,0,0.35)" }}>
      <span className="text-5xl font-bold" style={{ color: "var(--text-primary)" }}>
        {cdNum === 0 ? "GO!" : cdNum}
      </span>
    </div>
  );

  const gameOverOverlay = phase === "gameover" && (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl"
      style={{ background: "rgba(0,0,0,0.6)" }}>
      <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
        {score.p >= WIN_SCORE ? "You win!" : "AI wins!"}
      </span>
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {score.p} – {score.ai}
      </span>
      <button onClick={restart} className="text-[10px] px-4 py-2 rounded-lg transition-all hover:bg-white/10"
        style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
        Play Again
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 select-none" style={{ background: "var(--bg-root)" }}>
      <div className="flex gap-8 mb-2 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
        <span>You: {score.p}</span>
        <span>AI: {score.ai}</span>
      </div>
      <div className="relative">
        <canvas ref={canvas} width={W} height={H}
          className="rounded-xl"
          style={{ border: "1px solid var(--border)", maxWidth: "100%", height: "auto", aspectRatio: `${W}/${H}` }}
        />
        {cdOverlay}
        {gameOverOverlay}
      </div>
      <div className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
        {phase === "idle" ? "Press SPACE to start" :
         phase === "playing" ? "W/S or ↑/↓ to move" :
         phase === "gameover" ? "Game over" : ""}
      </div>
    </div>
  );
}
