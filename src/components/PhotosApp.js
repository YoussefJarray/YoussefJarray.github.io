"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";

export default function PhotosApp() {
  const [photos, setPhotos] = useState(null);
  const [filter, setFilter] = useState("all");
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

  const cats = useMemo(() => {
    if (!photos) return [];
    const set = new Set(photos.map((p) => p.cat));
    return ["all", ...Array.from(set).sort()];
  }, [photos]);

  const filtered = useMemo(() => {
    if (!photos) return [];
    return filter === "all" ? photos : photos.filter((p) => p.cat === filter);
  }, [photos, filter]);

  const closeLb = useCallback(() => {
    setLbIdx(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const navLb = useCallback(
    (dir) => {
      if (!filtered) return;
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setLbIdx((prev) => (prev + dir + filtered.length) % filtered.length);
    },
    [filtered]
  );

  const changeZoom = useCallback((delta) => {
    setZoom((prev) => {
      const next = Math.min(4, Math.max(1, prev + delta));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

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

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    changeZoom(e.deltaY < 0 ? 0.25 : -0.25);
  }, [changeZoom]);

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
    <div className="h-full flex flex-col md:flex-row overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Sidebar */}
      <div
        className="flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-subtle w-full md:w-44 p-2 md:py-3 md:px-0 gap-1.5 hide-scrollbar"
        style={{ borderRightColor: "var(--border)", borderBottomColor: "var(--border)" }}
      >
        <span className="hidden md:block" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", padding: "0 14px 10px" }}>
          Library
        </span>
        {cats.map((cat) => (
          <button
            key={cat}
            onClick={() => { setFilter(cat); setLbIdx(null); }}
            className="text-left whitespace-nowrap rounded-lg text-xs md:text-sm px-3.5 py-1.5 md:py-2 md:px-4"
            style={{
              color: filter === cat ? "var(--accent)" : "var(--text-secondary)",
              background: filter === cat ? "var(--accent-light)" : "transparent",
              borderRight: filter === cat ? "2px solid var(--accent)" : "2px solid transparent",
              fontWeight: filter === cat ? 600 : 400,
              transition: "all 0.15s",
            }}
          >
            {cat === "all" ? "All Photos" : cat}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div
          className="flex items-center justify-between px-4 shrink-0"
          style={{ borderBottom: "0.5px solid var(--border)", height: 40 }}
        >
          <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)" }}>
            {filter === "all" ? "All Photos" : filter}
          </span>
          <span style={{ fontSize: 10, color: "var(--text-dim, rgba(240,240,240,0.28))" }}>
            {filtered.length} {filtered.length === 1 ? "photo" : "photos"}
          </span>
        </div>

        <div className="flex-1 overflow-auto" style={{ padding: 14 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
              gap: 10,
            }}
          >
            {filtered.map((photo, i) => (
              <button
                key={photo.src}
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setLbIdx(i); }}
                className="group"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  aspectRatio: "1 / 1",
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
                    padding: "10px 12px",
                  }}
                  className="group-hover:opacity-100"
                >
                  <p style={{ margin: 0, fontSize: 11, color: "#fff", lineHeight: 1.2 }}>
                    {photo.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lbIdx !== null && filtered.length > 0 && (
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
              src={filtered[lbIdx].src}
              alt={filtered[lbIdx].title}
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

          <div
            style={{ width: "100%", padding: "12px 20px 16px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <NavBtn onClick={() => navLb(-1)} aria-label="Previous">←</NavBtn>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {filtered.map((_, di) => (
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
            <NavBtn onClick={() => navLb(1)} aria-label="Next">→</NavBtn>
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)", margin: "0 4px" }} />
            <NavBtn onClick={() => changeZoom(-0.5)} aria-label="Zoom out" disabled={zoom <= 1}>−</NavBtn>
            <span
              style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 36, textAlign: "center", cursor: "pointer" }}
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <NavBtn onClick={() => changeZoom(0.5)} aria-label="Zoom in" disabled={zoom >= 4}>+</NavBtn>
          </div>

          <div
            style={{ position: "absolute", bottom: 56, left: 0, right: 0, textAlign: "center", pointerEvents: "none" }}
          >
            <p style={{ margin: 0, fontSize: 15, color: "#f0f0f0", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.01em" }}>
              {filtered[lbIdx].title}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(240,240,240,0.35)", letterSpacing: "0.06em" }}>
              {String(lbIdx + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
            </p>
          </div>

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