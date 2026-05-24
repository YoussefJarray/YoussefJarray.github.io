import { readdirSync } from "fs";
import { join, extname, basename } from "path";
import { NextResponse } from "next/server";

const SUPPORTED = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif", ".svg"]);

export async function GET() {
  const dir = join(process.cwd(), "public", "photos");

  let files;
  try {
    files = readdirSync(dir);
  } catch {
    return NextResponse.json([]);
  }

  const photos = files
    .filter((f) => SUPPORTED.has(extname(f).toLowerCase()))
    .sort()
    .map((f) => ({
      src: `/photos/${f}`,
      title: basename(f, extname(f)).replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    }));

  return NextResponse.json(photos);
}