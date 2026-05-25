"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const GRID = 16;
const CELL = 20;
const TICK = 150;

export default function SnakeApp() {
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const dirRef = useRef({ x: 1, y: 0 });
  const [snake, setSnake] = useState([{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }]);
  const [food, setFood] = useState({ x: 10, y: 8 });
  const [score, setScore] = useState(0);
  const [dead, setDead] = useState(false);
  const [won, setWon] = useState(false);
  const gameRef = useRef(null);

  const spawnFood = useCallback((segments) => {
    const occupied = new Set(segments.map(s => `${s.x},${s.y}`));
    const free = [];
    for (let x = 0; x < GRID; x++)
      for (let y = 0; y < GRID; y++)
        if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    if (free.length === 0) return null;
    return free[Math.floor(Math.random() * free.length)];
  }, []);

  const reset = () => {
    setSnake([{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }]);
    setFood({ x: 10, y: 8 });
    setScore(0);
    setDead(false);
    setWon(false);
    setDir({ x: 1, y: 0 });
    dirRef.current = { x: 1, y: 0 };
  };

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key;
      if (k === "ArrowUp" && dirRef.current.y !== 1) { setDir({ x: 0, y: -1 }); dirRef.current = { x: 0, y: -1 }; }
      if (k === "ArrowDown" && dirRef.current.y !== -1) { setDir({ x: 0, y: 1 }); dirRef.current = { x: 0, y: 1 }; }
      if (k === "ArrowLeft" && dirRef.current.x !== 1) { setDir({ x: -1, y: 0 }); dirRef.current = { x: -1, y: 0 }; }
      if (k === "ArrowRight" && dirRef.current.x !== -1) { setDir({ x: 1, y: 0 }); dirRef.current = { x: 1, y: 0 }; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (dead || won) return;
    const id = setInterval(() => {
      setSnake(prev => {
        const head = { x: prev[0].x + dirRef.current.x, y: prev[0].y + dirRef.current.y };
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || prev.some(s => s.x === head.x && s.y === head.y)) {
          setDead(true);
          return prev;
        }
        const ate = head.x === food.x && head.y === food.y;
        const next = [head, ...prev.slice(0, ate ? prev.length : prev.length - 1)];
        if (ate) {
          setScore(s => s + 1);
          const newFood = spawnFood(next);
          if (!newFood) { setWon(true); }
          else { setFood(newFood); }
        }
        return next;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [dead, won, food, spawnFood]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-4" style={{ background: "var(--window-bg)" }}>
      <div className="flex items-center justify-between w-full max-w-[320px]">
        <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Score: {score}</span>
        {(dead || won) && (
          <button onClick={reset} className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
            style={{ background: "var(--accent)", color: "white" }}
          >{dead ? "Game Over" : "You Win!"} — Restart</button>
        )}
      </div>
      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${GRID}, ${CELL}px)`, gridTemplateRows: `repeat(${GRID}, ${CELL}px)`,
        background: "rgba(0,0,0,0.2)", borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)",
      }}>
        {Array.from({ length: GRID * GRID }, (_, i) => {
          const x = i % GRID, y = Math.floor(i / GRID);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isHead = snake[0]?.x === x && snake[0]?.y === y;
          const isFood = food?.x === x && food?.y === y;
          return <div key={i} style={{
            width: CELL, height: CELL,
            background: isHead ? "var(--accent)" : isSnake ? "rgba(255,255,255,0.15)" : "transparent",
            borderRadius: isHead ? 4 : 0,
            position: "relative",
          }}>
            {isFood && <div style={{ position: "absolute", inset: 3, borderRadius: "50%", background: "#ef4444" }} />}
          </div>;
        })}
      </div>
      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Arrow keys to move</div>
    </div>
  );
}
