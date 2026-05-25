"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const W = 400, H = 340;
const PADDLE_W = 60, PADDLE_H = 8, BALL_R = 5;
const BRICK_ROWS = 5, BRICK_COLS = 8;
const BRICK_W = 40, BRICK_H = 14, GAP = 4;

export default function BreakoutApp() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [lives, setLives] = useState(3);
  const [won, setWon] = useState(false);
  const stateRef = useRef(null);
  const animRef = useRef(null);

  const init = useCallback(() => {
    const bricks = [];
    for (let r = 0; r < BRICK_ROWS; r++)
      for (let c = 0; c < BRICK_COLS; c++)
        bricks.push({ x: c * (BRICK_W + GAP) + 20, y: r * (BRICK_H + GAP) + 30, alive: true });
    return {
      ball: { x: W / 2, y: H - 30, dx: 2, dy: -2 },
      paddle: { x: (W - PADDLE_W) / 2 },
      bricks,
    };
  }, []);

  const reset = () => {
    stateRef.current = init();
    setScore(0);
    setLives(3);
    setWon(false);
    setRunning(true);
  };

  useEffect(() => {
    stateRef.current = init();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const state = stateRef.current;
      if (!state) return;
      const { ball, paddle, bricks } = state;

      // draw
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, W, H);

      // bricks
      bricks.forEach(b => {
        if (!b.alive) return;
        ctx.fillStyle = `hsl(${b.y * 6}, 70%, 50%)`;
        ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillRect(b.x, b.y, BRICK_W, 3);
      });

      // paddle
      ctx.fillStyle = "var(--accent)";
      ctx.fillRect(paddle.x, H - PADDLE_H - 8, PADDLE_W, PADDLE_H);

      // ball
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();

      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [init]);

  // mouse/touch
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onMove = (e) => {
      const state = stateRef.current;
      if (!state) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const mx = (e.clientX - rect.left) * scaleX;
      state.paddle.x = Math.max(0, Math.min(W - PADDLE_W, mx - PADDLE_W / 2));
    };
    const onDown = (e) => {
      const state = stateRef.current;
      if (!state) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const mx = (e.clientX - rect.left) * scaleX;
      state.paddle.x = Math.max(0, Math.min(W - PADDLE_W, mx - PADDLE_W / 2));
    };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", onDown);
    return () => { canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("mousedown", onDown); };
  }, []);

  // game loop (physics)
  useEffect(() => {
    if (!running) return;
    let lastTime = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(now - lastTime, 20);
      lastTime = now;
      const state = stateRef.current;
      if (!state) return;
      const { ball, paddle, bricks } = state;

      ball.x += ball.dx * (dt / 16);
      ball.y += ball.dy * (dt / 16);

      // walls
      if (ball.x - BALL_R < 0) { ball.x = BALL_R; ball.dx = -ball.dx; }
      if (ball.x + BALL_R > W) { ball.x = W - BALL_R; ball.dx = -ball.dx; }
      if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.dy = -ball.dy; }

      // paddle
      if (ball.y + BALL_R > H - PADDLE_H - 8 && ball.y - BALL_R < H - 8 &&
          ball.x > paddle.x && ball.x < paddle.x + PADDLE_W && ball.dy > 0) {
        ball.dy = -ball.dy;
        ball.y = H - PADDLE_H - 8 - BALL_R;
        const hit = (ball.x - paddle.x) / PADDLE_W;
        ball.dx = (hit - 0.5) * 4;
        if (Math.abs(ball.dx) < 0.5) ball.dx = ball.dx > 0 ? 0.5 : -0.5;
      }

      // bricks
      let hit = false;
      bricks.forEach(b => {
        if (!b.alive || hit) return;
        if (ball.x + BALL_R > b.x && ball.x - BALL_R < b.x + BRICK_W &&
            ball.y + BALL_R > b.y && ball.y - BALL_R < b.y + BRICK_H) {
          b.alive = false;
          ball.dy = -ball.dy;
          hit = true;
          setScore(s => s + 10);
        }
      });

      // lose ball
      if (ball.y + BALL_R > H) {
        setLives(l => {
          if (l - 1 <= 0) {
            setRunning(false);
            return 0;
          }
          state.ball = { x: W / 2, y: H - 30, dx: 2, dy: -2 };
          state.paddle.x = (W - PADDLE_W) / 2;
          return l - 1;
        });
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      // win
      if (bricks.every(b => !b.alive)) {
        setWon(true);
        setRunning(false);
        animRef.current = requestAnimationFrame(tick);
        return;
      }

      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [running]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2 p-4" style={{ background: "var(--window-bg)" }}>
      <div className="flex items-center justify-between w-full max-w-[400px]">
        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Score: {score}</span>
        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Lives: {lives}</span>
        {!running && (
          <button onClick={reset} className="px-3 py-1 rounded-lg text-xs font-medium"
            style={{ background: "var(--accent)", color: "white" }}>
            {lives === 0 ? "Game Over" : won ? "You Win!" : "Start"}
          </button>
        )}
      </div>
      <canvas ref={canvasRef} width={W} height={H} className="rounded-lg"
        style={{ cursor: "pointer", maxWidth: "100%" }} />
      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Move mouse to control paddle</div>
    </div>
  );
}
