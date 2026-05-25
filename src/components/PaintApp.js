"use client";
import { useState, useRef, useEffect, useCallback, useReducer } from "react";

const CANVAS_W = 800;
const CANVAS_H = 520;
const MAX_HISTORY = 30;

const PALETTE = [
  "#000000","#1a1a1a","#404040","#737373","#a3a3a3","#d4d4d4","#f5f5f5","#ffffff",
  "#ef4444","#f97316","#eab308","#84cc16","#22c55e","#14b8a6","#3b82f6","#8b5cf6",
  "#ec4899","#f43f5e","#fb923c","#fbbf24","#a3e635","#4ade80","#2dd4bf","#60a5fa",
  "#a78bfa","#f472b6","#fda4af","#fed7aa","#fef08a","#bbf7d0","#99f6e4","#bfdbfe",
];

const TOOLS = [
  { id: "brush",   label: "Brush",    key: "b", icon: "✏️" },
  { id: "pencil",  label: "Pencil",   key: "p", icon: "🖊" },
  { id: "eraser",  label: "Eraser",   key: "e", icon: "⬜" },
  { id: "fill",    label: "Fill",     key: "g", icon: "🪣" },
  { id: "picker",  label: "Eyedrop",  key: "i", icon: "💉" },
  { id: "line",    label: "Line",     key: "l", icon: "╱" },
  { id: "rect",    label: "Rect",     key: "r", icon: "▭" },
  { id: "rectfill",label: "Rect Fill",key: "R", icon: "▬" },
  { id: "circle",  label: "Ellipse",  key: "o", icon: "○" },
  { id: "circlefill",label:"Ellipse Fill",key:"O", icon: "●" },
  { id: "text",    label: "Text",     key: "t", icon: "T" },
];

