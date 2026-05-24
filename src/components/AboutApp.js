"use client";
import { stats } from "../data/projects";
import { FiGithub, FiLinkedin } from "react-icons/fi";

export default function AboutApp() {
  return (
    <div className="h-full overflow-auto p-8">
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 via-rose-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-orange-500/20 mb-4">
            YJ
          </div>
          <h2 className="text-2xl font-bold text-primary">Youssef Jarray</h2>
          <p className="text-sm font-medium mt-1" style={{ color: "var(--accent)" }}>Software Engineering Student</p>
          <p className="text-xs text-muted mt-1">EPI · VR &amp; Game Engineering</p>
        </div>

        <div className="space-y-4 text-sm text-secondary leading-relaxed">
          <p>
            Software Engineering student at EPI with a Bachelor&apos;s in Computer Science,
            now pursuing <span className="font-medium" style={{ color: "var(--accent)" }}>VR &amp; Game Engineering</span>.
          </p>
          <p>
            I build real-time experiences \u2014 from Unity games to web apps \u2014 and care deeply about
            performance, clean architecture, and technology that feels good to use.
          </p>
          <p>
            Currently building <span className="font-medium" style={{ color: "var(--accent)" }}>FitVR</span>, a VR fitness
            game in Unity 6. Always learning, always shipping.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-surface rounded-xl p-4 text-center border border-subtle transition-all duration-150 hover:brightness-110 btn-hover"
            >
              <div className="text-xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-[10px] text-muted mt-1 uppercase tracking-wider font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-subtle flex items-center justify-center gap-4">
          <a href="https://github.com/YoussefJarray" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted hover:text-accent transition-all duration-150 btn-hover">
            <FiGithub size={14} /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/youssef-jarray-410227112/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted hover:text-accent transition-all duration-150 btn-hover">
            <FiLinkedin size={14} /> LinkedIn
          </a>
        </div>

        <div className="mt-8 pt-6 border-t border-subtle text-center">
          <p className="text-xs font-medium text-muted uppercase tracking-wider mb-3">Favourite Spotify</p>
          <a
            href="https://open.spotify.com/user/7fe7uhw6svr2vla0ts3mni2np"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-150 btn-hover"
            style={{ background: "#1db954", color: "white" }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
            Listen on Spotify
          </a>
        </div>
      </div>
    </div>
  );
}
