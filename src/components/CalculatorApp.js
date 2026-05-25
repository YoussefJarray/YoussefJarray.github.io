"use client";
import { useState, useCallback, useEffect, useRef } from "react";

const ops = {
  "+": (a, b) => a + b,
  "−": (a, b) => a - b,
  "×": (a, b) => a * b,
  "÷": (a, b) => b === 0 ? NaN : a / b,
};

const sciOps = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  log: Math.log10,
  ln: Math.log,
  "√": Math.sqrt,
  "x²": (a) => a * a,
  "x³": (a) => a * a * a,
  "1/x": (a) => a === 0 ? NaN : 1 / a,
  "x!": (n) => { if (n < 0 || n > 170 || !Number.isInteger(n)) return NaN; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
};

export default function CalculatorApp() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState(null);
  const [op, setOp] = useState(null);
  const [resetNext, setResetNext] = useState(false);
  const [history, setHistory] = useState([]);
  const [showSci, setShowSci] = useState(false);
  const [angleMode, setAngleMode] = useState("deg");
  const displayRef = useRef(display);
  displayRef.current = display;

  useEffect(() => {
    const handle = (e) => {
      if (e.target.closest("[data-calc-btn]")) return;
      if (e.key >= "0" && e.key <= "9") handleDigit(e.key);
      if (["+", "-", "*", "/"].includes(e.key)) {
        const map = { "+": "+", "-": "−", "*": "×", "/": "÷" };
        handleOp(map[e.key]);
      }
      if (e.key === "Enter" || e.key === "=") handleEquals();
      if (e.key === "Backspace") handleBackspace();
      if (e.key === "Escape") handleClear();
      if (e.key === ".") handleDecimal();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  const handleDigit = (d) => {
    if (resetNext) { setDisplay(d); setResetNext(false); }
    else setDisplay((s) => (s === "0" ? d : s + d));
  };

  const handleDecimal = () => {
    if (resetNext) { setDisplay("0."); setResetNext(false); return; }
    setDisplay((s) => (s.includes(".") ? s : s + "."));
  };

  const handleOp = useCallback((nextOp) => {
    const cur = parseFloat(displayRef.current);
    if (op && !resetNext) {
      const result = ops[op](prev, cur);
      if (isNaN(result) || !isFinite(result)) { setDisplay("Error"); setPrev(null); setOp(null); setResetNext(true); return; }
      setHistory((h) => [...h.slice(-19), `${fmt(prev)} ${op} ${fmt(cur)} = ${fmt(result)}`]);
      setDisplay(fmt(result));
      setPrev(result);
    } else setPrev(cur);
    setOp(nextOp);
    setResetNext(true);
  }, [op, prev]);

  const handleEquals = useCallback(() => {
    if (!op) return;
    const cur = parseFloat(displayRef.current);
    const result = ops[op](prev, cur);
    if (isNaN(result) || !isFinite(result)) { setDisplay("Error"); setPrev(null); setOp(null); setResetNext(true); return; }
    setHistory((h) => [...h.slice(-19), `${fmt(prev)} ${op} ${fmt(cur)} = ${fmt(result)}`]);
    setDisplay(fmt(result));
    setPrev(null); setOp(null); setResetNext(true);
  }, [op, prev]);

  const handleClear = () => { setDisplay("0"); setPrev(null); setOp(null); setResetNext(false); };
  const handleBackspace = () => { if (resetNext) { handleClear(); return; } setDisplay((s) => (s.length > 1 ? s.slice(0, -1) : "0")); };
  const handlePercent = () => { setDisplay(fmt(parseFloat(displayRef.current) / 100)); setResetNext(true); };
  const handleNegate = () => { setDisplay((s) => (s !== "0" ? (s.startsWith("-") ? s.slice(1) : "-" + s) : s)); };

  const handleSci = useCallback((name) => {
    const fn = sciOps[name];
    if (!fn) return;
    const cur = parseFloat(displayRef.current);
    let arg = cur;
    if (angleMode === "deg" && ["sin", "cos", "tan"].includes(name)) arg = cur * Math.PI / 180;
    const result = fn(arg);
    if (isNaN(result) || !isFinite(result)) { setDisplay("Error"); setResetNext(true); return; }
    setHistory((h) => [...h.slice(-19), `${name}(${fmt(cur)}) = ${fmt(result)}`]);
    setDisplay(fmt(result));
    setResetNext(true);
  }, [angleMode]);

  const handleConst = (val) => { setDisplay(fmt(val)); setResetNext(true); };

  const sciRows = [
    ["sin", "cos", "tan", "log"],
    ["ln", "√", "x²", "x³"],
    ["1/x", "x!", "π", "e"],
  ];

  const basicRows = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "−"],
    ["1", "2", "3", "+"],
    ["0", ".", "⌫", "="],
  ];

  return (
    <div className="h-full flex flex-col select-none overflow-hidden" style={{ background: "var(--bg-root)" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1 shrink-0">
        <div className="flex gap-1">
          <button onClick={() => setShowSci((s) => !s)}
            className="text-[9px] px-2 py-1 rounded transition-all hover:bg-white/10"
            style={{ color: showSci ? "var(--accent)" : "var(--text-muted)" }}
          >
            {showSci ? "Basic" : "Sci"}
          </button>
          <button onClick={() => setAngleMode((m) => (m === "deg" ? "rad" : "deg"))}
            className="text-[8px] px-1.5 py-1 rounded hover:bg-white/10"
            style={{ color: "var(--text-muted)", fontFamily: "monospace", opacity: showSci ? 1 : 0.3 }}
          >
            {angleMode.toUpperCase()}
          </button>
        </div>
        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>
          {op ? `${fmt(prev ?? 0)} ${op}` : "\u00a0"}
        </span>
      </div>

      {/* Display */}
      <div className="px-4 py-2 text-right overflow-hidden shrink-0">
        <div className="text-3xl font-light tracking-tight truncate"
          style={{ color: "var(--text-primary)", fontFamily: "monospace" }}
        >
          {display}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 pt-0">
        {/* Scientific */}
        {showSci && (
          <div className="mb-[2px]">
            {sciRows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-4 gap-[2px] mb-[2px]">
                {row.map((k) => (
                  <button key={k} data-calc-btn
                    className="flex items-center justify-center text-[10px] font-medium rounded-lg transition-all active:scale-90 hover:brightness-110"
                    style={{ height: 34, background: "var(--bg-elevated)", color: "var(--accent)", border: "1px solid var(--border)" }}
                    onClick={() => { if (k === "π" || k === "e") handleConst(k === "π" ? Math.PI : Math.E); else handleSci(k); }}
                  >{k}</button>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Basic */}
        <div className="grid grid-cols-4 gap-[2px]">
          {basicRows.flat().map((k, i) => {
            const isOp = ["+", "−", "×", "÷"].includes(k);
            const isEq = k === "=";
            const isClr = k === "C";
            return (
              <button key={i} data-calc-btn
                className="flex items-center justify-center text-sm font-medium rounded-xl transition-all active:scale-90 hover:brightness-110"
                style={{
                  height: 48,
                  background: isEq ? "var(--accent)" : isOp || isClr ? "var(--bg-elevated)" : "var(--window-bg)",
                  color: isEq ? "#fff" : isOp || isClr ? "var(--accent)" : "var(--text-primary)",
                  border: k === "⌫" ? "1px solid var(--border)" : "none",
                }}
                onClick={() => {
                  if (k === "C") handleClear();
                  else if (k === "±") handleNegate();
                  else if (k === "%") handlePercent();
                  else if (k === "⌫") handleBackspace();
                  else if (k === "=") handleEquals();
                  else if (isOp) handleOp(k);
                  else if (k === ".") handleDecimal();
                  else handleDigit(k);
                }}
              >{k === "⌫" ? "⌫" : k}</button>
            );
          })}
        </div>
      </div>

      {/* History slide-up */}
      {history.length > 0 && (
        <div className="shrink-0 border-t border-white/5 px-3 py-1.5"
          style={{ background: "var(--bg-elevated)" }}>
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            {history.slice(-5).map((entry, i) => (
              <button key={i}
                className="text-[9px] px-2 py-0.5 rounded whitespace-nowrap hover:bg-white/10 shrink-0"
                style={{ color: "var(--text-muted)", fontFamily: "monospace" }}
                onClick={() => { const p = entry.split(" = "); if (p[1]) setDisplay(p[1]); }}
              >{entry}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function fmt(n) {
  if (typeof n !== "number" || isNaN(n)) return "0";
  return String(parseFloat(n.toFixed(10)));
}
