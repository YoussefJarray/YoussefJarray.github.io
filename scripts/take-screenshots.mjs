import { spawn } from "child_process";
import { createServer } from "http";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "screenshots");

mkdirSync(outDir, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForServer(url, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await sleep(1000);
  }
  throw new Error("Server didn't start in time");
}

async function capture(url, output, selector, viewport = { width: 1920, height: 1080 }) {
  // Use Chrome headless via command line
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const args = [
    `--headless=new`,
    `--disable-gpu`,
    `--no-sandbox`,
    `--window-size=${viewport.width},${viewport.height}`,
    `--screenshot=${output}`,
    `--hide-scrollbars`,
    url,
  ];

  return new Promise((resolve, reject) => {
    const proc = spawn(chromePath, args, { stdio: "ignore" });
    proc.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Chrome exited with code ${code}`));
    });
    proc.on("error", reject);
  });
}

async function main() {
  console.log("Starting dev server...");
  const server = spawn("npx.cmd", ["next", "dev", "-p", "3999"], {
    cwd: root,
    stdio: "pipe",
    shell: true,
  });

  server.stderr.on("data", (d) => process.stderr.write(d));

  try {
    await waitForServer("http://localhost:3999");
    console.log("Dev server ready. Taking screenshots...");

    // Screenshot 1: Full desktop
    console.log("  Capturing full desktop...");
    await capture(
      "http://localhost:3999",
      join(outDir, "desktop-full.png"),
      null,
      { width: 1920, height: 1080 }
    );
    console.log("  ✓ desktop-full.png");

    // Wait for animations to settle
    await sleep(2000);

    console.log("  Capturing desktop with apps open...");
    // We can't easily click things, but we can take a clean screenshot
    await capture(
      "http://localhost:3999",
      join(outDir, "desktop-clean.png"),
      null,
      { width: 1920, height: 1080 }
    );
    console.log("  ✓ desktop-clean.png");

    console.log("Screenshots saved to public/screenshots/");
  } catch (err) {
    console.error("Failed:", err.message);
  } finally {
    server.kill("SIGTERM");
    // Force kill after 5s
    setTimeout(() => { server.kill("SIGKILL"); process.exit(0); }, 5000);
  }
}

main();
