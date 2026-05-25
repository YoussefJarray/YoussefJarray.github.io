import {
  DoomIcon, PongIcon, TicTacToeIcon, SudokuIcon, PdfIcon,
  CalculatorIcon, MinesweeperIcon, MemoryIcon, PaintIcon, GitHubIcon,
} from "../components/icons/GameIcons";

function SnakeIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5" cy="5" r="2" fill="var(--accent, #22c55e)"/>
      <circle cx="10" cy="5" r="2" fill="var(--accent, #22c55e)"/>
      <circle cx="15" cy="5" r="2" fill="var(--accent, #22c55e)"/>
      <circle cx="15" cy="10" r="2" fill="var(--accent, #22c55e)"/>
      <circle cx="15" cy="15" r="2" fill="var(--accent, #22c55e)"/>
      <circle cx="15" cy="20" r="2" fill="var(--accent, #22c55e)"/>
      <circle cx="10" cy="20" r="2" fill="var(--accent, #22c55e)"/>
      <circle cx="7" cy="20" r="2.5" fill="none" stroke="#ef4444" strokeWidth="1.5"/>
    </svg>
  );
}

function BreakoutIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="4" height="2.5" rx="0.5" fill="#f97316"/>
      <rect x="10" y="3" width="4" height="2.5" rx="0.5" fill="#ef4444"/>
      <rect x="17" y="3" width="4" height="2.5" rx="0.5" fill="#eab308"/>
      <rect x="3" y="7" width="4" height="2.5" rx="0.5" fill="#34d399"/>
      <rect x="10" y="7" width="4" height="2.5" rx="0.5" fill="#3b82f6"/>
      <rect x="17" y="7" width="4" height="2.5" rx="0.5" fill="#a855f7"/>
      <rect x="3" y="11" width="4" height="2.5" rx="0.5" fill="#ec4899"/>
      <circle cx="16" cy="17" r="1.5" fill="currentColor"/>
      <rect x="6" y="19" width="8" height="2" rx="1" fill="currentColor"/>
    </svg>
  );
}

const sizes = { sm: 14, md: 22, lg: 28, xl: 36 };

function PhotosIcon({ size, dark }) {
  const stroke = dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)";
  const fill = dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 19"/>
    </svg>
  );
}

function FolderIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z"/>
    </svg>
  );
}

function FileIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function TerminalIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5"/>
      <line x1="12" y1="19" x2="20" y2="19"/>
    </svg>
  );
}

function UserIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function SettingsIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  );
}

function GlobeIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

function TypingIcon({ size }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <line x1="6" y1="10" x2="8" y2="10"/>
      <line x1="10" y1="10" x2="12" y2="10"/>
      <line x1="14" y1="10" x2="16" y2="10"/>
      <line x1="6" y1="14" x2="12" y2="14"/>
      <line x1="14" y1="14" x2="18" y2="14"/>
    </svg>
  );
}

const emoji = {
  folder: "\uD83D\uDCC1",
  files: "\uD83D\uDCC1",
  file: "\uD83D\uDCC4",
  terminal: "\u276F_",
  user: "\uD83D\uDC64",
  about: "\uD83D\uDC64",
  settings: "\u2699\uFE0F",
  browser: "\uD83C\uDF10",
  photos: null,
  resume: "\uD83D\uDCC4",
};

const baseIcons = {
  folder: FolderIcon,
  files: FolderIcon,
  file: FileIcon,
  terminal: TerminalIcon,
  user: UserIcon,
  about: UserIcon,
  settings: SettingsIcon,
  browser: GlobeIcon,
  resume: FileIcon,
  typing: TypingIcon,
};

const gameComponents = {
  doom: DoomIcon,
  pong: PongIcon,
  tictactoe: TicTacToeIcon,
  sudoku: SudokuIcon,
  pdf: PdfIcon,
  calculator: CalculatorIcon,
  minesweeper: MinesweeperIcon,
  memory: MemoryIcon,
  paint: PaintIcon,
  githubstats: GitHubIcon,
  snake: SnakeIcon,
  breakout: BreakoutIcon,
};

function renderIcon(id, pixelSize, dark) {
  if (id === "photos") return <PhotosIcon size={pixelSize} dark={dark} />;
  const GameComp = gameComponents[id];
  if (GameComp) return <GameComp size={pixelSize} />;
  const BaseComp = baseIcons[id];
  if (BaseComp) return <BaseComp size={pixelSize} />;
  return "\uD83D\uDCC4";
}

export function getAppIcon(id, size = "md", dark = true) {
  const px = sizes[size] || 22;
  return renderIcon(id, px, dark);
}

export function getSmallIcon(id) {
  return getAppIcon(id, "sm");
}

export function getDesktopIcon(id, dark = true) {
  return renderIcon(id, 28, dark);
}

export function getIconComponent(id) {
  return gameComponents[id] || null;
}

export function getEmoji(id) {
  return emoji[id] || "\uD83D\uDCC4";
}

export const allIconIds = Object.keys({ ...emoji, ...gameComponents }).filter(Boolean);
