"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const EMOJIS = ["🐶", "🐱", "🐸", "🦊", "🐻", "🐼", "🐨", "🦁"];
const GRID_SIZE = 4;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createCards() {
  const pairs = shuffle(EMOJIS).slice(0, (GRID_SIZE * GRID_SIZE) / 2);
  const cards = shuffle([...pairs, ...pairs]);
  return cards.map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryApp() {
  const [cards, setCards] = useState(createCards);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);
  const lockRef = useRef(false);

  useEffect(() => {
    if (!started || gameWon) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [started, gameWon]);

  useEffect(() => {
    if (gameWon && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [gameWon]);

  const handleCardClick = useCallback((id) => {
    if (lockRef.current) return;
    setCards((prev) => {
      const card = prev.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return prev;
      if (!started) setStarted(true);
      if (flipped.length >= 2) return prev;

      const next = prev.map((c) => c.id === id ? { ...c, flipped: true } : c);
      const newFlipped = [...flipped, id];

      if (newFlipped.length === 2) {
        lockRef.current = true;
        setMoves((m) => m + 1);
        const [first, second] = newFlipped.map((fid) => next.find((c) => c.id === fid));
        if (first.emoji === second.emoji) {
          const matched = next.map((c) =>
            c.id === first.id || c.id === second.id ? { ...c, matched: true } : c
          );
          setFlipped([]);
          lockRef.current = false;
          if (matched.every((c) => c.matched)) {
            setGameWon(true);
          }
          return matched;
        } else {
          setTimeout(() => {
            setCards((p) => p.map((c) =>
              c.id === first.id || c.id === second.id ? { ...c, flipped: false } : c
            ));
            setFlipped([]);
            lockRef.current = false;
          }, 700);
          return next;
        }
      }

      setFlipped(newFlipped);
      return next;
    });
  }, [flipped, started]);

  const handleReset = () => {
    setCards(createCards());
    setFlipped([]);
    setMoves(0);
    setTime(0);
    setGameWon(false);
    setStarted(false);
    lockRef.current = false;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-full flex flex-col items-center select-none" style={{ background: "var(--bg-root)" }}>
      {/* Status bar */}
      <div className="flex items-center justify-between w-full px-4 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
            Moves: <span className="font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{moves}</span>
          </div>
          <div className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
            Time: <span className="font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>{formatTime(time)}</span>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="text-[10px] px-2.5 py-1 rounded-lg transition-all hover:bg-white/10"
          style={{ color: "var(--text-muted)" }}
        >
          New Game
        </button>
      </div>

      {/* Game grid */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, width: 280 }}
        >
          {cards.map((card) => {
            const isFlipped = card.flipped || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.matched}
                className="flex items-center justify-center rounded-xl text-2xl transition-all duration-300"
                style={{
                  aspectRatio: "1",
                  background: isFlipped
                    ? "var(--bg-elevated)"
                    : "var(--accent)",
                  transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
                  boxShadow: isFlipped
                    ? "0 2px 8px rgba(0,0,0,0.15)"
                    : "0 4px 12px rgba(0,0,0,0.25)",
                  cursor: card.matched ? "default" : "pointer",
                  opacity: card.matched ? 0.6 : 1,
                }}
              >
                <span style={{
                  transform: isFlipped ? "rotateY(0deg)" : "rotateY(180deg)",
                  transition: "transform 0.3s",
                }}>
                  {isFlipped ? card.emoji : "?"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Win overlay */}
      {gameWon && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="text-center p-6 rounded-2xl" style={{ background: "var(--window-bg)", border: "1px solid var(--border)" }}>
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>You Win!</div>
            <div className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {moves} moves in {formatTime(time)}
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
