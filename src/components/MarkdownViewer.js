"use client";
import { useMemo, useState, useRef, useCallback } from "react";
import { useWindowStore } from "../store/windowStore";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import { FiCalendar, FiTag, FiExternalLink, FiGithub, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { renderInline, parseMarkdown, headingStyles } from "../utils/markdown";

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildToc(blocks) {
  const toc = [];
  for (const block of blocks) {
    if (block.type === "h1" || block.type === "h2" || block.type === "h3" || block.type === "h4") {
      toc.push({ level: parseInt(block.type[1]), text: block.text, id: slugify(renderInline(block.text).replace(/<[^>]*>/g, "")) });
    }
  }
  return toc;
}

export default function MarkdownViewer({ isMobile }) {
  const windows = useWindowStore((s) => s.windows);
  const win = Object.values(windows).find((w) => w.app === "MarkdownViewer" && w.isOpen);
  const data = win?.data;

  const blocks = useMemo(() => data?.meta?.content ? parseMarkdown(data.meta.content) : [], [data]);
  const toc = useMemo(() => buildToc(blocks), [blocks]);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const contentRef = useRef(null);

  const scrollToHeading = useCallback((id) => {
    const el = contentRef.current?.querySelector(`[data-heading-id="${id}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-muted text-xs">
        No file open
      </div>
    );
  }

  const meta = data.meta || {};

  return (
    <div className="h-full flex" style={{ background: "var(--bg-surface)" }}>
      <div
        className="relative shrink-0 border-r transition-all duration-200 overflow-hidden flex flex-col"
        style={{
          width: sidebarOpen ? 200 : 0,
          borderColor: "var(--border)",
          minWidth: sidebarOpen ? 200 : 0,
          opacity: sidebarOpen ? 1 : 0,
        }}
      >
        <div className="p-3 text-[10px] font-semibold uppercase tracking-wider shrink-0" style={{ color: "var(--text-muted)" }}>
          Sections
        </div>
        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {toc.length === 0 && (
            <div className="text-[10px] px-2 py-1" style={{ color: "var(--text-muted)" }}>No headings</div>
          )}
          {toc.map((h, i) => (
            <button
              key={i}
              onClick={() => scrollToHeading(h.id)}
              className="block w-full text-left text-[10px] px-2 py-1 rounded-md truncate transition-all hover:bg-white/5"
              style={{
                color: "var(--text-secondary)",
                paddingLeft: `${12 + (h.level - 1) * 12}px`,
              }}
            >
              {h.text}
            </button>
          ))}
        </div>
      </div>

      <div ref={contentRef} className="flex-1 overflow-auto relative">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="absolute z-10 p-1 rounded-md transition-all hover:bg-white/10"
          style={{
            top: 8,
            left: 8,
            color: "var(--text-muted)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? <FiChevronLeft size={12} /> : <FiChevronRight size={12} />}
        </button>
        <div className="p-8 max-w-3xl mx-auto">
          {meta.thumbnail && (
            <div className="mb-6 rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--bg-root)", aspectRatio: "16/9" }}>
              <img src={meta.thumbnail} alt={meta.title || ""} className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
          {(meta.title || meta.date) && (
            <header className="mb-8 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
              {meta.date && (
                <div className="flex items-center gap-1.5 text-[10px] mb-2" style={{ color: "var(--text-muted)" }}>
                  <FiCalendar size={11} />
                  <span>{meta.date}</span>
                </div>
              )}
              {meta.title && (
                <h1 className="text-xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
                  {meta.title}
                </h1>
              )}
              {meta.desc && (
                <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {meta.desc}
                </p>
              )}
              {meta.excerpt && (
                <p className="text-xs mt-2 leading-relaxed italic" style={{ color: "var(--text-muted)" }}>
                  {meta.excerpt}
                </p>
              )}
              {meta.tags && meta.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {meta.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${meta.color || "var(--accent)"}15`, color: meta.color || "var(--accent)" }}>
                      <FiTag size={8} />
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {meta.href && (
                <a href={meta.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[10px] font-medium px-3 py-1.5 rounded-lg mt-3 transition-all duration-150 btn-hover" style={{ background: `${meta.color}15`, color: meta.color }}>
                  <FiGithub size={11} />
                  View on GitHub
                  <FiExternalLink size={9} />
                </a>
              )}
            </header>
          )}

          <div className="space-y-3.5">
            {blocks.map((block, i) => {
              switch (block.type) {
                case "h1":
                case "h2":
                case "h3":
                case "h4": {
                  const text = renderInline(block.text);
                  const id = slugify(text.replace(/<[^>]*>/g, ""));
                  return (
                    <div key={i} data-heading-id={id} className={headingStyles[block.type]} style={{ color: "var(--text-primary)", borderBottom: block.type === "h1" || block.type === "h2" ? "1px solid var(--border)" : "none" }}>
                      <span dangerouslySetInnerHTML={{ __html: text }} />
                    </div>
                  );
                }
                case "p":
                  return (
                    <p key={i} className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }} dangerouslySetInnerHTML={{ __html: renderInline(block.text) }} />
                  );
                case "ul":
                  return (
                    <ul key={i} className="space-y-1">
                      {block.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ background: "var(--accent)" }} />
                          <span dangerouslySetInnerHTML={{ __html: renderInline(item) }} />
                        </li>
                      ))}
                    </ul>
                  );
                case "img":
                  return (
                    <div key={i} style={{ textAlign: "center" }}>
                      <img src={block.src} alt={block.alt} style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid var(--border)" }} loading="lazy" />
                    </div>
                  );
                case "code": {
                  const highlighted = hljs.highlightAuto(block.code).value;
                  return (
                    <div key={i} className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                      {block.lang && (
                        <div className="px-4 py-1.5 text-[9px] font-medium uppercase tracking-wider" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                          {block.lang}
                        </div>
                      )}
                      <pre className="overflow-x-auto" style={{ background: "var(--bg-root)" }}>
                        <code className="hljs block px-4 py-3.5 text-xs leading-relaxed font-mono whitespace-pre" dangerouslySetInnerHTML={{ __html: highlighted }} />
                      </pre>
                    </div>
                  );
                }
                default:
                  return null;
              }
            })}
          </div>

          {meta.content && !meta.title && blocks.length === 0 && (
            <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono" style={{ color: "var(--text-secondary)" }}>
              {meta.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
