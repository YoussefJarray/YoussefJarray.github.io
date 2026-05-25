import { spawn } from "child_process";
import { createServer } from "http";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "public", "screenshots");
const htmlFile = join(__dirname, "generate-screenshots.html");

mkdirSync(outDir, { recursive: true });

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

// Start a simple HTTP server for the HTML file
function serve() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const filePath = join(dirname(htmlFile), req.url === "/" ? "generate-screenshots.html" : req.url);
      const ext = extname(filePath);
      try {
        const data = readFileSync(filePath);
        res.writeHead(200, { "Content-Type": MIME[ext] || "text/plain" });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end("Not found");
      }
    });
    server.listen(0, () => {
      const port = server.address().port;
      console.log(`Server on http://localhost:${port}`);
      resolve({ server, port });
    });
  });
}

async function capture(url, output, { width, height } = { width: 1920, height: 1080 }) {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const args = [
    `--headless=new`,
    `--disable-gpu`,
    `--no-sandbox`,
    `--window-size=${width},${height}`,
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
    setTimeout(() => reject(new Error("Timed out")), 30000);
  });
}

async function main() {
  const { server, port } = await serve();

  const shots = [
    { name: "desktop-full.png", url: `http://localhost:${port}`, w: 1440, h: 800 },
  ];

  try {
    for (const shot of shots) {
      console.log(`  Capturing ${shot.name}...`);
      const outPath = join(outDir, shot.name);
      await capture(shot.url, outPath, { width: shot.w, height: shot.h });
      console.log(`  ✓ ${shot.name}`);
    }

    // Also capture individual screens at specific selectors by navigating
    console.log("  Capturing start menu screen...");
    await capture(`http://localhost:${port}#startmenu`, join(outDir, "start-menu.png"), { width: 800, height: 600 });
    console.log("  ✓ start-menu.png");

    console.log("  Capturing popups screen...");
    await capture(`http://localhost:${port}#popups`, join(outDir, "system-tray.png"), { width: 700, height: 400 });
    console.log("  ✓ system-tray.png");

    console.log("  Capturing mobile view...");
    await capture(`http://localhost:${port}#mobile`, join(outDir, "mobile-view.png"), { width: 500, height: 900 });
    console.log("  ✓ mobile-view.png");

    console.log("\nDone! Screenshots saved to public/screenshots/");
  } catch (err) {
    console.error("Failed:", err.message);
  } finally {
    server.close();
    process.exit(0);
  }
}

main();
