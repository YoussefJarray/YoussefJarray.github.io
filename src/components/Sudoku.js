"use client";
import { useState, useEffect, useCallback, useMemo } from "react";

// ── Puzzle generation ──────────────────────────────────────────────────────────

function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function generateFull() {
  const g = Array(81).fill(0);
  const rows = Array.from({ length: 9 }, () => new Set());
  const cols = Array.from({ length: 9 }, () => new Set());
  const boxs = Array.from({ length: 9 }, () => new Set());

  function fill(i) {
    if (i === 81) return true;
    const r = Math.floor(i / 9), c = i % 9;
    const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    for (const n of shuffle([1,2,3,4,5,6,7,8,9])) {
      if (!rows[r].has(n) && !cols[c].has(n) && !boxs[b].has(n)) {
        g[i] = n; rows[r].add(n); cols[c].add(n); boxs[b].add(n);
        if (fill(i + 1)) return true;
        g[i] = 0; rows[r].delete(n); cols[c].delete(n); boxs[b].delete(n);
      }
    }
    return false;
  }
  fill(0);
  return g;
}

function countSolutions(g, limit = 2) {
  let count = 0;
  const grid = [...g];
  function solve(i) {
    if (count >= limit) return;
    if (i === 81) { count++; return; }
    if (grid[i] !== 0) { solve(i + 1); return; }
    const r = Math.floor(i / 9), c = i % 9;
    const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    for (let n = 1; n <= 9; n++) {
      let ok = true;
      for (let k = 0; k < 9; k++) {
        if (grid[r * 9 + k] === n || grid[k * 9 + c] === n) { ok = false; break; }
      }
      if (ok) {
        const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
        outer: for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) {
          if (grid[(br + dr) * 9 + (bc + dc)] === n) { ok = false; break outer; }
        }
      }
      if (ok) { grid[i] = n; solve(i + 1); grid[i] = 0; }
    }
  }
  solve(0);
  return count;
}

function makePuzzle(clues) {
  const sol = generateFull();
  const puz = [...sol];
  const indices = shuffle([...Array(81).keys()]);
  let removed = 0;
  for (const idx of indices) {
    if (81 - removed <= clues) break;
    const v = puz[idx];
    puz[idx] = 0;
    if (countSolutions(puz, 2) !== 1) puz[idx] = v;
    else removed++;
  }
  return { puzzle: puz, solution: sol };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const row = (i) => Math.floor(i / 9);
const col = (i) => i % 9;
const box = (i) => Math.floor(row(i) / 3) * 3 + Math.floor(col(i) / 3);

function getPeers(i) {
  const s = new Set();
  const r = row(i), c = col(i), b = box(i);
  for (let k = 0; k < 9; k++) { s.add(r * 9 + k); s.add(k * 9 + c); }
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) s.add((br + dr) * 9 + (bc + dc));
  s.delete(i);
  return s;
}

const DIFFICULTIES = { Easy: 36, Medium: 45, Hard: 55 };

// ── Component ──────────────────────────────────────────────────────────────────

