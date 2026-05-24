import { readdirSync, existsSync, writeFileSync, statSync } from "fs";
import { join, extname, parse } from "path";

const PHOTOS_DIR = "public/photos";
const IMG_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);

const entries = [];

if (existsSync(PHOTOS_DIR)) {
  for (const cat of readdirSync(PHOTOS_DIR)) {
    const catPath = join(PHOTOS_DIR, cat);
    if (!statSync(catPath).isDirectory()) continue;
    for (const file of readdirSync(catPath)) {
      const ext = extname(file).toLowerCase();
      if (!IMG_EXTS.has(ext)) continue;
      entries.push({
        src: `/photos/${cat}/${file}`,
        title: parse(file).name.replace(/[-_]/g, " "),
        cat,
      });
    }
  }
}

writeFileSync(join(PHOTOS_DIR, "index.json"), JSON.stringify(entries, null, 2));
console.log(`Generated photos index with ${entries.length} entries`);
