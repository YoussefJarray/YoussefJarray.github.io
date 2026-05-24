"use client";
import { useState, useRef, useEffect } from "react";
import { skillCategories, projects, socials } from "../data/projects";

const banner = String.raw`$$     $$\          $$\       $$ 
\$$\   $$  |         $$ |      \__|
 \$$\ $$  /$$\   $$\ $$ |  $$\ $$ 
  \$$$$  / $$ |  $$ |$$ | $$  |$$ |
   \$$  /  $$ |  $$ |$$$$$$  / $$ |
    $$ |   $$ |  $$ |$$  _$$<  $$ |
    $$ |   \$$$$$$  |$$ | \$$\ $$ |
    \__|    \______/ \__|  \__|\__|`;

const welcomeMessage = `Welcome to YUKI's Portfolio Terminal
Type 'help' for available commands.
`;

const helpText = `Available commands:
  about       - About me
  skills      - List technical skills
  projects    - Show featured projects
  contact     - Contact information
  socials     - Social media links
  whoami      - Display current user
  neofetch    - Display system info
  banner      - Show the banner again
  clear       - Clear terminal
  help        - Show this message
`;

const commands = {
  about: `Yuki
Developer & creative technologist.
Building real-time experiences with Unity, C++, and modern web technologies.`,

  skills: skillCategories
    .map((cat) => `  ${cat.title}: ${cat.skills.join(", ")}`)
    .join("\n"),

  projects: projects
    .map((p) => `  ${p.title}\n    ${p.desc}\n    ${p.href}`)
    .join("\n\n"),

  contact: `Email:    youssef@example.com
GitHub:   https://github.com/YoussefJarray
Location: Sousse, Tunisia`,

  socials: socials
    .map((s) => `  ${s.label}: ${s.href}`)
    .join("\n"),

  whoami: `yuki`,

  banner: banner,

  help: helpText,

  neofetch: `
         .-/+oossssoo+/-.               yuki@portfolio
       \`:+ssssssssssssssssss+:\`             ------------------------
     -+ssssssssssssssssssyyssss+-           OS: GNOME Linux 6.1 x86_64
   .ossssssssssssssssssdMMMNysssso.         Host: Portfolio Laptop
  /ssssssssssshdmmNNmmyNMMMMhssssss/        Kernel: 6.1.0-portfolio
 +ssssssssshmydMMMMMMMNddddyssssssss+       Uptime: 3 hours, 42 mins
/sssssssshNMMMyhhyyyyhmNMMMNhssssssss/      Packages: 420 (pacman)
.ssssssssdMMMNhsssssssssshNMMMdssssss.      Shell: bash 5.2.15
+sssshhhyNMMNyssssssssssssyNMMMysssss+      Resolution: 1920x1080
ossyNMMMNyMMhsssssssssssssshmmmhssssso      DE: GNOME 44.2
ossyNMMMNyMMhsssssssssssssshmmmhssssso      Terminal: gnome-terminal
+sssshhhyNMMNyssssssssssssyNMMMysssss+      CPU: Intel Core i7-13700K
.ssssssssdMMMNhsssssssssshNMMMdssssss.      GPU: NVIDIA RTX 4070
 /sssssssshNMMMyhhyyyyhdNMMMNhssssss/       Memory: 3242MiB / 16000MiB
  +sssssssssdmydMMMMMMMMddddyssssssss+
   /ssssssssssshdmNNNNmyNMMMMhssssss/
    .ossssssssssssssssssdMMMNysssso.
      -+sssssssssssssssssyyyssss+-
        \`:+ssssssssssssssssss+:\`
           .-/+oossssoo+/-.
`.trimStart(),
};

export default function Terminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([
    { type: "output", content: banner },
    { type: "output", content: welcomeMessage },
  ]);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIndex, setHistIndex] = useState(-1);

  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const processCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;
    if (trimmed === "clear") {
      setHistory([]);
      return;
    }
    const response = commands[trimmed];
    const output = response
      ? response
      : `bash: ${trimmed}: command not found. Type 'help' for available commands.`;
    setHistory((prev) => [
      ...prev,
      { type: "input", content: cmd },
      { type: "output", content: output },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input);
    setCmdHistory((prev) => [...prev, input]);
    setHistIndex(-1);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIndex = histIndex === -1 ? cmdHistory.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(newIndex);
      setInput(cmdHistory[newIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIndex === -1) return;
      const newIndex = histIndex + 1;
      if (newIndex >= cmdHistory.length) {
        setHistIndex(-1);
        setInput("");
      } else {
        setHistIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    }
  };

  return (
    <div
      className="h-full flex flex-col font-mono text-sm cursor-text"
      style={{ background: "var(--bg-surface)" }}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 px-4 py-2 text-[10px]" style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
        <span className="w-2 h-2 rounded-full bg-red-500/50 animate-pulse" />
        <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
        <span className="w-2 h-2 rounded-full bg-green-500/50" />
        <span className="ml-2" style={{ color: "var(--text-muted)" }}>yuki@portfolio: ~</span>
      </div>
      <div className="flex-1 overflow-auto p-4 pb-2">
        {history.map((entry, i) => (
          <div key={i} className="mb-1.5">
            {entry.type === "input" ? (
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-xs" style={{ color: "var(--accent)" }}>
                  yuki@portfolio:~$
                </span>
                <span style={{ color: "var(--text-primary)" }}>{entry.content}</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap ml-0 leading-relaxed font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                {entry.content}
              </pre>
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
          <span className="shrink-0 text-xs" style={{ color: "var(--accent)" }}>
            yuki@portfolio:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: "var(--text-primary)", caretColor: "var(--accent)" }}
            spellCheck={false}
            autoComplete="off"
            autoFocus
          />
        </form>
        <div ref={endRef} />
      </div>
    </div>
  );
}