export default function Sudoku() {
  const [difficulty, setDifficulty] = useState("Medium");
  const [board, setBoard] = useState([]);
  const [given, setGiven] = useState([]);
  const [solution, setSolution] = useState([]);
  const [notes, setNotes] = useState([]); // Array<Set<number>>
  const [selected, setSelected] = useState(null);
  const [notesMode, setNotesMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [won, setWon] = useState(false);
  const [generating, setGenerating] = useState(true);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const startGame = useCallback((diff = difficulty) => {
    setGenerating(true);
    setWon(false);
    setSelected(null);
    setNotesMode(false);
    setHistory([]);
    setTimer(0);
    setTimerActive(false);
    setTimeout(() => {
      const { puzzle, solution: sol } = makePuzzle(81 - DIFFICULTIES[diff]);
      setBoard([...puzzle]);
      setGiven(puzzle.map((v) => v !== 0));
      setSolution(sol);
      setNotes(Array.from({ length: 81 }, () => new Set()));
      setGenerating(false);
      setTimerActive(true);
    }, 10);
  }, [difficulty]);

  useEffect(() => { startGame(); }, []);

  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // conflict detection
  const conflicts = useMemo(() => {
    const c = new Set();
    for (let i = 0; i < 81; i++) {
      if (board[i] === 0) continue;
      for (const p of getPeers(i)) {
        if (board[p] === board[i]) { c.add(i); c.add(p); }
      }
    }
    return c;
  }, [board]);

  // digit counts
  const counts = useMemo(() => {
    const c = Array(10).fill(0);
    for (const v of board) if (v) c[v]++;
    return c;
  }, [board]);

  const selVal = selected !== null ? board[selected] : 0;
  const selPeers = useMemo(() => selected !== null ? getPeers(selected) : new Set(), [selected]);

  const pushHistory = (b, n) => {
    setHistory((h) => [...h, { board: [...b], notes: n.map((s) => new Set(s)) }]);
  };

  const inputNum = useCallback((n) => {
    if (selected === null || given[selected] || won) return;
    if (notesMode && board[selected] === 0) {
      pushHistory(board, notes);
      setNotes((prev) => {
        const next = prev.map((s) => new Set(s));
        next[selected].has(n) ? next[selected].delete(n) : next[selected].add(n);
        return next;
      });
      return;
    }
    pushHistory(board, notes);
    const newBoard = [...board];
    newBoard[selected] = newBoard[selected] === n ? 0 : n;
    // clear notes for this cell and remove from peers
    const newNotes = notes.map((s) => new Set(s));
    newNotes[selected].clear();
    for (const p of getPeers(selected)) newNotes[p].delete(n);
    setBoard(newBoard);
    setNotes(newNotes);
    if (newBoard.every((v, i) => v === solution[i])) {
      setWon(true);
      setTimerActive(false);
    }
  }, [selected, given, won, notesMode, board, notes, solution]);

  const erase = useCallback(() => {
    if (selected === null || given[selected] || won) return;
    pushHistory(board, notes);
    const newBoard = [...board];
    newBoard[selected] = 0;
    const newNotes = notes.map((s) => new Set(s));
    newNotes[selected].clear();
    setBoard(newBoard);
    setNotes(newNotes);
  }, [selected, given, won, board, notes]);

  const undo = useCallback(() => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setBoard(prev.board);
    setNotes(prev.notes);
  }, [history]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key >= "1" && e.key <= "9") { inputNum(parseInt(e.key)); return; }
      if (e.key === "Backspace" || e.key === "Delete") { erase(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); return; }
      if (e.key === "n") { setNotesMode((m) => !m); return; }
      if (selected === null) return;
      const moves = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 };
      if (moves[e.key] !== undefined) {
        e.preventDefault();
        setSelected((s) => {
          const next = s + moves[e.key];
          if (next < 0 || next > 80) return s;
          if ((e.key === "ArrowLeft" && col(s) === 0) || (e.key === "ArrowRight" && col(s) === 8)) return s;
          return next;
        });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [inputNum, erase, undo, selected]);

  const btnBase = {
    padding: "6px 10px", borderRadius: 8, border: "1.5px solid #3a3a3a",
    background: "#1a1a1a", color: "#e0e0e0", cursor: "pointer",
    fontSize: 13, display: "flex", alignItems: "center", gap: 4,
  };

  if (generating) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, fontFamily: "'IBM Plex Mono', monospace", color: "#888", fontSize: 14 }}>
      generating…
    </div>
  );

  return (
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace",
      background: "#111",
      color: "#e0e0e0",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 12px",
      gap: 16,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", maxWidth: 420 }}>
        <span style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase" }}>Sudoku</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 13, color: "#888", fontVariantNumeric: "tabular-nums" }}>{formatTime(timer)}</span>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 420, flexWrap: "wrap" }}>
        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); startGame(e.target.value); }}
          style={{ ...btnBase, flex: 1, minWidth: 80 }}
        >
          {Object.keys(DIFFICULTIES).map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <button onClick={() => startGame(difficulty)} style={btnBase}>↺ New</button>
        <button
          onClick={() => setNotesMode((m) => !m)}
          style={{ ...btnBase, borderColor: notesMode ? "#6ee7b7" : "#3a3a3a", color: notesMode ? "#6ee7b7" : "#e0e0e0" }}
          title="Toggle notes (N)"
        >✎ Notes</button>
        <button onClick={erase} style={btnBase} title="Erase (Del)">⌫</button>
        <button onClick={undo} disabled={!history.length} title="Undo (Ctrl+Z)"
          style={{ ...btnBase, opacity: history.length ? 1 : 0.35 }}>↩ Undo</button>
      </div>

      {/* Board */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(9, 1fr)",
        width: "100%",
        maxWidth: 420,
        border: "2px solid #555",
        borderRadius: 6,
        overflow: "hidden",
      }}>
        {board.map((v, i) => {
          const isGiven = given[i];
          const isSelected = i === selected;
          const isPeer = selPeers.has(i);
          const isSameNum = selVal !== 0 && board[i] === selVal && i !== selected;
          const isConflict = conflicts.has(i);
          const isComplete = counts[v] >= 9 && v !== 0 && !isConflict;
          const r = row(i), c = col(i);

          let bg = "#111";
          if (isSelected) bg = "#1e3a2f";
          else if (isSameNum) bg = "#1a2e3a";
          else if (isPeer) bg = "#181818";

          let color = "#e0e0e0";
          if (!isGiven) {
            if (isConflict) color = "#f87171";
            else if (isComplete) color = "#4ade80";
            else color = "#60a5fa";
          }

          const borderR = (c === 2 || c === 5) ? "2px solid #555" : "0.5px solid #2a2a2a";
          const borderB = (r === 2 || r === 5) ? "2px solid #555" : "0.5px solid #2a2a2a";

          const hasNotes = notes[i] && notes[i].size > 0 && v === 0;

          return (
            <div
              key={i}
              onClick={() => setSelected(i)}
              style={{
                aspectRatio: "1",
                background: bg,
                borderRight: borderR,
                borderBottom: borderB,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: hasNotes ? 0 : "clamp(13px, 3.5vw, 20px)",
                fontWeight: isGiven ? 600 : 400,
                color,
                position: "relative",
                transition: "background 0.08s",
                userSelect: "none",
              }}
            >
              {v !== 0 && !hasNotes && v}
              {hasNotes && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                  inset: 0,
                  padding: 2,
                  boxSizing: "border-box",
                }}>
                  {[1,2,3,4,5,6,7,8,9].map((n) => (
                    <div key={n} style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "clamp(6px, 1.2vw, 9px)",
                      color: notes[i].has(n) ? "#93c5fd" : "transparent",
                      lineHeight: 1,
                    }}>{n}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Number pad */}
      <div style={{ display: "flex", gap: 6, width: "100%", maxWidth: 420, justifyContent: "center" }}>
        {[1,2,3,4,5,6,7,8,9].map((n) => {
          const done = counts[n] >= 9;
          const isSelNum = selVal === n;
          return (
            <button
              key={n}
              onClick={() => inputNum(n)}
              disabled={done}
              style={{
                flex: 1,
                aspectRatio: "1",
                maxWidth: 42,
                border: isSelNum ? "1.5px solid #60a5fa" : "1.5px solid #2a2a2a",
                borderRadius: 8,
                background: isSelNum ? "#0f2a3d" : "#161616",
                color: done ? "#333" : isSelNum ? "#60a5fa" : "#e0e0e0",
                fontSize: 17,
                fontWeight: 500,
                cursor: done ? "default" : "pointer",
                fontFamily: "inherit",
                position: "relative",
                transition: "all 0.1s",
              }}
            >
              {n}
              {!done && (
                <span style={{
                  position: "absolute", top: 2, right: 4,
                  fontSize: 8, color: "#555", fontWeight: 400,
                }}>{9 - counts[n]}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Win banner */}
      {won && (
        <div style={{
          padding: "12px 24px",
          borderRadius: 10,
          background: "#052e16",
          border: "1.5px solid #166534",
          color: "#4ade80",
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: 1,
        }}>
          ✓ Solved in {formatTime(timer)}
        </div>
      )}
    </div>
  );
}