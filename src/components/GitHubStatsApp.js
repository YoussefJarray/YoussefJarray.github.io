"use client";
import { useState, useEffect } from "react";
import { FiStar, FiGitBranch, FiCode, FiExternalLink } from "react-icons/fi";

const GITHUB_USER = "YoussefJarray";

const REPO_CACHE_KEY = "portfolio-gh-repos";
const CACHE_DURATION = 30 * 60 * 1000;

const LANG_COLORS = {
  JavaScript: "#f7df1e", TypeScript: "#3178c6", Python: "#3572A5",
  "C#": "#178600", "C++": "#f34b7d", C: "#555555", Java: "#b07219",
  HTML: "#e34c26", CSS: "#563d7c", PHP: "#4F5D95", ShaderLab: "#222c37",
};

function useGitHubRepos() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem(REPO_CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setRepos(data);
          setLoading(false);
          return;
        }
      } catch {}
    }

    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=30`)
      .then((r) => {
        if (!r.ok) throw new Error(`GitHub API error: ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const filtered = data
          .filter((r) => !r.fork && r.name !== GITHUB_USER)
          .map((r) => ({
            name: r.name,
            desc: r.description || "No description",
            stars: r.stargazers_count,
            forks: r.forks_count,
            lang: r.language,
            url: r.html_url,
            topics: r.topics || [],
            updated: r.updated_at,
          }));
        setRepos(filtered);
        localStorage.setItem(REPO_CACHE_KEY, JSON.stringify({ data: filtered, timestamp: Date.now() }));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { repos, loading, error };
}

export default function GitHubStatsApp() {
  const { repos, loading, error } = useGitHubRepos();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const topLangs = [...new Set(repos.filter((r) => r.lang).map((r) => r.lang))].slice(0, 8);

  const filtered = repos.filter((r) => {
    if (filter === "starred" && r.stars === 0) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) && !(r.desc && r.desc.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col" style={{ background: "var(--bg-root)" }}>
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b" style={{ borderColor: "var(--border)" }}>
        {[
          { label: "Repositories", value: repos.length },
          { label: "Total Stars", value: totalStars },
          { label: "Languages", value: topLangs.length },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-2 rounded-lg" style={{ background: "var(--bg-elevated)" }}>
            <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</div>
            <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Language tags */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b" style={{ borderColor: "var(--border)" }}>
        {topLangs.map((lang) => (
          <span
            key={lang}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px]"
            style={{
              background: `${LANG_COLORS[lang] || "#888"}20`,
              color: LANG_COLORS[lang] || "#888",
              border: `1px solid ${LANG_COLORS[lang] || "#888"}40`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: LANG_COLORS[lang] || "#888" }} />
            {lang}
          </span>
        ))}
      </div>

      {/* Search/filter */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search repos..."
          className="flex-1 bg-transparent outline-none text-[10px] px-2 py-1 rounded"
          style={{ color: "var(--text-primary)" }}
        />
        <div className="flex gap-1">
          {["all", "starred"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-0.5 rounded text-[9px] transition-all ${filter === f ? "bg-accent/15 text-accent" : "hover:bg-white/10"}`}
              style={{ color: filter === f ? undefined : "var(--text-muted)" }}
            >
              {f === "all" ? "All" : "Starred"}
            </button>
          ))}
        </div>
      </div>

      {/* Repo list */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Loading repos...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-[10px]" style={{ color: "#ef4444" }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[10px]" style={{ color: "var(--text-muted)" }}>
            No repos found
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {filtered.map((repo) => (
              <a
                key={repo.name}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-all group"
                style={{ borderColor: "var(--border)" }}
              >
                <FiCode size={12} className="shrink-0" style={{ color: "var(--text-muted)" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {repo.name}
                    </span>
                    {repo.lang && (
                      <span className="flex items-center gap-1 text-[8px] px-1 py-0.5 rounded shrink-0" style={{ color: LANG_COLORS[repo.lang] || "#888" }}>
                        <span className="w-1 h-1 rounded-full" style={{ background: LANG_COLORS[repo.lang] || "#888" }} />
                        {repo.lang}
                      </span>
                    )}
                  </div>
                  {repo.desc && (
                    <div className="text-[9px] truncate mt-0.5" style={{ color: "var(--text-muted)" }}>{repo.desc}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {repo.stars > 0 && (
                      <span className="flex items-center gap-0.5 text-[8px]" style={{ color: "var(--text-muted)" }}>
                        <FiStar size={8} /> {repo.stars}
                      </span>
                    )}
                    {repo.forks > 0 && (
                      <span className="flex items-center gap-0.5 text-[8px]" style={{ color: "var(--text-muted)" }}>
                        <FiGitBranch size={8} /> {repo.forks}
                      </span>
                    )}
                    <span className="text-[8px]" style={{ color: "var(--text-muted)" }}>
                      Updated {new Date(repo.updated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <FiExternalLink size={10} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-muted)" }} />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-3 py-1 border-t text-[9px]"
        style={{ borderColor: "var(--border)", background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
        <span>github.com/{GITHUB_USER}</span>
        <span>{filtered.length} repos</span>
      </div>
    </div>
  );
}
