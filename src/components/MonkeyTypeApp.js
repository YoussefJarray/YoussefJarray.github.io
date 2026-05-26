"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useThemeStore } from "../store/themeStore";

const WORDS = [
  "the","be","to","of","and","a","in","that","have","it","for","not","on","with","he","as","you","do","at","this",
  "but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their",
  "what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just",
  "him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now",
  "look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way",
  "even","new","want","because","any","these","give","day","most","us","great","between","need","large","often",
  "under","different","around","point","place","small","number","through","long","hand","house","water","group",
  "country","world","state","family","school","student","problem","example","every","program","start","right",
  "order","high","follow","system","things","question","government","night","home","room","area","money","story",
  "fact","month","lot","study","book","eye","job","word","business","issue","side","kind","head","service","friend",
  "father","power","hour","game","line","end","member","law","car","city","community","name","president","team",
  "minute","idea","kid","body","information","parent","face","others","level","office","door","health","person",
  "art","war","history","party","result","change","morning","reason","research","girl","guy","moment","air",
  "teacher","force","education","nature","truth","bring","support","explain","develop","language","human",
  "computer","software","create","design","build","simple","complex","random","unique","swift","quiet","brave",
  "calm","eager","fierce","gentle","happy","keen","loyal","proud","sharp","sound","fresh","alive","clean","clear",
  "close","deep","direct","early","empty","equal","false","final","fixed","full","heavy","light","loose","loud",
  "major","minor","mixed","modern","narrow","native","natural","normal","novel","open","organic","original","past",
  "patient","physical","poor","popular","positive","primary","private","proper","public","pure","quick","rapid",
  "rare","raw","ready","real","rich","rigid","rough","royal","rural","safe","scared","secondary","secret","secure",
  "senior","serious","shallow","short","silent","single","skilled","slight","slow","smooth","social","soft","solid",
  "sudden","suitable","sweet","tactical","talented","tall","technical","temporary","tender","thick","thin",
  "thorough","tight","tiny","total","tough","true","typical","upper","urban","usual","valuable","various","vast",
  "vital","vivid","warm","wealthy","weak","welcome","western","wild","willing","wise","working","worried","wrong",
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateWords(count) {
  return shuffle(WORDS).slice(0, count);
}

function AccentBar({ correct, total }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 100;
  return (
    <div style={{ width: "100%", height: 3, borderRadius: 99, background: "var(--bg-surface)", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent)", transition: "width 0.3s" }} />
    </div>
  );
}

function StatBlock({ value, label, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1, color: color || "var(--accent)", fontFamily: "monospace" }}>{value}</div>
      <div style={{ fontSize: 10, marginTop: 2, textTransform: "uppercase", letterSpacing: 3, color: "var(--text-secondary)", fontFamily: "monospace" }}>{label}</div>
    </div>
  );
}