function hexToRgb(hex) {
  const v = parseInt(hex.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

function floodFill(ctx, startX, startY, fillColor, w, h) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const idx = (startY * w + startX) * 4;
  const tR = data[idx], tG = data[idx + 1], tB = data[idx + 2], tA = data[idx + 3];
  const [fR, fG, fB] = hexToRgb(fillColor);
  if (tR === fR && tG === fG && tB === fB) return;
  const TOL = 20;
  const visited = new Uint8Array(w * h);
  const stack = [startX + startY * w];
  while (stack.length) {
    const pos = stack.pop();
    const x = pos % w, y = (pos / w) | 0;
    if (x < 0 || x >= w || y < 0 || y >= h || visited[pos]) continue;
    const i = pos * 4;
    if (
      Math.abs(data[i] - tR) > TOL ||
      Math.abs(data[i + 1] - tG) > TOL ||
      Math.abs(data[i + 2] - tB) > TOL ||
      Math.abs(data[i + 3] - tA) > TOL
    ) continue;
    visited[pos] = 1;
    data[i] = fR; data[i + 1] = fG; data[i + 2] = fB; data[i + 3] = 255;
    stack.push(pos + 1, pos - 1, pos + w, pos - w);
  }
  ctx.putImageData(imgData, 0, 0);
}

const S = {
  app: { display:"flex", flexDirection:"column", height:"100%", background:"#1c1c1e", fontFamily:"'SF Mono', 'Fira Code', monospace", fontSize:11, color:"#ccc", userSelect:"none" },
  topToolbar: { display:"flex", alignItems:"center", gap:4, padding:"4px 8px", background:"#232325", borderBottom:"1px solid #111", flexShrink:0, overflowX:"auto" },
  workspace: { display:"flex", flex:1, overflow:"hidden" },
  leftPanel: { width:44, background:"#232325", borderRight:"1px solid #111", display:"flex", flexDirection:"column", alignItems:"center", paddingTop:6, gap:2, flexShrink:0, overflowY:"auto" },
  toolBtn: (active) => ({
    width:34, height:34, border:active ? "1px solid #06b6d4" : "1px solid transparent",
    background: active ? "rgba(6,182,212,0.15)" : "transparent",
    borderRadius:5, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
    fontSize:14, transition:"all 0.1s", color: active ? "#06b6d4" : "#999",
  }),
  canvasArea: { flex:1, overflow:"auto", background:"#141416", display:"flex", alignItems:"flex-start", justifyContent:"flex-start", padding:20, position:"relative" },
  canvasWrap: (zoom) => ({
    position:"relative", boxShadow:"0 4px 40px rgba(0,0,0,0.7)",
    transform:`scale(${zoom})`, transformOrigin:"top left", flexShrink:0,
  }),
  rightPanel: { width:180, background:"#232325", borderLeft:"1px solid #111", display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto" },
  panelHeader: { padding:"6px 10px", borderBottom:"1px solid #111", color:"#888", fontSize:10, letterSpacing:2, textTransform:"uppercase" },
  statusBar: { height:22, background:"#1a1a1c", borderTop:"1px solid #111", display:"flex", alignItems:"center", gap:12, padding:"0 10px", flexShrink:0, color:"#555", fontSize:10 },
  swatchGrid: { display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:2, padding:8 },
  swatch: (c, active) => ({
    width:"100%", aspectRatio:"1", borderRadius:2, cursor:"pointer", background:c,
    border: active ? "2px solid #06b6d4" : "1px solid rgba(255,255,255,0.08)",
    transition:"transform 0.08s", boxSizing:"border-box",
  }),
};

export default function PaintApp() {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const ctxRef = useRef(null);
  const overlayCtxRef = useRef(null);

  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(4);
  const [opacity, setOpacity] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [activeColorSlot, setActiveColorSlot] = useState("fg"); // fg or bg

  const drawing = useRef(false);
  const startRef = useRef(null);
  const snapshotRef = useRef(null);
  const historyRef = useRef([]);
  const histIdxRef = useRef(-1);
  const prevToolRef = useRef("brush");
  const textInputRef = useRef(null);
  const [textPos, setTextPos] = useState(null);
  const [textVal, setTextVal] = useState("");
  const [fontSize, setFontSize] = useState(20);

  // force re-render for undo/redo button state
  const [histLen, setHistLen] = useState(0);
  const [histIdx, setHistIdx] = useState(-1);

  const pushHistory = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const newHist = historyRef.current.slice(0, histIdxRef.current + 1);
    newHist.push(snap);
    if (newHist.length > MAX_HISTORY) newHist.shift();
    historyRef.current = newHist;
    histIdxRef.current = newHist.length - 1;
    setHistLen(newHist.length);
    setHistIdx(histIdxRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    overlay.width = CANVAS_W;
    overlay.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    const ovCtx = overlay.getContext("2d");
    ctxRef.current = ctx;
    overlayCtxRef.current = ovCtx;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    pushHistory();
  }, []);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left) / zoom),
      y: Math.round((e.clientY - rect.top) / zoom),
    };
  }, [zoom]);

  const undo = useCallback(() => {
    if (histIdxRef.current <= 0) return;
    histIdxRef.current--;
    ctxRef.current.putImageData(historyRef.current[histIdxRef.current], 0, 0);
    setHistIdx(histIdxRef.current);
  }, []);

  const redo = useCallback(() => {
    if (histIdxRef.current >= historyRef.current.length - 1) return;
    histIdxRef.current++;
    ctxRef.current.putImageData(historyRef.current[histIdxRef.current], 0, 0);
    setHistIdx(histIdxRef.current);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); return; }
      const found = TOOLS.find((t) => t.key === e.key);
      if (found) setTool(found.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    const pos = getPos(e);
    const ctx = ctxRef.current;

    if (tool === "picker") {
      const d = ctx.getImageData(pos.x, pos.y, 1, 1).data;
      const hex = rgbToHex(d[0], d[1], d[2]);
      if (activeColorSlot === "fg") setColor(hex);
      else setBgColor(hex);
      setTool(prevToolRef.current);
      return;
    }

    if (tool === "fill") {
      pushHistory();
      floodFill(ctx, pos.x, pos.y, color, CANVAS_W, CANVAS_H);
      pushHistory();
      return;
    }

    if (tool === "text") {
      setTextPos(pos);
      setTextVal("");
      setTimeout(() => textInputRef.current?.focus(), 10);
      return;
    }

    drawing.current = true;
    startRef.current = pos;
    snapshotRef.current = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);

    if (tool === "brush" || tool === "pencil" || tool === "eraser") {
      ctx.globalAlpha = opacity / 100;
      ctx.strokeStyle = tool === "eraser" ? bgColor : color;
      ctx.lineWidth = tool === "eraser" ? brushSize * 2.5 : brushSize;
      ctx.lineCap = tool === "pencil" ? "square" : "round";
      ctx.lineJoin = tool === "pencil" ? "miter" : "round";
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      // dot on click
      ctx.arc(pos.x, pos.y, (tool === "eraser" ? brushSize * 1.25 : brushSize / 2), 0, Math.PI * 2);
      ctx.fillStyle = tool === "eraser" ? bgColor : color;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  }, [getPos, tool, color, bgColor, brushSize, opacity, activeColorSlot, pushHistory]);

  const onMouseMove = useCallback((e) => {
    const pos = getPos(e);
    setCursorPos(pos);
    if (!drawing.current) return;
    const ctx = ctxRef.current;
    const ovCtx = overlayCtxRef.current;

    if (tool === "brush" || tool === "pencil" || tool === "eraser") {
      ctx.globalAlpha = opacity / 100;
      ctx.strokeStyle = tool === "eraser" ? bgColor : color;
      ctx.lineWidth = tool === "eraser" ? brushSize * 2.5 : brushSize;
      ctx.lineCap = tool === "pencil" ? "square" : "round";
      ctx.lineJoin = tool === "pencil" ? "miter" : "round";
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      return;
    }

    // Shape preview on overlay
    ovCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    const s = startRef.current;
    ovCtx.globalAlpha = opacity / 100;
    ovCtx.strokeStyle = color;
    ovCtx.fillStyle = color;
    ovCtx.lineWidth = brushSize;
    ovCtx.lineCap = "round";
    ovCtx.lineJoin = "round";
    ovCtx.setLineDash([]);

    if (tool === "line") {
      ovCtx.beginPath();
      ovCtx.moveTo(s.x, s.y);
      ovCtx.lineTo(pos.x, pos.y);
      ovCtx.stroke();
    } else if (tool === "rect") {
      ovCtx.strokeRect(s.x, s.y, pos.x - s.x, pos.y - s.y);
    } else if (tool === "rectfill") {
      ovCtx.fillRect(s.x, s.y, pos.x - s.x, pos.y - s.y);
    } else if (tool === "circle" || tool === "circlefill") {
      const cx = (s.x + pos.x) / 2, cy = (s.y + pos.y) / 2;
      const rx = Math.abs(pos.x - s.x) / 2, ry = Math.abs(pos.y - s.y) / 2;
      ovCtx.beginPath();
      ovCtx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);
      tool === "circlefill" ? ovCtx.fill() : ovCtx.stroke();
    }
  }, [getPos, tool, color, bgColor, brushSize, opacity]);

  const onMouseUp = useCallback((e) => {
    if (!drawing.current) return;
    drawing.current = false;
    const pos = getPos(e);
    const ctx = ctxRef.current;
    const ovCtx = overlayCtxRef.current;

    ctx.globalAlpha = opacity / 100;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const s = startRef.current;
    if (["line", "rect", "rectfill", "circle", "circlefill"].includes(tool)) {
      ovCtx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      if (tool === "line") {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.strokeRect(s.x, s.y, pos.x - s.x, pos.y - s.y);
      } else if (tool === "rectfill") {
        ctx.fillRect(s.x, s.y, pos.x - s.x, pos.y - s.y);
      } else if (tool === "circle" || tool === "circlefill") {
        const cx = (s.x + pos.x) / 2, cy = (s.y + pos.y) / 2;
        const rx = Math.abs(pos.x - s.x) / 2, ry = Math.abs(pos.y - s.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);
        tool === "circlefill" ? ctx.fill() : ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
    pushHistory();
  }, [getPos, tool, color, brushSize, opacity, pushHistory]);

  const commitText = useCallback(() => {
    if (!textPos || !textVal) { setTextPos(null); return; }
    const ctx = ctxRef.current;
    ctx.globalAlpha = opacity / 100;
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.fillText(textVal, textPos.x, textPos.y);
    ctx.globalAlpha = 1;
    pushHistory();
    setTextPos(null);
    setTextVal("");
  }, [textPos, textVal, color, fontSize, opacity, pushHistory]);

  const handleClear = () => {
    pushHistory();
    const ctx = ctxRef.current;
    ctx.globalAlpha = 1;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    pushHistory();
  };

  const handleSave = () => {
    const link = document.createElement("a");
    link.download = "painting.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const swapColors = () => {
    const tmp = color;
    setColor(bgColor);
    setBgColor(tmp);
  };

  const cursorStyle = {
    brush: "crosshair", pencil: "crosshair", eraser: "cell",
    fill: "cell", picker: "crosshair", line: "crosshair",
    rect: "crosshair", rectfill: "crosshair", circle: "crosshair",
    circlefill: "crosshair", text: "text",
  }[tool] || "crosshair";

  const canUndo = histIdx > 0;
  const canRedo = histIdx < histLen - 1;

  const BtnStyle = (active) => ({
    padding: "2px 8px", borderRadius: 4, border: "none", cursor: "pointer", fontSize: 10,
    fontFamily: "inherit", letterSpacing: 0.5,
    background: active ? "rgba(6,182,212,0.2)" : "rgba(255,255,255,0.05)",
    color: active ? "#06b6d4" : "#999",
    transition: "all 0.1s",
  });

  return (
    <div style={S.app}>
      {/* Top toolbar */}
      <div style={S.topToolbar}>
        {/* Undo/Redo */}
        <button style={{ ...BtnStyle(false), opacity: canUndo ? 1 : 0.3, padding:"3px 10px" }} onClick={undo} disabled={!canUndo}>↩ Undo</button>
        <button style={{ ...BtnStyle(false), opacity: canRedo ? 1 : 0.3, padding:"3px 10px" }} onClick={redo} disabled={!canRedo}>↪ Redo</button>

        <div style={{ width:1, height:18, background:"#333", margin:"0 4px" }} />

        {/* Brush size */}
        <span style={{ color:"#666", fontSize:9 }}>SIZE</span>
        <input type="range" min={1} max={60} value={brushSize} onChange={(e) => setBrushSize(+e.target.value)}
          style={{ width:70, accentColor:"#06b6d4" }} />
        <span style={{ color:"#888", minWidth:16, textAlign:"right" }}>{brushSize}</span>

        <div style={{ width:1, height:18, background:"#333", margin:"0 4px" }} />

        {/* Opacity */}
        <span style={{ color:"#666", fontSize:9 }}>OPACITY</span>
        <input type="range" min={1} max={100} value={opacity} onChange={(e) => setOpacity(+e.target.value)}
          style={{ width:60, accentColor:"#06b6d4" }} />
        <span style={{ color:"#888", minWidth:24, textAlign:"right" }}>{opacity}%</span>

        {/* Font size (text tool) */}
        {tool === "text" && <>
          <div style={{ width:1, height:18, background:"#333", margin:"0 4px" }} />
          <span style={{ color:"#666", fontSize:9 }}>FONT</span>
          <input type="number" min={8} max={200} value={fontSize} onChange={(e) => setFontSize(+e.target.value)}
            style={{ width:44, background:"#1a1a1c", border:"1px solid #333", color:"#ccc", borderRadius:3, padding:"1px 4px", fontFamily:"inherit", fontSize:10 }} />
        </>}

        <div style={{ flex:1 }} />

        {/* Zoom */}
        <span style={{ color:"#666", fontSize:9 }}>ZOOM</span>
        {[0.5, 0.75, 1, 1.5, 2].map((z) => (
          <button key={z} style={BtnStyle(zoom === z)} onClick={() => setZoom(z)}>{Math.round(z * 100)}%</button>
        ))}

        <div style={{ width:1, height:18, background:"#333", margin:"0 4px" }} />
        <button style={BtnStyle(showGrid)} onClick={() => setShowGrid((v) => !v)}>Grid</button>
        <button style={{ ...BtnStyle(false), padding:"3px 10px" }} onClick={handleClear}>Clear</button>
        <button style={{ ...BtnStyle(false), padding:"3px 10px", color:"#06b6d4" }} onClick={handleSave}>⬇ Save</button>
      </div>

      {/* Main workspace */}
      <div style={S.workspace}>
        {/* Left tool panel */}
        <div style={S.leftPanel}>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              title={`${t.label} (${t.key})`}
              style={S.toolBtn(tool === t.id)}
              onClick={() => { prevToolRef.current = tool; setTool(t.id); }}
            >
              {t.id === "text" ? <span style={{ fontFamily:"serif", fontWeight:700, fontSize:13 }}>T</span>
               : t.id === "rectfill" ? <span style={{ fontSize:11 }}>▬</span>
               : t.id === "circlefill" ? <span style={{ fontSize:13 }}>●</span>
               : <span style={{ fontSize:13 }}>{t.icon}</span>
              }
            </button>
          ))}

          <div style={{ flex:1 }} />

          {/* Color swatches */}
          <div style={{ padding:"6px 4px", width:"100%" }}>
            {/* FG/BG color squares */}
            <div style={{ position:"relative", width:32, height:32, margin:"0 auto 4px" }}>
              <div
                onClick={() => setActiveColorSlot("bg")}
                style={{
                  position:"absolute", bottom:0, right:0, width:20, height:20,
                  background: bgColor, border: activeColorSlot==="bg" ? "2px solid #06b6d4" : "2px solid #555",
                  borderRadius:2, cursor:"pointer",
                }}
              />
              <div
                onClick={() => setActiveColorSlot("fg")}
                style={{
                  position:"absolute", top:0, left:0, width:22, height:22,
                  background: color, border: activeColorSlot==="fg" ? "2px solid #06b6d4" : "2px solid #777",
                  borderRadius:2, cursor:"pointer", zIndex:1,
                }}
              />
              <div
                onClick={swapColors}
                style={{ position:"absolute", top:-4, right:-4, fontSize:10, cursor:"pointer", color:"#555", lineHeight:1 }}
                title="Swap colors"
              >⇄</div>
            </div>
            <input
              type="color"
              value={activeColorSlot === "fg" ? color : bgColor}
              onChange={(e) => activeColorSlot === "fg" ? setColor(e.target.value) : setBgColor(e.target.value)}
              style={{ width:30, height:16, border:"none", background:"none", cursor:"pointer", padding:0, display:"block", margin:"0 auto 4px" }}
            />
          </div>
        </div>

        {/* Canvas area */}
        <div style={S.canvasArea} id="canvas-scroll-area">
          <div style={S.canvasWrap(zoom)}>
            <canvas
              ref={canvasRef}
              style={{ display:"block", cursor: cursorStyle }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={() => { drawing.current = false; overlayCtxRef.current?.clearRect(0,0,CANVAS_W,CANVAS_H); }}
            />
            {/* Overlay canvas for shape preview */}
            <canvas
              ref={overlayRef}
              style={{ position:"absolute", top:0, left:0, pointerEvents:"none" }}
            />
            {/* Grid overlay */}
            {showGrid && (
              <div style={{
                position:"absolute", top:0, left:0, width:CANVAS_W, height:CANVAS_H,
                pointerEvents:"none",
                backgroundImage:"linear-gradient(rgba(6,182,212,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.15) 1px,transparent 1px)",
                backgroundSize:"20px 20px",
              }} />
            )}
            {/* Text input overlay */}
            {textPos && (
              <input
                ref={textInputRef}
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commitText(); if (e.key === "Escape") { setTextPos(null); setTextVal(""); } }}
                onBlur={commitText}
                style={{
                  position:"absolute",
                  left: textPos.x * zoom,
                  top: (textPos.y - fontSize) * zoom,
                  background:"rgba(6,182,212,0.1)",
                  border:"1px dashed #06b6d4",
                  color: color,
                  fontSize: fontSize * zoom,
                  fontFamily:"sans-serif",
                  outline:"none",
                  padding:"2px 4px",
                  minWidth:80,
                  lineHeight:1.2,
                }}
              />
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={S.rightPanel}>
          <div style={S.panelHeader}>Colors</div>
          <div style={S.swatchGrid}>
            {PALETTE.map((c) => (
              <div
                key={c}
                style={S.swatch(c, c === (activeColorSlot==="fg" ? color : bgColor))}
                onClick={() => activeColorSlot === "fg" ? setColor(c) : setBgColor(c)}
                onMouseEnter={(e) => { e.currentTarget.style.transform="scale(1.25)"; e.currentTarget.style.zIndex=10; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.zIndex=1; }}
                title={c}
              />
            ))}
          </div>

          <div style={S.panelHeader}>Tool</div>
          <div style={{ padding:"6px 10px" }}>
            <div style={{ color:"#06b6d4", fontSize:11, marginBottom:4 }}>
              {TOOLS.find((t2) => t2.id === tool)?.label}
            </div>
            <div style={{ color:"#555", fontSize:9, lineHeight:1.8 }}>
              {TOOLS.map((t2) => (
                <span
                  key={t2.id}
                  style={{ display:"flex", justifyContent:"space-between", cursor:"pointer", padding:"1px 0",
                    color: t2.id===tool ? "#06b6d4":"#555" }}
                  onClick={() => setTool(t2.id)}
                >
                  <span>{t2.label}</span>
                  <kbd style={{ background:"#2a2a2e", padding:"0 4px", borderRadius:2, color:"#444" }}>{t2.key}</kbd>
                </span>
              ))}
            </div>
          </div>

          <div style={S.panelHeader}>History</div>
          <div style={{ padding:"6px 10px" }}>
            <div style={{ color:"#555", fontSize:9 }}>
              Step {histIdx + 1} / {histLen}
            </div>
            <div style={{ marginTop:6, display:"flex", gap:4 }}>
              <button style={{ ...BtnStyle(false), flex:1, opacity: canUndo?1:0.3 }} onClick={undo} disabled={!canUndo}>Undo</button>
              <button style={{ ...BtnStyle(false), flex:1, opacity: canRedo?1:0.3 }} onClick={redo} disabled={!canRedo}>Redo</button>
            </div>
          </div>

          <div style={{ flex:1 }} />
          <div style={{ padding:"8px 10px", borderTop:"1px solid #111" }}>
            <div style={{ color:"#444", fontSize:9, lineHeight:1.8 }}>
              <div>Canvas: {CANVAS_W}×{CANVAS_H}</div>
              <div>Zoom: {Math.round(zoom*100)}%</div>
              <div>Size: {brushSize}px</div>
              <div>Opacity: {opacity}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div style={S.statusBar}>
        <span style={{ color:"#06b6d4" }}>{TOOLS.find((t2) => t2.id === tool)?.label}</span>
        <span>X: {cursorPos.x} Y: {cursorPos.y}</span>
        <span>{brushSize}px</span>
        <span>{opacity}%</span>
        <div style={{ flex:1 }} />
        <span>{CANVAS_W}×{CANVAS_H}px</span>
        <span>{Math.round(zoom*100)}%</span>
      </div>
    </div>
  );
}