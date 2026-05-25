"use client";
import { useState, useRef, useEffect, useCallback } from "react";

const TOOLS = [
  { id: "brush", label: "Brush", icon: "🖌" },
  { id: "eraser", label: "Eraser", icon: "🧹" },
  { id: "line", label: "Line", icon: "╱" },
  { id: "rect", label: "Rect", icon: "▭" },
  { id: "circle", label: "Circle", icon: "○" },
  { id: "fill", label: "Fill", icon: "🪣" },
  { id: "picker", label: "Picker", icon: "💉" },
];

const COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316", "#eab308",
  "#34d399", "#3b82f6", "#8b5cf6", "#ec4899", "#78716c",
  "#171717", "#a3a3a3", "#fca5a5", "#fdba74", "#fde68a",
  "#a7f3d0", "#93c5fd", "#c4b5fd", "#f9a8d0", "#d6d3d1",
];

const CANVAS_W = 700;
const CANVAS_H = 420;

export default function PaintApp() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(4);
  const [drawing, setDrawing] = useState(false);
  const startRef = useRef(null);
  const snapshotRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    snapshotRef.current = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const saveSnapshot = useCallback(() => {
    const ctx = ctxRef.current;
    snapshotRef.current = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  const setupDraw = useCallback((e) => {
    if (e.button !== 0) return;
    const pos = getPos(e);
    setDrawing(true);
    startRef.current = pos;
    const ctx = ctxRef.current;

    if (tool === "fill") {
      floodFill(Math.round(pos.x), Math.round(pos.y), color);
      setDrawing(false);
      return;
    }

    if (tool === "picker") {
      const d = ctx.getImageData(Math.round(pos.x), Math.round(pos.y), 1, 1).data;
      setColor(rgbToHex(d[0], d[1], d[2]));
      setDrawing(false);
      return;
    }

    saveSnapshot();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos, tool, color, saveSnapshot]);

  const draw = useCallback((e) => {
    if (!drawing) return;
    const pos = getPos(e);
    const ctx = ctxRef.current;
    const isShape = ["line", "rect", "circle"].includes(tool);

    if (isShape) {
      ctx.putImageData(snapshotRef.current, 0, 0);
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (tool === "line") {
        ctx.moveTo(startRef.current.x, startRef.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === "rect") {
        ctx.strokeRect(startRef.current.x, startRef.current.y, pos.x - startRef.current.x, pos.y - startRef.current.y);
      } else if (tool === "circle") {
        const cx = (startRef.current.x + pos.x) / 2;
        const cy = (startRef.current.y + pos.y) / 2;
        const rx = Math.abs(pos.x - startRef.current.x) / 2;
        const ry = Math.abs(pos.y - startRef.current.y) / 2;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      return;
    }

    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "eraser" ? brushSize * 2 : brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [drawing, getPos, tool, color, brushSize]);

  const endDraw = useCallback(() => {
    setDrawing(false);
    const ctx = ctxRef.current;
    ctx.closePath();
  }, []);

  function floodFill(startX, startY, fillColor) {
    const ctx = ctxRef.current;
    const imgData = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    const data = imgData.data;
    const w = CANVAS_W;
    const targetIdx = (startY * w + startX) * 4;
    const targetR = data[targetIdx], targetG = data[targetIdx + 1], targetB = data[targetIdx + 2];
    const [fr, fg, fb] = hexToRgb(fillColor);
    if (targetR === fr && targetG === fg && targetB === fb) return;

    const visited = new Uint8Array(w * CANVAS_H);
    const stack = [[startX, startY]];
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= w || y < 0 || y >= CANVAS_H) continue;
      const idx = (y * w + x) * 4;
      if (visited[y * w + x]) continue;
      if (Math.abs(data[idx] - targetR) > 5 || Math.abs(data[idx + 1] - targetG) > 5 || Math.abs(data[idx + 2] - targetB) > 5) continue;
      visited[y * w + x] = 1;
      data[idx] = fr; data[idx + 1] = fg; data[idx + 2] = fb; data[idx + 3] = 255;
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const handleClear = () => {
    const ctx = ctxRef.current;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    saveSnapshot();
  };

  const handleSave = () => {
    const link = document.createElement("a");
    link.download = "painting.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleUndo = () => {
    if (!snapshotRef.current) return;
    ctxRef.current.putImageData(snapshotRef.current, 0, 0);
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg-root)" }}>
      <div
        className="flex items-center gap-1 px-2 py-1.5 border-b overflow-x-auto"
        style={{ borderColor: "var(--border)", background: "var(--bg-elevated)" }}
      >
        <div className="flex items-center gap-0.5 mr-2">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] transition-all ${
                tool === t.id ? "bg-accent/15 text-accent" : "hover:bg-white/10"
              }`}
              style={{ color: tool === t.id ? undefined : "var(--text-muted)" }}
              title={t.label}
            >
              <span className="text-xs">{t.icon}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-5 h-5 rounded cursor-pointer border-0 p-0"
          style={{ background: "none" }}
        />
        <div className="flex gap-0.5">
          {COLORS.slice(0, 10).map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-3.5 h-3.5 rounded-sm border border-white/10 transition-transform hover:scale-125"
              style={{ background: c }}
            />
          ))}
        </div>

        <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />

        <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>Size</span>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-16"
        />
        <span className="text-[9px] w-3" style={{ color: "var(--text-muted)" }}>{brushSize}</span>

        <div className="w-px h-5 mx-1" style={{ background: "var(--border)" }} />

        <button onClick={handleUndo} className="px-2 py-0.5 rounded text-[10px] hover:bg-white/10 transition-all" style={{ color: "var(--text-muted)" }}>↩</button>
        <button onClick={handleClear} className="px-2 py-0.5 rounded text-[10px] hover:bg-white/10 transition-all" style={{ color: "var(--text-muted)" }}>Clear</button>
        <button onClick={handleSave} className="px-2 py-0.5 rounded text-[10px] hover:bg-white/10 transition-all" style={{ color: "var(--text-muted)" }}>Save</button>
      </div>

      <div className="flex-1 flex items-center justify-center p-2 overflow-auto">
        <div className="rounded-lg shadow-inner" style={{ background: "var(--bg-elevated)", padding: 8, border: "1px solid var(--border)" }}>
          <canvas
            ref={canvasRef}
            className="rounded cursor-crosshair"
            style={{ width: CANVAS_W, height: CANVAS_H, imageRendering: "pixelated" }}
            onMouseDown={setupDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-3 py-1 border-t text-[9px]"
        style={{ borderColor: "var(--border)", background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
        <span>Tool: {tool}</span>
        <span>{CANVAS_W} × {CANVAS_H}</span>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const v = parseInt(hex.replace("#", ""), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}
