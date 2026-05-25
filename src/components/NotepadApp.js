"use client";
import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "portfolio-notepad";

export default function NotepadApp() {
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [findText, setFindText] = useState("");
  const [showFind, setShowFind] = useState(false);
  const [matchCount, setMatchCount] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setText(stored);
  }, []);

  useEffect(() => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    setCharCount(text.length);
  }, [text]);

  useEffect(() => {
    if (!findText.trim()) { setMatchCount(0); return; }
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = text.match(regex);
    setMatchCount(matches ? matches.length : 0);
  }, [findText, text]);

  const handleChange = (e) => {
    setText(e.target.value);
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, text);
    setSaved(true);
  };

  const handleClear = () => {
    if (text && !confirm("Clear all text?")) return;
    setText("");
    setSaved(false);
  };

  const handleExport = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      setShowFind((s) => !s);
    }
  };

  const scrollToMatch = (direction) => {
    if (!findText.trim() || !textareaRef.current) return;
    const ta = textareaRef.current;
    const idx = direction === "next"
      ? ta.value.toLowerCase().indexOf(findText.toLowerCase(), ta.selectionStart + 1)
      : ta.value.toLowerCase().lastIndexOf(findText.toLowerCase(), ta.selectionStart - 1);
    if (idx !== -1) {
      ta.focus();
      ta.setSelectionRange(idx, idx + findText.length);
      ta.scrollTop = ta.scrollTop;
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg-root)" }}>
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b text-[10px]"
        style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={handleSave}
            className="px-2 py-0.5 rounded hover:bg-white/10 transition-all flex items-center gap-1"
            style={{ color: saved ? "var(--text-muted)" : "var(--accent)" }}
          >
            {saved ? "Saved" : "Save"}
          </button>
          <span className="text-muted">|</span>
          <button onClick={handleClear} className="px-2 py-0.5 rounded hover:bg-white/10 transition-all" style={{ color: "var(--text-muted)" }}>Clear</button>
          <span className="text-muted">|</span>
          <button onClick={handleExport} className="px-2 py-0.5 rounded hover:bg-white/10 transition-all" style={{ color: "var(--text-muted)" }}>Export</button>
          <span className="text-muted">|</span>
          <button
            onClick={() => setShowFind((s) => !s)}
            className={`px-2 py-0.5 rounded hover:bg-white/10 transition-all ${showFind ? "bg-accent/15" : ""}`}
            style={{ color: showFind ? "var(--accent)" : "var(--text-muted)" }}
          >
            Find
          </button>
        </div>
        <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {showFind && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 border-b text-[10px]"
          style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
        >
          <input
            type="text"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            placeholder="Find..."
            className="flex-1 bg-transparent outline-none px-2 py-0.5 rounded border text-[10px]"
            style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
            autoFocus
          />
          <button onClick={() => scrollToMatch("prev")} className="px-1.5 py-0.5 rounded hover:bg-white/10" style={{ color: "var(--text-muted)" }}>▲</button>
          <button onClick={() => scrollToMatch("next")} className="px-1.5 py-0.5 rounded hover:bg-white/10" style={{ color: "var(--text-muted)" }}>▼</button>
          <span style={{ color: "var(--text-muted)" }}>{matchCount} matches</span>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Start typing..."
        className="flex-1 resize-none outline-none p-4 text-sm leading-relaxed"
        style={{
          background: "transparent",
          color: "var(--text-primary)",
          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
        }}
        spellCheck={false}
      />

      <div
        className="flex items-center justify-between px-3 py-1 border-t text-[9px]"
        style={{ borderColor: "var(--border)", background: "var(--bg-elevated)", color: "var(--text-muted)" }}
      >
        <span>Ctrl+S to save</span>
        <span>Ctrl+F to find</span>
      </div>
    </div>
  );
}
