export function renderInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code style="background:var(--bg-elevated);padding:1px 5px;border-radius:4px;font-size:11px;color:var(--accent)">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--accent);text-decoration:underline;text-underline-offset:2px;cursor:pointer">$1</a>');
}

export function parseMarkdown(text) {
  if (!text) return [];
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    let line = lines[i];

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", lang, code: codeLines.join("\n") });
      i++;
      continue;
    }

    if (line.startsWith("#### ")) { blocks.push({ type: "h4", text: line.slice(5) }); i++; continue; }
    if (line.startsWith("### ")) { blocks.push({ type: "h3", text: line.slice(4) }); i++; continue; }
    if (line.startsWith("## ")) { blocks.push({ type: "h2", text: line.slice(3) }); i++; continue; }
    if (line.startsWith("# ")) { blocks.push({ type: "h1", text: line.slice(2) }); i++; continue; }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("* "))) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (line.trim() === "") { i++; continue; }

    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("#") && !lines[i].startsWith("```") && !lines[i].startsWith("- ") && !lines[i].startsWith("* ")) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: paraLines.join("\n") });
  }

  return blocks;
}

export const headingStyles = {
  h1: "text-lg font-bold mb-3 pb-1.5",
  h2: "text-base font-semibold mb-2.5 pb-1",
  h3: "text-sm font-semibold mb-2",
  h4: "text-xs font-semibold mb-1.5",
};
