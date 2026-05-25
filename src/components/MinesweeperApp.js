"use client";
import { useState, useCallback, useRef, useEffect } from "react";

const ROWS = 9;
const COLS = 9;
const MINES = 10;

function createBoard() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );
}

function placeMines(board, safeR, safeC) {
  const cells = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (Math.abs(r - safeR) > 1 || Math.abs(c - safeC) > 1)
        cells.push([r, c]);
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  for (let k = 0; k < Math.min(MINES, cells.length); k++) {
    const [r, c] = cells[k];
    board[r][c].mine = true;
  }
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!board[r][c].mine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine)
              count++;
          }
        board[r][c].adjacent = count;
      }
}

function reveal(board, r, c) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c].revealed || board[r][c].flagged)
    return;
  board[r][c].revealed = true;
  if (board[r][c].adjacent === 0 && !board[r][c].mine) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++)
        reveal(board, r + dr, c + dc);
  }
}

function checkWin(board) {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (!board[r][c].mine && !board[r][c].revealed)
        return false;
  return true;
}

function revealAll(board) {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      board[r][c].revealed = true;
}

function flagAllMines(board) {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (board[r][c].mine) board[r][c].flagged = true;
}

const numColors = {
  1: "#3b82f6", 2: "#34d399", 3: "#ef4444", 4: "#1e3a5f",
  5: "#7c3aed", 6: "#2dd4bf", 7: "#171717", 8: "#78716c",
};

export default function MinesweeperApp() {
  const [board, setBoard] = useState(() => createBoard());
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [time, setTime] = useState(0);
  const timerRef = useRef(null);
  const firstRef = useRef(true);
  const boardRef = useRef(board);
  boardRef.current = board;

  useEffect(() => {
    if (!started || gameOver || won) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setTime((t) => Math.min(t + 1, 999)), 1000);
    return () => clearInterval(timerRef.current);
  }, [started, gameOver, won]);

  useEffect(() => {
    if (gameOver || won || firstRef.current || !started) return;
    const b = boardRef.current;
    if (checkWin(b)) {
      setWon(true);
    }
  }, [board, gameOver, won, started]);

  const handleCell = useCallback((r, c) => {
    if (gameOver || won) return;
    setBoard((prev) => {
      const nb = prev.map((row) => row.map((cell) => ({ ...cell })));

      if (nb[r][c].revealed && !nb[r][c].flagged) {
        let flagCount = 0;
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && nb[nr][nc].flagged)
              flagCount++;
          }
        if (flagCount >= nb[r][c].adjacent) {
          for (let dr = -1; dr <= 1; dr++)
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !nb[nr][nc].flagged) {
                if (nb[nr][nc].mine) {
                  revealAll(nb);
                  setGameOver(true);
                  return nb;
                }
                reveal(nb, nr, nc);
              }
            }
        }
        return nb;
      }

      if (nb[r][c].flagged) return nb;

      if (firstRef.current) {
        placeMines(nb, r, c);
        firstRef.current = false;
        setStarted(true);
      }

      if (nb[r][c].mine) {
        revealAll(nb);
        setGameOver(true);
        return nb;
      }

      reveal(nb, r, c);
      return nb;
    });
  }, [gameOver, won]);

  const handleRightClick = useCallback((e, r, c) => {
    e.preventDefault();
    if (gameOver || won) return;
    setBoard((prev) => {
      const nb = prev.map((row) => row.map((cell) => ({ ...cell })));
      if (nb[r][c].revealed) return nb;
      nb[r][c].flagged = !nb[r][c].flagged;
      return nb;
    });
  }, [gameOver, won]);

  const handleReset = () => {
    setBoard(createBoard());
    setGameOver(false);
    setWon(false);
    setStarted(false);
    setTime(0);
    firstRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const mineCount = MINES - board.flat().filter((c) => c.flagged).length;

  return (
    <div className="h-full flex flex-col items-center select-none" style={{ background: "var(--bg-root)" }}>
      <div className="flex items-center justify-between w-full px-4 py-2">
        <div className="flex items-center gap-2">
          <div
            className="text-lg font-bold tabular-nums"
            style={{ color: mineCount < 0 ? "#ef4444" : "var(--text-primary)", fontFamily: "var(--font-mono, monospace)" }}
          >
            {String(Math.max(0, mineCount)).padStart(3, "0")}
          </div>
          <button
            onClick={handleReset}
            className="text-lg px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
            title="New Game"
          >
            {gameOver ? "😵" : won ? "😎" : "🙂"}
          </button>
          <div
            className="text-lg font-bold tabular-nums"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono, monospace)" }}
          >
            {String(time).padStart(3, "0")}
          </div>
        </div>
        <button
          onClick={() => setFlagMode((f) => !f)}
          className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
            flagMode ? "bg-accent/20 text-accent" : "hover:bg-white/10"
          }`}
          style={{ color: flagMode ? undefined : "var(--text-muted)" }}
        >
          🚩 {flagMode ? "ON" : "OFF"}
        </button>
      </div>

      <div
        className="grid gap-[1px] p-2"
        style={{ gridTemplateColumns: `repeat(${COLS}, 28px)` }}
      >
        {board.flat().map((cell, i) => {
          const r = Math.floor(i / COLS);
          const c = i % COLS;
          const isMine = cell.mine && cell.revealed;
          const isFlag = cell.flagged && !cell.revealed;
          const isWrong = cell.flagged && !cell.mine && gameOver;
          const revealed = cell.revealed;
          const adj = cell.adjacent;

          let bg = "var(--bg-elevated)";
          if (revealed) bg = "var(--window-bg)";
          if (isMine) bg = "#ef4444";

          return (
            <button
              key={i}
              onClick={() => handleCell(r, c)}
              onContextMenu={(e) => handleRightClick(e, r, c)}
              className="flex items-center justify-center text-[11px] font-bold rounded-sm transition-all active:scale-90"
              style={{
                width: 28,
                height: 28,
                background: bg,
                border: revealed ? "1px solid var(--border)" : "1px solid rgba(255,255,255,0.06)",
                color: isMine ? "#fff" : isWrong ? "#ef4444" : numColors[adj] || "var(--text-primary)",
              }}
            >
              {isFlag && !gameOver && !won && "🚩"}
              {isWrong && "❌"}
              {isMine && "💣"}
              {revealed && !cell.mine && adj > 0 && adj}
              {revealed && !cell.mine && adj === 0 && ""}
            </button>
          );
        })}
      </div>

      {gameOver && (
        <div className="text-[10px] px-3 py-1 rounded-full mt-1" style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
          Game Over — click 🙂 to restart
        </div>
      )}

      {won && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div className="text-center p-6 rounded-2xl" style={{ background: "var(--window-bg)", border: "1px solid var(--border)" }}>
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>You Won!</div>
            <div className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              Cleared in {time}s
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
