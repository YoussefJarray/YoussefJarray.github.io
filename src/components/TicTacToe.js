"use client";
import { useState, useEffect, useRef } from "react";

const WIN = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function calcWinner(b) {
  for (const [a,c,d] of WIN) if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  return b.every(Boolean) ? "draw" : null;
}

function minimax(board, isMax) {
  const w = calcWinner(board);
  if (w === "O") return 10;
  if (w === "X") return -10;
  if (w === "draw") return 0;

  let best = isMax ? -Infinity : Infinity;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = isMax ? "O" : "X";
      const score = minimax(board, !isMax);
      board[i] = null;
      best = isMax ? Math.max(best, score) : Math.min(best, score);
    }
  }
  return best;
}

function cpuMove(board) {
  let bestScore = -Infinity, bestIdx = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      const score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
  }
  return bestIdx;
}

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const winner = calcWinner(board);
  const isPlayerTurn = board.filter(Boolean).length % 2 === 0;
  const lock = useRef(false);

  useEffect(() => {
    if (winner || isPlayerTurn || lock.current) return;
    lock.current = true;
    const id = setTimeout(() => {
      setBoard((b) => {
        const nb = [...b];
        const idx = cpuMove(nb);
        if (idx !== -1) nb[idx] = "O";
        return nb;
      });
      lock.current = false;
    }, 350);
    return () => { clearTimeout(id); lock.current = false; };
  }, [board, winner, isPlayerTurn]);

  const move = (i) => {
    if (board[i] || winner || !isPlayerTurn) return;
    setBoard(board.map((c, j) => j === i ? "X" : c));
  };
  const reset = () => { lock.current = false; setBoard(Array(9).fill(null)); };

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 select-none p-4" style={{ background: "var(--bg-root)" }}>
      <div className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
        {winner === "draw" ? "Draw!" : winner ? `${winner} wins!` : isPlayerTurn ? "Your turn (X)" : "CPU thinking..."}
      </div>
      <div className="grid grid-cols-3 gap-1.5" style={{ width: 210 }}>
        {board.map((c, i) => (
          <button key={i} onClick={() => move(i)}
            className="flex items-center justify-center text-lg font-bold rounded-lg transition-all hover:bg-white/5 active:scale-95"
            style={{ width: 64, height: 64, background: "var(--bg-elevated)", border: "1px solid var(--border)", color: c === "X" ? "var(--accent)" : "#34d399" }}
          >{c}</button>
        ))}
      </div>
      <button onClick={reset} className="text-[10px] px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
        style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}>New Game</button>
    </div>
  );
}
