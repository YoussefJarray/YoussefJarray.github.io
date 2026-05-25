import { FiFolder, FiTerminal, FiUser, FiSettings, FiGlobe, FiMonitor, FiGrid, FiEdit3, FiStar, FiImage, FiPlay, FiCode } from "react-icons/fi";
import { getAppIcon, getEmoji } from "./iconRegistry";

const appIcons = new Proxy({}, {
  get(_, id) {
    if (typeof id !== "string") return "\uD83D\uDCC4";
    const icon = getAppIcon(id, "sm");
    return icon || "\uD83D\uDCC4";
  },
});

export const allApps = [
  { id: "files", title: "Projects", cat: ["favorites", "development"], desc: "Browse projects" },
  { id: "terminal", title: "Terminal", cat: ["favorites", "development"], desc: "Command line" },
  { id: "about", title: "About Me", cat: ["system"], desc: "Personal info" },
  { id: "browser", title: "Web Browser", cat: ["favorites", "internet"], desc: "Browse the web" },
  { id: "photos", title: "Photos", cat: ["favorites", "graphics"], desc: "Image gallery" },
  { id: "settings", title: "Settings", cat: ["system"], desc: "Preferences" },
  { id: "doom", title: "Doom", cat: ["favorites", "games"], desc: "Raycasting FPS" },
  { id: "pong", title: "Pong", cat: ["favorites", "games"], desc: "Classic paddle ball" },
  { id: "tictactoe", title: "Tic-Tac-Toe", cat: ["games"], desc: "3-in-a-row" },
  { id: "sudoku", title: "Sudoku", cat: ["games"], desc: "Number puzzle" },
  { id: "snake", title: "Snake", cat: ["games"], desc: "Classic snake game" },
  { id: "breakout", title: "Breakout", cat: ["games"], desc: "Break the bricks" },
  { id: "typing", title: "Typing Test", cat: ["favorites", "games"], desc: "Test your typing speed" },
  { id: "resume", title: "Resume", cat: ["system"], desc: "View my CV" },
  { id: "calculator", title: "Calculator", cat: ["favorites", "system"], desc: "Do math" },
  { id: "minesweeper", title: "Minesweeper", cat: ["games"], desc: "Find the mines" },
  { id: "githubstats", title: "GitHub Stats", cat: ["favorites", "development", "internet"], desc: "Browse repos" },
  { id: "memory", title: "Memory", cat: ["games"], desc: "Match the cards" },
  { id: "paint", title: "Paint", cat: ["favorites", "graphics"], desc: "Drawing app" },
];

export const desktopItems = [
  { id: "files", icon: "files", label: "Projects" },
  { id: "terminal", icon: "terminal", label: "Terminal" },
  { id: "about", icon: "about", label: "About Me" },
  { id: "browser", icon: "browser", label: "Web Browser" },
  { id: "photos", icon: "photos", label: "Photos" },
  { id: "settings", icon: "settings", label: "Settings" },
  { id: "doom", icon: "doom", label: "Doom" },
  { id: "pong", icon: "pong", label: "Pong" },
  { id: "tictactoe", icon: "tictactoe", label: "Tic-Tac-Toe" },
  { id: "sudoku", icon: "sudoku", label: "Sudoku" },
  { id: "snake", icon: "snake", label: "Snake" },
  { id: "breakout", icon: "breakout", label: "Breakout" },
  { id: "typing", icon: "typing", label: "Typing Test" },
  { id: "resume", icon: "resume", label: "Resume" },
  { id: "calculator", icon: "calculator", label: "Calculator" },
  { id: "minesweeper", icon: "minesweeper", label: "Minesweeper" },
  { id: "githubstats", icon: "githubstats", label: "GitHub Stats" },
  { id: "memory", icon: "memory", label: "Memory" },
  { id: "paint", icon: "paint", label: "Paint" },
];

export const dockApps = [
  { id: "files", icon: FiFolder, label: "Projects" },
  { id: "terminal", icon: FiTerminal, label: "Terminal" },
  { id: "about", icon: FiUser, label: "About Me" },
  { id: "browser", icon: FiGlobe, label: "Web Browser" },
  { id: "settings", icon: FiSettings, label: "Settings" },
  { id: "doom", icon: FiMonitor, label: "Doom" },
  { id: "minesweeper", icon: FiGrid, label: "Minesweeper" },
  { id: "paint", icon: FiEdit3, label: "Paint" },
  { id: "typing", icon: FiEdit3, label: "Typing" },
];

export const categories = [
  { id: "favorites", label: "Favorites", icon: FiStar },
  { id: "development", label: "Development", icon: FiCode },
  { id: "internet", label: "Internet", icon: FiGlobe },
  { id: "graphics", label: "Graphics", icon: FiImage },
  { id: "games", label: "Games", icon: FiPlay },
  { id: "system", label: "System", icon: FiMonitor },
];

export function getAppsByCategory(category) {
  return allApps.filter((a) => a.cat.includes(category));
}

export function getBigIcon(id) {
  return getAppIcon(id, "md");
}

export default appIcons;
