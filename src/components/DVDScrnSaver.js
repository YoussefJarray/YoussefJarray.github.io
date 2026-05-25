"use client";
import { useEffect, useRef, useState } from "react";

const LOGO_W = 120;
const LOGO_H = 48;
const COLORS = ["#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff","#ff8800","#8800ff"];

export default function DVDScrnSaver({ onDismiss }) {
  const containerRef = useRef(null);
  const stateRef = useRef({
    x: Math.random() * (typeof window !== "undefined" ? window.innerWidth - LOGO_W : 400),
    y: Math.random() * (typeof window !== "undefined" ? window.innerHeight - LOGO_H : 200),
    vx: 1.5, vy: 1.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  });
  const [color, setColor] = useState(stateRef.current.color);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let raf;
    const logo = container.querySelector("svg");

    const loop = () => {
      const st = stateRef.current;
      st.x += st.vx;
      st.y += st.vy;

      if (st.x <= 0 || st.x + LOGO_W >= window.innerWidth) {
        st.vx = -st.vx;
        st.x = Math.max(0, Math.min(st.x, window.innerWidth - LOGO_W));
        st.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        setColor(st.color);
      }
      if (st.y <= 0 || st.y + LOGO_H >= window.innerHeight) {
        st.vy = -st.vy;
        st.y = Math.max(0, Math.min(st.y, window.innerHeight - LOGO_H));
        st.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        setColor(st.color);
      }

      if (logo) {
        logo.style.transform = `translate(${st.x}px, ${st.y}px)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={containerRef}
      className="fixed inset-0 z-[9999]"
      style={{ background: "#000" }}
      onMouseMove={onDismiss}
      onClick={onDismiss}
      onKeyDown={onDismiss}
      tabIndex={0}
    >
      <svg width={LOGO_W} height={LOGO_H} viewBox="0 0 120 48" style={{ position: "absolute", top: 0, left: 0, willChange: "transform" }}>
        <rect width="120" height="48" rx="6" fill={color} />
        <text x="60" y="32" textAnchor="middle" fill="#000" fontFamily="Arial,sans-serif" fontSize="22" fontWeight="900" letterSpacing="4">YJ</text>
        <circle cx="8" cy="8" r="3" fill="#000" opacity="0.3" />
        <circle cx="112" cy="8" r="3" fill="#000" opacity="0.3" />
        <circle cx="8" cy="40" r="3" fill="#000" opacity="0.3" />
        <circle cx="112" cy="40" r="3" fill="#000" opacity="0.3" />
      </svg>
    </div>
  );
}
