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
