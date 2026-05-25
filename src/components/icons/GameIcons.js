export function DoomIcon({ size = 16 }) {
  return (
    <img src="/icons/doom.png" alt="Doom" width={size} height={size} className="shrink-0" style={{ objectFit: "contain" }} />
  );
}

export function PongIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="shrink-0">
      <rect x="2" y="5" width="2.5" height="8" rx="1" fill="currentColor" />
      <rect x="19.5" y="7" width="2.5" height="8" rx="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function TicTacToeIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="shrink-0">
      <rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8.5" y1="2" x2="8.5" y2="22" stroke="currentColor" strokeWidth="1.2" />
      <line x1="15.5" y1="2" x2="15.5" y2="22" stroke="currentColor" strokeWidth="1.2" />
      <line x1="2" y1="8.5" x2="22" y2="8.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="2" y1="15.5" x2="22" y2="15.5" stroke="currentColor" strokeWidth="1.2" />
      <line x1="5.5" y1="5.5" x2="11.5" y2="11.5" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
      <line x1="11.5" y1="5.5" x2="5.5" y2="11.5" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
      <circle cx="18" cy="18" r="3.2" fill="none" stroke="#34d399" strokeWidth="2" />
    </svg>
  );
}

export function PdfIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="shrink-0">
      <rect x="3" y="2" width="18" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="7" y1="7" x2="17" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="7" y1="15" x2="13" y2="15" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M17 17l2 2-2 2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 19h-5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function SudokuIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="shrink-0">
      <rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="6.5" y1="2" x2="6.5" y2="22" stroke="currentColor" strokeWidth="1" />
      <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" />
      <line x1="17.5" y1="2" x2="17.5" y2="22" stroke="currentColor" strokeWidth="1" />
      <line x1="2" y1="6.5" x2="22" y2="6.5" stroke="currentColor" strokeWidth="1" />
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="17.5" x2="22" y2="17.5" stroke="currentColor" strokeWidth="1" />
      <text x="4.5" y="6" fontSize="3.2" fill="var(--accent, #f97316)" fontWeight="700" fontFamily="Arial">1</text>
      <text x="10.2" y="10.5" fontSize="3.2" fill="var(--accent, #f97316)" fontWeight="700" fontFamily="Arial">2</text>
      <text x="15.8" y="16.5" fontSize="3.2" fill="var(--accent, #f97316)" fontWeight="700" fontFamily="Arial">3</text>
    </svg>
  );
}

export function CalculatorIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="shrink-0">
      <rect x="3" y="2" width="18" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5" y="4" width="14" height="6" rx="1" fill="currentColor" opacity="0.15" />
      <text x="7" y="9" fontSize="5" fill="currentColor" fontWeight="700" fontFamily="Arial">123</text>
      <text x="7" y="16" fontSize="5" fill="var(--accent, #f97316)" fontWeight="700" fontFamily="Arial">+</text>
      <text x="13" y="16" fontSize="5" fill="var(--accent, #f97316)" fontWeight="700" fontFamily="Arial">-</text>
      <text x="7" y="21" fontSize="5" fill="var(--accent, #f97316)" fontWeight="700" fontFamily="Arial">×</text>
      <text x="13" y="21" fontSize="5" fill="var(--accent, #f97316)" fontWeight="700" fontFamily="Arial">÷</text>
    </svg>
  );
}

export function MinesweeperIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="shrink-0">
      <rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2" />
      <circle cx="12" cy="12" r="1.5" fill="var(--accent, #f97316)" />
      <line x1="12" y1="4" x2="12" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="4" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="16" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function GitHubIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="shrink-0" fill="none">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
    </svg>
  );
}

export function PaintIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="shrink-0">
      <rect x="3" y="3" width="18" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 17v4M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="10" r="3" fill="var(--accent, #f97316)" />
      <circle cx="8" cy="7" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="16" cy="7" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="12" cy="6" r="1" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

export function MemoryIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className="shrink-0">
      <rect x="2" y="2" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="2" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="13" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="13" y="13" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="4.5" y="9" fontSize="6" fill="var(--accent, #f97316)">?</text>
      <text x="15.5" y="9" fontSize="6" fill="var(--accent, #f97316)">?</text>
      <text x="4.5" y="20" fontSize="6" fill="var(--accent, #f97316)">?</text>
      <text x="15.5" y="20" fontSize="6" fill="var(--accent, #f97316)">?</text>
    </svg>
  );
}
