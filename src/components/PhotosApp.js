"use client";
import { useState, useEffect, useCallback, useRef } from "react";

function getCellClass(i) {
  if (i === 0) return "hero";
  if (i === 2) return "tall";
  return "normal";
}

export default function PhotosApp() {
  const [photos, setPhotos] = useState(null);
  const [lbIdx, setLbIdx] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then(setPhotos)
      .catch(() => setPhotos([]));
  }, []);

  const closeLb = useCallback(() => {
    setLbIdx(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const navLb = useCallback(
    (dir) => {
      if (!photos) return;
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setLbIdx((prev) => (prev + dir + photos.length) % photos.length);
    },
    [photos]
  );

  const changeZoom = useCallback((delta, origin = null) => {
    setZoom((prev) => {
      const next = Math.min(4, Math.max(1, prev + delta));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  // Keyboard
  useEffect(() => {
    if (lbIdx === null) return;
    const handler = (e) => {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") navLb(-1);
      if (e.key === "ArrowRight") navLb(1);
      if (e.key === "+" || e.key === "=") changeZoom(0.5);
      if (e.key === "-") changeZoom(-0.5);
      if (e.key === "0") { setZoom(1); setPan({ x: 0, y: 0 }); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lbIdx, closeLb, navLb, changeZoom]);

  // Scroll to zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    changeZoom(e.deltaY < 0 ? 0.25 : -0.25);
  }, [changeZoom]);

  // Drag to pan
  const onMouseDown = (e) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
  };
  const onMouseMove = (e) => {
    if (!dragging || !dragStart.current) return;
    setPan({
      x: dragStart.current.px + (e.clientX - dragStart.current.mx),
      y: dragStart.current.py + (e.clientY - dragStart.current.my),
    });
  };
  const onMouseUp = () => setDragging(false);

  if (photos === null) {
    return (
      <div className="h-full flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
        Loading...
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
        <span>No photos yet.</span>
        <code style={{ background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>public/photos/</code>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 shrink-0"
        style={{ borderBottom: "0.5px solid var(--border)", height: 40 }}
      >
        <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)" }}>
          Photos
        </span>
        <span style={{ fontSize: 10, color: "var(--text-dim, rgba(240,240,240,0.28))" }}>
          {photos.length} {photos.length === 1 ? "photo" : "photos"}
        </span>
      </div>

      {/* Grid — constrained height so it never overflows the window */}
      <div className="flex-1 overflow-auto" style={{ padding: 14 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridAutoRows: "140px",
            gap: 10,
          }}
        >
          {photos.map((photo, i) => {
            const kind = getCellClass(i);
            return (
              <button
                key={photo.src}
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setLbIdx(i); }}
                className="group"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: kind === "hero" ? 14 : 12,
                  background: "rgba(255,255,255,0.04)",
                  gridColumn: kind === "hero" ? "1 / 3" : undefined,
                  gridRow: kind === "hero" ? "span 2" : kind === "tall" ? "span 2" : "span 1",
                  border: "0.5px solid var(--border)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.45s cubic-bezier(.22,1,.36,1), filter 0.3s",
                  }}
                  className="group-hover:scale-105 group-hover:brightness-75"
                />

                {/* Hover overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(160deg, transparent 40%, rgba(0,0,0,0.72) 100%)",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    padding: "12px 14px",
                  }}
                  className="group-hover:opacity-100"
                >
                  <p style={{ margin: 0, fontSize: 13, color: "#fff", fontFamily: "'DM Serif Display', serif", lineHeight: 1.2 }}>
                    {photo.title}
                  </p>
                </div>

                {/* Index badge */}
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    fontSize: 10,
                    color: "rgba(255,255,255,0.35)",
                    background: "rgba(0,0,0,0.3)",
                    padding: "2px 6px",
                    borderRadius: 100,
                    opacity: 0,
                    transition: "opacity 0.2s",
                  }}
                  className="group-hover:opacity-100"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Accent sweep */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: 2,
                    width: 0,
                    background: "var(--accent)",
                    transition: "width 0.35s cubic-bezier(0.22,1,0.36,1)",
                  }}
                  className="group-hover:w-full"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lbIdx !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(6,6,12,0.92)",
            backdropFilter: "blur(16px)",
          }}
          onClick={closeLb}
        >
          {/* Image area */}
          <div
            style={{
              position: "relative",
              width: "100%",
              flex: "1 1 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
            }}
            onClick={(e) => { e.stopPropagation(); if (zoom === 1) changeZoom(1); else { setZoom(1); setPan({ x: 0, y: 0 }); }}}
            onWheel={handleWheel}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <img
              ref={imgRef}
              src={photos[lbIdx].src}
              alt={photos[lbIdx].title}
              draggable={false}
              style={{
                maxWidth: "calc(100% - 80px)",
                maxHeight: "calc(100% - 24px)",
                width: "auto",
                height: "auto",
                borderRadius: 12,
                objectFit: "contain",
                transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                transition: dragging ? "none" : "transform 0.25s cubic-bezier(.22,1,.36,1)",
                userSelect: "none",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
              }}
            />
          </div>

          {/* Bottom bar */}
          <div
            style={{ width: "100%", padding: "12px 20px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev */}
            <NavBtn onClick={() => navLb(-1)} aria-label="Previous">←</NavBtn>

            {/* Dots */}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {photos.map((_, di) => (
                <div
                  key={di}
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setLbIdx(di); }}
                  style={{
                    height: 5,
                    width: di === lbIdx ? 16 : 5,
                    borderRadius: 100,
                    background: di === lbIdx ? "var(--accent)" : "rgba(255,255,255,0.22)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>

            {/* Next */}
            <NavBtn onClick={() => navLb(1)} aria-label="Next">→</NavBtn>

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />

            {/* Zoom controls */}
            <NavBtn onClick={() => changeZoom(-0.5)} aria-label="Zoom out" disabled={zoom <= 1}>−</NavBtn>
            <span
              style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 36, textAlign: "center", cursor: "pointer" }}
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <NavBtn onClick={() => changeZoom(0.5)} aria-label="Zoom in" disabled={zoom >= 4}>+</NavBtn>
          </div>

          {/* Title */}
          <div
            style={{ position: "absolute", bottom: 56, left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}
          >
            <p style={{ margin: 0, fontSize: 15, color: "#f0f0f0", fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.01em" }}>
              {photos[lbIdx].title}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(240,240,240,0.35)", letterSpacing: "0.06em" }}>
              {String(lbIdx + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
            </p>
          </div>

          {/* Close */}
          <button
            onClick={closeLb}
            aria-label="Close"
            style={{
              position: "fixed",
              top: 16,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.6)",
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function NavBtn({ children, onClick, disabled, ...props }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)",
        border: "0.5px solid rgba(255,255,255,0.1)",
        color: disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
        fontSize: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "default" : "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "rgba(249,115,22,0.2)";
          e.currentTarget.style.borderColor = "rgba(249,115,22,0.4)";
          e.currentTarget.style.color = "var(--accent)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = disabled ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.06)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        e.currentTarget.style.color = disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)";
      }}
      {...props}
    >
      {children}
    </button>
  );
}