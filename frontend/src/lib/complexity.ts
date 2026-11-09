export function complexityOf(code: string, comment: string) {
  const header: string[] = [];
  for (const line of code.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith(comment)) {
      break;
    }
    header.push(trimmed.slice(comment.length).trim());
  }
  const candidates = header.filter((line) => line.includes("O("));
  if (candidates.length === 0) {
    return "";
  }
  return candidates[candidates.length - 1].replace(/。+$/, "");
}

function splitOutsideParentheses(text: string, separators: string) {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  for (const character of text) {
    if ("(（".includes(character)) {
      depth++;
    } else if (")）".includes(character)) {
      depth--;
    }
    if (separators.includes(character) && depth === 0) {
      parts.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  parts.push(current.trim());
  return parts;
}

export function shortComplexity(text: string) {
  const kept: string[] = [];
  for (const part of splitOutsideParentheses(text, "，；")) {
    if (part.includes("O(") || part.startsWith("時間")) {
      kept.push(part.startsWith("所以") ? part.slice("所以".length) : part);
    }
    if (part.includes("空間") && part.includes("O(")) {
      break;
    }
  }
  if (kept.length <= 1) {
    return text;
  }
  return kept.join("，");
}