export default function MonkeyTypeApp({ id }) {
  const themeMode = useThemeStore((s) => s.mode);

  const [isMaximized, setIsMaximized] = useState(false);
  useEffect(() => {
    try {
      const { useWindowStore } = require("../store/windowStore");
      const unsub = useWindowStore.subscribe((state) => {
        setIsMaximized(!!state.windows?.[id]?.isMaximized);
      });
      setIsMaximized(!!useWindowStore.getState().windows?.[id]?.isMaximized);
      return unsub;
    } catch {}
  }, [id]);

  const [words, setWords] = useState(() => generateWords(60));
  const [wordIdx, setWordIdx] = useState(0);
  const [typedWords, setTypedWords] = useState([]);
  const [currentInput, setCurrentInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [mode, setMode] = useState("15");
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const getTotalTyped = useCallback((tw, cur) => {
    return tw.reduce((s, w) => s + (w ? w.length : 0), 0) + cur.length;
  }, []);

  const getCorrectWords = useCallback((tw, ws) => {
    return tw.filter((w, i) => w != null && w === ws[i]).length;
  }, []);

  const getCorrectChars = useCallback((tw, ws) => {
    return tw.reduce((s, w, i) => s + (w != null && w === ws[i] ? w.length : 0), 0);
  }, []);

  const getIncorrectWords = useCallback((tw, ws) => {
    return tw.filter((w, i) => w != null && w !== ws[i]).length;
  }, []);

  const reset = useCallback(() => {
    clearTimeout(timerRef.current);
    setWords(generateWords(60));
    setWordIdx(0);
    setTypedWords([]);
    setCurrentInput("");
    setStartTime(null);
    setEndTime(null);
    setRunning(false);
  }, []);

  const startTimer = useCallback((modeStr) => {
    const secs = parseInt(modeStr || mode);
    setRunning(true);
    const t0 = Date.now();
    setStartTime(t0);
    timerRef.current = setTimeout(() => {
      setEndTime(Date.now());
      setRunning(false);
    }, secs * 1000);
  }, [mode]);

  const handleKey = useCallback((e) => {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (endTime) return;

    if (e.key === " ") {
      e.preventDefault();
      if (currentInput.length === 0) return;

      if (!startTime && !running) startTimer();

      setTypedWords((prev) => {
        const next = [...prev];
        next[wordIdx] = currentInput;
        return next;
      });
      setWordIdx((w) => w + 1);
      setCurrentInput("");
      return;
    }

    if (e.key === "Backspace") {
      e.preventDefault();
      if (currentInput.length > 0) {
        setCurrentInput((c) => c.slice(0, -1));
      } else if (wordIdx > 0) {
        const prevTyped = typedWords[wordIdx - 1] ?? "";
        setTypedWords((prev) => {
          const next = [...prev];
          next[wordIdx - 1] = undefined;
          return next;
        });
        setCurrentInput(prevTyped);
        setWordIdx((w) => w - 1);
      }
      return;
    }

    if (e.key.length !== 1) return;

    if (!startTime && !running) startTimer();

    if (currentInput.length >= words[wordIdx].length + 8) return;

    setCurrentInput((c) => c + e.key);
  }, [currentInput, wordIdx, words, typedWords, startTime, running, endTime, startTimer]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = endTime
    ? (endTime - (startTime || endTime)) / 1000
    : startTime
    ? (now - startTime) / 1000
    : 0;

  const totalChars = getTotalTyped(typedWords, currentInput);
  const correctChars = getCorrectChars(typedWords, words);
  const incorrectWords = getIncorrectWords(typedWords, words);
  const wpm = elapsed > 0 ? Math.round((correctChars / 5) / (elapsed / 60)) : 0;
  const totalAttempted = typedWords.length;
  const accuracy = totalAttempted > 0
    ? Math.round(((totalAttempted - incorrectWords) / totalAttempted) * 100)
    : 100;
  const remaining = Math.max(0, parseInt(mode) - Math.floor(elapsed));

  const isLight = themeMode === "light";
  const untypedColor = isLight ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const futureColor = isLight ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)";
  const cursorInvertColor = "var(--bg-root)";
  const accentColor = "#4ecca3";

  const renderWords = (fontSize = 20) => (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem 0.35rem",
        fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
        fontSize,
        fontWeight: 600,
        lineHeight: 1.8,
        userSelect: "none",
      }}
    >
      {words.map((word, wi) => {
        const isDone = wi < wordIdx;
        const isCurrent = wi === wordIdx;
        const typed = isDone ? (typedWords[wi] ?? "") : isCurrent ? currentInput : "";

        const chars = word.split("").map((ch, ci) => {
          let color;
          let bgColor;

          if (isCurrent) {
            if (ci < typed.length) {
              color = typed[ci] === ch ? accentColor : "#ef4444";
            } else if (ci === typed.length) {
              color = cursorInvertColor;
              bgColor = accentColor;
            } else {
              color = untypedColor;
            }
          } else if (isDone) {
            if (ci < typed.length) {
              color = typed[ci] === ch ? accentColor : "#ef4444";
            } else {
              color = "#ef4444";
            }
          } else {
            color = futureColor;
          }

          return (
            <span
              key={ci}
              style={{
                color,
                background: bgColor || "transparent",
                borderRadius: bgColor ? 2 : 0,
                padding: bgColor ? "0 1px" : 0,
                transition: "color 0.05s",
              }}
            >
              {ch}
            </span>
          );
        });

        const overflowChars = [];
        if (isCurrent && typed.length > word.length) {
          for (let oi = word.length; oi < typed.length; oi++) {
            overflowChars.push(
              <span key={`ov-${oi}`} style={{ color: "#ef4444" }}>
                {typed[oi]}
              </span>
            );
          }
        }

        const cursorAfterWord = isCurrent && typed.length === word.length && (
          <span
            key="cursor-end"
            style={{
              display: "inline-block",
              width: 2,
              height: "1em",
              background: accentColor,
              borderRadius: 1,
              verticalAlign: "text-bottom",
              marginLeft: 1,
              animation: "blink 1s step-end infinite",
            }}
          />
        );

        return (
          <span
            key={wi}
            style={{
              position: "relative",
              opacity: isCurrent || isDone ? 1 : 0.65,
              transition: "opacity 0.1s",
            }}
          >
            {chars}
            {overflowChars}
            {cursorAfterWord}
          </span>
        );
      })}

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );

  if (endTime) {
    const correctCount = getCorrectWords(typedWords, words);
    const wrongCount = incorrectWords;
    const accColor = accuracy >= 95 ? accentColor : accuracy >= 80 ? "#f59e0b" : "#ef4444";

    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: isMaximized ? 28 : 18,
          padding: isMaximized ? 32 : 20,
          background: "var(--bg-root)",
          fontFamily: "'Fira Code', monospace",
        }}
      >
        <div style={{ display: "flex", gap: isMaximized ? 48 : 28, alignItems: "center" }}>
          <StatBlock value={wpm} label="wpm" />
          <div style={{ width: 1, height: 40, background: "var(--border)" }} />
          <StatBlock value={`${accuracy}%`} label="accuracy" color={accColor} />
          <div style={{ width: 1, height: 40, background: "var(--border)" }} />
          <StatBlock value={mode} label="seconds" color="var(--text-secondary)" />
        </div>

        <div
          style={{
            display: "flex",
            gap: 20,
            fontSize: 11,
            color: "var(--text-secondary)",
            fontFamily: "'Fira Code', monospace",
            letterSpacing: 1,
          }}
        >
          <span><span style={{ color: accentColor }}>{correctCount}</span> correct</span>
          <span><span style={{ color: "#ef4444" }}>{wrongCount}</span> incorrect</span>
          <span><span style={{ color: "var(--text-primary)" }}>{typedWords.length}</span> words</span>
        </div>

        <div style={{ width: isMaximized ? 280 : 200, marginTop: 4 }}>
          <AccentBar correct={correctCount} total={typedWords.length} />
        </div>

        <button
          onClick={reset}
          style={{
            marginTop: 8,
            padding: isMaximized ? "10px 28px" : "7px 20px",
            borderRadius: 8,
            border: "none",
            background: accentColor,
            color: "#111",
            fontFamily: "'Fira Code', monospace",
            fontWeight: 700,
            fontSize: isMaximized ? 14 : 12,
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          restart
        </button>
      </div>
    );
  }

  const modeBarEl = (
    <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
      {["15", "30", "60"].map((m) => (
        <button
          key={m}
          onClick={() => {
            if (!running) {
              setMode(m);
              reset();
            }
          }}
          style={{
            fontSize: 11,
            padding: "4px 10px",
            borderRadius: 6,
            border: "none",
            cursor: running ? "default" : "pointer",
            background: mode === m ? "rgba(78,204,163,0.15)" : "transparent",
            color: mode === m ? accentColor : "var(--text-secondary)",
            fontWeight: mode === m ? 700 : 400,
            fontFamily: "'Fira Code', monospace",
            letterSpacing: 1,
            opacity: running ? 0.5 : 1,
            transition: "all 0.15s",
          }}
        >
          {m}s
        </button>
      ))}
    </div>
  );

  const liveStatsEl = startTime && (
    <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 11, fontFamily: "'Fira Code', monospace" }}>
      <span style={{ color: accentColor, fontWeight: 700 }}>
        {wpm}<span style={{ color: "var(--text-secondary)", fontWeight: 400 }}> wpm</span>
      </span>
      <span style={{ color: accuracy >= 95 ? accentColor : "#f59e0b" }}>{accuracy}%</span>
      <span
        style={{
          color: remaining <= 5 ? "#ef4444" : "var(--text-secondary)",
          fontWeight: remaining <= 5 ? 700 : 400,
          transition: "color 0.3s",
        }}
      >
        {remaining}s
      </span>
    </div>
  );

  const restartBtn = (
    <button
      onClick={reset}
      style={{
        fontSize: 11,
        padding: "4px 10px",
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: "transparent",
        color: "var(--text-secondary)",
        fontFamily: "'Fira Code', monospace",
        cursor: "pointer",
        letterSpacing: 1,
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.target.style.color = "var(--text-primary)";
        e.target.style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        e.target.style.color = "var(--text-secondary)";
        e.target.style.borderColor = "var(--border)";
      }}
    >
      restart
    </button>
  );

  const sharedStyles = {
    background: "var(--bg-root)",
    fontFamily: "'Fira Code', monospace",
  };

  if (isMaximized) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          ...sharedStyles,
          padding: "24px 28px",
          gap: 24,
        }}
      >
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {modeBarEl}
            {restartBtn}
          </div>

          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            {renderWords(22)}
          </div>

          <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace", letterSpacing: 1 }}>
            {!startTime ? "start typing to begin" : ""}
          </div>
        </div>

        <div
          style={{
            width: 120,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
            paddingLeft: 24,
            borderLeft: "1px solid var(--border)",
          }}
        >
          {startTime && (
            <>
              <StatBlock value={wpm} label="wpm" />
              <StatBlock
                value={`${accuracy}%`}
                label="acc"
                color={accuracy >= 95 ? accentColor : "#f59e0b"}
              />
              <StatBlock
                value={remaining}
                label="time"
                color={remaining <= 5 ? "#ef4444" : "var(--text-secondary)"}
              />
              <AccentBar correct={getCorrectWords(typedWords, words)} total={Math.max(typedWords.length, 1)} />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...sharedStyles,
        padding: "12px 14px",
        gap: 10,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        {modeBarEl}
        {liveStatsEl}
      </div>

      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {renderWords(18)}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace", letterSpacing: 1 }}>
          {!startTime ? "start typing" : ""}
        </span>
        {restartBtn}
      </div>
    </div>
  );
}
