"use client";
import { useState, useEffect, useCallback } from "react";

const categories = ["All", "Projects", "Personal"];

function getCellClass(i, filter) {
  if (i === 0) return "hero";
  if (i === 2 && filter === "All") return "tall";
  return "normal";
}

export default function PhotosApp() {
  const [images, setImages] = useState([]);
  const [activeCat, setActiveCat] = useState("All");
  const [lbIdx, setLbIdx] = useState(null);

  useEffect(() => {
    fetch("/photos/index.json")
      .then((r) => r.json())
      .then(setImages)
      .catch(() => setImages([]));
  }, []);

  const filtered = activeCat === "All" ? images : images.filter((img) => img.cat === activeCat);

  const openLb = (i) => setLbIdx(i);
  const closeLb = () => setLbIdx(null);
  const navLb = useCallback(
    (dir) => setLbIdx((prev) => (prev + dir + filtered.length) % filtered.length),
    [filtered.length]
  );

  useEffect(() => {
    if (lbIdx === null) return;
    const handler = (e) => {
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") navLb(-1);
      if (e.key === "ArrowRight") navLb(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lbIdx, navLb]);

  const countFor = (cat) =>
    cat === "All" ? images.length : images.filter((i) => i.cat === cat).length;

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Filter bar */}
      <div className="flex items-center gap-1.5 px-[18px] py-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
        <span
          className="text-[10px] uppercase tracking-widest mr-1"
          style={{ color: "var(--text-muted)", letterSpacing: "0.12em" }}
        >
          View
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className="text-[11.5px] px-3.5 py-1 rounded-full transition-all duration-150"
            style={
              activeCat === cat
                ? {
                    background: "var(--accent)",
                    border: "0.5px solid var(--accent)",
                    color: "#fff",
                    fontWeight: 500,
                  }
                : {
                    background: "transparent",
                    border: "0.5px solid var(--border)",
                    color: "var(--text-muted)",
                  }
            }
          >
            {cat}{" "}
            <span className="text-[10px] opacity-60 tabular-nums">{countFor(cat)}</span>
          </button>
        ))}
      </div>

      {/* Gallery grid */}
      <div className="flex-1 overflow-auto p-[18px]">
        {images.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm" style={{ color: "var(--text-muted)" }}>
            Loading photos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm" style={{ color: "var(--text-muted)" }}>
            No photos in this category.
          </div>
        ) : (
          <div
            className="grid gap-2.5"
            style={{
              gridTemplateColumns: "1fr 1fr 1fr",
              gridAutoRows: "auto",
            }}
          >
            {filtered.map((img, i) => {
              const kind = getCellClass(i, activeCat);
              return (
                <button
                  key={img.src}
                  onClick={() => openLb(i)}
                  className="relative overflow-hidden group focus:outline-none focus-visible:ring-2"
                  style={{
                    borderRadius: kind === "hero" ? 14 : 12,
                    background: "#111118",
                    gridColumn: kind === "hero" ? "1 / 3" : undefined,
                    gridRow: kind === "hero" || kind === "tall" ? "span 2" : undefined,
                    aspectRatio: kind === "hero" ? "16/10" : kind === "tall" ? "3/4" : "4/3",
                    border: "0.5px solid var(--border)",
                    focusRingColor: "var(--accent)",
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-75"
                  />

                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex flex-col justify-end p-3.5"
                    style={{
                      background: "linear-gradient(160deg, transparent 40%, rgba(0,0,0,0.72) 100%)",
                    }}
                  >
                    <p
                      className="text-sm text-white leading-tight m-0"
                      style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                      {img.title}
                    </p>
                    <p className="text-[10px] mt-1 m-0 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                      {img.cat}
                    </p>
                  </div>

                  {i === 0 && (
                    <div
                      className="absolute top-3.5 left-3.5 text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium"
                      style={{
                        color: "var(--accent)",
                        background: "rgba(249, 115, 22, 0.15)",
                        border: "0.5px solid rgba(249, 115, 22, 0.3)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      Featured
                    </div>
                  )}

                  <span
                    className="absolute top-2.5 right-2.5 text-[10px] px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "rgba(255,255,255,0.35)", background: "rgba(0,0,0,0.3)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div
                    className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300 ease-out"
                    style={{ background: "var(--accent)", transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lbIdx !== null && (
        <div
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
          style={{ background: "rgba(8,8,14,0.88)", backdropFilter: "blur(12px)" }}
          onClick={closeLb}
        >
          <div
            className="relative"
            style={{ maxWidth: 740, maxHeight: "72vh", width: "calc(100% - 48px)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filtered[lbIdx].src}
              alt={filtered[lbIdx].title}
              className="block"
              style={{
                maxWidth: "100%",
                maxHeight: "72vh",
                borderRadius: 16,
                objectFit: "contain",
                boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
              }}
            />
          </div>

          <div className="mt-5 text-center" onClick={(e) => e.stopPropagation()}>
            <p
              className="text-[22px] m-0"
              style={{ fontFamily: "'DM Serif Display', serif", color: "#f0f0f0", letterSpacing: "-0.01em" }}
            >
              {filtered[lbIdx].title}
            </p>
            <p className="text-[12px] mt-1.5 m-0 uppercase tracking-widest" style={{ color: "rgba(240,240,240,0.4)" }}>
              {filtered[lbIdx].cat}&nbsp;&nbsp;·&nbsp;&nbsp;
              {String(lbIdx + 1).padStart(2, "0")} / {String(filtered.length).padStart(2, "0")}
            </p>
          </div>

          <div className="flex items-center gap-2.5 mt-5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => navLb(-1)}
              aria-label="Previous"
              className="w-9 h-9 rounded-full flex items-center justify-center text-base transition-all duration-150"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(249,115,22,0.2)";
                e.currentTarget.style.borderColor = "rgba(249,115,22,0.5)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              ←
            </button>

            <div className="flex items-center gap-1.5 px-1.5">
              {filtered.map((_, di) => (
                <div
                  key={di}
                  onClick={() => setLbIdx(di)}
                  className="h-[5px] rounded-full cursor-pointer transition-all duration-200"
                  style={{
                    width: di === lbIdx ? 16 : 5,
                    background: di === lbIdx ? "var(--accent)" : "rgba(255,255,255,0.22)",
                    borderRadius: 100,
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => navLb(1)}
              aria-label="Next"
              className="w-9 h-9 rounded-full flex items-center justify-center text-base transition-all duration-150"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(249,115,22,0.2)";
                e.currentTarget.style.borderColor = "rgba(249,115,22,0.5)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              →
            </button>
          </div>

          <button
            onClick={closeLb}
            aria-label="Close lightbox"
            className="fixed top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.65)",
            }}
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
