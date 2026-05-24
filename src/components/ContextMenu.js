"use client";
import { useEffect, useRef } from "react";

export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onClose]);

  useEffect(() => {
    const handle = () => onClose();
    window.addEventListener("scroll", handle, { once: true });
    return () => window.removeEventListener("scroll", handle);
  }, [onClose]);

  const clampedX = Math.min(x, window.innerWidth - 180);
  const clampedY = Math.min(y, window.innerHeight - items.length * 36 - 8);

  return (
    <div
      ref={ref}
      className="fixed z-[9999] rounded-xl shadow-2xl border border-subtle overflow-hidden py-1"
      style={{
        left: clampedX,
        top: clampedY,
        minWidth: 160,
        background: "var(--menu-bg)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        animation: "fadeSlideIn 0.1s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {items.map((item, i) =>
        item.divider ? (
          <div key={i} className="my-1 border-t border-subtle" />
        ) : (
          <button
            key={i}
            onClick={() => { item.onClick(); onClose(); }}
            className="flex items-center gap-2.5 w-full text-left px-4 py-1.5 text-xs transition-all duration-100 btn-hover"
            style={{
              color: item.danger ? "#ef4444" : "var(--text-secondary)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-hover)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            {item.icon && <span className="text-sm">{item.icon}</span>}
            <span className={item.danger ? "text-[#ef4444]" : ""}>{item.label}</span>
          </button>
        )
      )}
    </div>
  );
}
