"use client";
import { useEffect, useRef, useState } from "react";
import { stats, skillCategories } from "../data/projects";
import { FiGithub, FiLinkedin, FiCode, FiGamepad } from "react-icons/fi";

function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function AnimatedGradient() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.08]" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)", animation: "pulse-grad 8s ease-in-out infinite" }} />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #a855f7, transparent 70%)", animation: "pulse-grad 10s ease-in-out infinite reverse" }} />
    </div>
  );
}

export default function AboutApp() {
  const [headRef, headIn] = useInView(0.2);
  const [bioRef, bioIn] = useInView(0.2);
  const [statsRef, statsIn] = useInView(0.2);
  const [skillsRef, skillsIn] = useInView(0.2);

  return (
    <div className="h-full overflow-auto relative">
      <AnimatedGradient />

      <div className="max-w-lg mx-auto px-6 py-10 relative">
        {/* Profile */}
        <div
          ref={headRef}
          className="flex flex-col items-center text-center mb-8"
          style={{ opacity: headIn ? 1 : 0, transform: headIn ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1)" }}
        >
          <div className="relative mb-4 group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 via-rose-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-orange-500/20 transition-transform duration-300 group-hover:scale-110 cursor-default">
              YJ
            </div>
            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ border: "2px solid var(--accent)", animation: "pulse-ring 2s ease-out infinite" }} />
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Youssef Jarray</h2>
          <p className="text-sm font-medium mt-1" style={{ color: "var(--accent)" }}>Student · Game Dev</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>EPI · VR &amp; Game Engineering</p>
        </div>

        {/* Bio */}
        <div
          ref={bioRef}
          className="space-y-4 text-sm leading-relaxed mb-8"
          style={{ color: "var(--text-secondary)", opacity: bioIn ? 1 : 0, transform: bioIn ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.1s" }}
        >
          <p>
            Student at EPI trying to break into <span className="font-medium" style={{ color: "var(--accent)" }}>game development</span>.
            My main language is <span className="font-medium" style={{ color: "var(--accent)" }}>C#</span>, and I live in Unity.
          </p>
          <p>
            I build real-time experiences — VR games, prototypes, tools — anything that lets me
            push pixels and learn something new. Right now that&apos;s <span className="font-medium" style={{ color: "var(--accent)" }}>FitVR</span>,
            a VR fitness game built in Unity 6.
          </p>
        </div>

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-4 gap-2 mb-8"
          style={{ opacity: statsIn ? 1 : 0, transform: statsIn ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.2s" }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-3 text-center transition-all duration-200 cursor-default"
              style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 20px rgba(249,115,22,0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div className="text-lg font-bold" style={{ background: "linear-gradient(135deg, var(--accent), #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {stat.value}
              </div>
              <div className="text-[9px] mt-0.5 uppercase tracking-wider font-medium" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div
          ref={skillsRef}
          className="mb-8"
          style={{ opacity: skillsIn ? 1 : 0, transform: skillsIn ? "translateY(0)" : "translateY(16px)", transition: "all 0.7s cubic-bezier(.22,1,.36,1) 0.3s" }}
        >
          {skillCategories.map((cat) => (
            <div key={cat.title} className="mb-4 last:mb-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>{cat.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {cat.skills.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] px-2.5 py-1 rounded-md transition-all duration-150 cursor-default"
                    style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-light)"; e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Socials */}
        <div className="flex items-center justify-center gap-4 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <a
            href="https://github.com/YoussefJarray" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all duration-200"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
          >
            <FiGithub size={14} /> GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/youssef-jarray-410227112/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all duration-200"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.background = "var(--bg-elevated)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
          >
            <FiLinkedin size={14} /> LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
