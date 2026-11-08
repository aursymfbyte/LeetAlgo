export function removeAdvancedSection(markdown: string): string {
  const kept: string[] = [];
  let skipping = false;
  for (const line of markdown.split("\n")) {
    if (line.startsWith("## ")) {
      skipping = line.trim() === "## 進階";
    }
    if (!skipping) {
      kept.push(line);
    }
  }
  return kept.join("\n").trim();
}
