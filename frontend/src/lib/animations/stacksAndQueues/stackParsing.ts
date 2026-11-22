import { Frame, row } from "../types";
import { allPositions, stackRow } from "./rows";

function isDigit(letter: string) {
  return /[0-9]/.test(letter);
}

export function bracketsDeletePairs(text: string) {
  const frames: Frame[] = [];
  const closingOf: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
  const letters = [...text];
  let checked = 0;
  let left = 0;

  while (left + 1 < letters.length) {
    const right = left + 1;
    const pair = letters[left] + letters[right];
    checked++;

    if (closingOf[letters[left]] === letters[right]) {
      frames.push({
        rows: [row("字串", letters, { pointers: { 甲: left, 乙: right }, rangeStart: left, rangeEnd: right })],
        message: `位置 ${left} 和 ${right} 的 ${pair} 是相鄰的一對，把它們刪掉，後面的字元往前補。然後回到開頭重新找。`,
      });
      letters.splice(left, 2);
      left = 0;
    } else {
      frames.push({
        rows: [row("字串", letters, { pointers: { 甲: left, 乙: right } })],
        message: `從頭找相鄰的成對括號：位置 ${left} 和 ${right} 的 ${pair} 不是一對，看下一組。`,
      });
      left++;
    }
  }

  let verdict = "字串被刪光了，每個括號都配成對，答案是 true";
  if (letters.length > 0) {
    verdict = `再也找不到相鄰的一對，還剩下 ${letters.join("")}，答案是 false`;
  }
  frames.push({
    rows: [row("字串", letters)],
    message: `${verdict}。每刪一對就從頭再找，一共檢查了 ${checked} 次。`,
  });
  return frames;
}

export function bracketsStack(text: string) {
  const frames: Frame[] = [];
  const openingOf: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const letters = [...text];
  const stack: string[] = [];
  let checked = 0;

  for (let i = 0; i < letters.length; i++) {
    const ch = letters[i];
    const opening = openingOf[ch];
    const textRow = row("字串", letters, { pointers: { 目前: i } });
    checked++;

    if (opening === undefined) {
      stack.push(ch);
      frames.push({
        rows: [textRow, stackRow("堆疊", stack)],
        message: `${ch} 是左括號，放進堆疊，等它的右括號出現。`,
      });
      continue;
    }

    if (stack.length === 0 || stack[stack.length - 1] !== opening) {
      frames.push({
        rows: [textRow, stackRow("堆疊", stack)],
        message: `${ch} 是右括號，但堆疊頂端沒有同種類的 ${opening} 可以配，答案是 false。一共只檢查了 ${checked} 次。`,
      });
      return frames;
    }

    stack.pop();
    frames.push({
      rows: [textRow, stackRow("堆疊", stack)],
      message: `${ch} 是右括號，堆疊頂端剛好是同種類的 ${opening}，配對成功，把 ${opening} 彈出。`,
    });
  }

  let verdict = "堆疊是空的，每個左括號都被關上了，答案是 true";
  if (stack.length > 0) {
    verdict = "堆疊裡還有沒被關上的左括號，答案是 false";
  }
  frames.push({
    rows: [row("字串", letters), stackRow("堆疊", stack)],
    message: `字串看完了，${verdict}。每個字元只看一次，一共只檢查了 ${checked} 次。`,
  });
  return frames;
}

const operators = ["+", "-", "*", "/"];

function calculate(left: number, right: number, operator: string) {
  if (operator === "+") {
    return left + right;
  }
  if (operator === "-") {
    return left - right;
  }
  if (operator === "*") {
    return left * right;
  }
  return Math.trunc(left / right);
}

export function rpnRescan(tokens: string[]) {
  const frames: Frame[] = [];
  const cells = [...tokens];
  let looked = 0;
  let i = 0;

  while (cells.length > 1) {
    const token = cells[i];
    looked++;

    if (!operators.includes(token)) {
      frames.push({
        rows: [row("陣列", cells, { pointers: { 目前: i } })],
        message: `從頭找第一個運算符：位置 ${i} 的 ${token} 是數字，看下一格。`,
      });
      i++;
      continue;
    }

    const left = Number(cells[i - 2]);
    const right = Number(cells[i - 1]);
    const result = calculate(left, right, token);
    frames.push({
      rows: [row("陣列", cells, { pointers: { 目前: i }, rangeStart: i - 2, rangeEnd: i })],
      message: `位置 ${i} 是運算符 ${token}，拿它前面兩個數算 ${left} ${token} ${right} = ${result}，用結果換掉這三格，再回到開頭重新找。`,
    });
    cells.splice(i - 2, 3, String(result));
    i = 0;
  }

  frames.push({
    rows: [row("陣列", cells, { answer: [0] })],
    message: `只剩一個數，答案是 ${cells[0]}。每算一次就從頭再找，一共看了 ${looked} 格。`,
  });
  return frames;
}

export function rpnStack(tokens: string[]) {
  const frames: Frame[] = [];
  const stack: number[] = [];
  let looked = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenRow = row("陣列", tokens, { pointers: { 目前: i } });
    looked++;

    if (operators.includes(token)) {
      const right = stack.pop() as number;
      const left = stack.pop() as number;
      const result = calculate(left, right, token);
      stack.push(result);
      frames.push({
        rows: [tokenRow, stackRow("堆疊", stack)],
        message: `${token} 是運算符：先彈出的 ${right} 是右邊的數，後彈出的 ${left} 是左邊的數，算 ${left} ${token} ${right} = ${result}，把結果放回堆疊。`,
      });
    } else {
      stack.push(Number(token));
      frames.push({
        rows: [tokenRow, stackRow("堆疊", stack)],
        message: `${token} 是數字，放進堆疊。`,
      });
    }
  }

  const top = stack.length - 1;
  frames.push({
    rows: [row("陣列", tokens), row("堆疊", stack, { indexed: false, answer: [top] })],
    message: `陣列看完了，堆疊頂端的 ${stack[top]} 就是答案。不用回頭重找，每一格只看一次，一共只看了 ${looked} 格。`,
  });
  return frames;
}

export function decodeRescan(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  let looked = 0;
  let i = 0;

  while (i < letters.length) {
    looked++;

    if (letters[i] !== "]") {
      frames.push({
        rows: [row("字串", letters, { pointers: { 目前: i } })],
        message: `從頭找第一個 ]：位置 ${i} 的 ${letters[i]} 不是，看下一個。`,
      });
      i++;
      continue;
    }

    let open = i;
    while (letters[open] !== "[") {
      open--;
    }
    let start = open;
    while (start > 0 && isDigit(letters[start - 1])) {
      start--;
    }
    const repeat = Number(letters.slice(start, open).join(""));
    const inner = letters.slice(open + 1, i).join("");
    const expanded = inner.repeat(repeat);
    frames.push({
      rows: [row("字串", letters, { pointers: { 目前: i }, rangeStart: start, rangeEnd: i })],
      message: `位置 ${i} 是第一個 ]，往回找到它的 [ 和前面的數字，最內層是 ${repeat}[${inner}]。把它換成 ${expanded}，再回到開頭重新找。`,
    });
    letters.splice(start, i - start + 1, ...expanded);
    i = 0;
  }

  frames.push({
    rows: [row("字串", letters, { answer: allPositions(letters) })],
    message: `從頭到尾都沒有 ] 了，答案是 ${letters.join("")}。每展開一組就從頭再找，光是找 ] 就看了 ${looked} 個字元。`,
  });
  return frames;
}

export function decodeStack(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const savedStrings: string[] = [];
  const savedCounts: number[] = [];
  let current = "";
  let count = 0;
  let looked = 0;

  for (let i = 0; i < letters.length; i++) {
    const ch = letters[i];
    let message = "";
    looked++;

    if (isDigit(ch)) {
      count = count * 10 + Number(ch);
      message = `${ch} 是數字，記下接下來這一層要重複 ${count} 次。`;
    } else if (ch === "[") {
      savedStrings.push(current);
      savedCounts.push(count);
      message = `[ 代表進入新的一層：把外層已經組好的字串 "${current}" 和次數 ${count} 存進堆疊，目前字串清空，重新開始組。`;
      current = "";
      count = 0;
    } else if (ch === "]") {
      const previous = savedStrings.pop() as string;
      const repeat = savedCounts.pop() as number;
      const inner = current;
      current = previous + inner.repeat(repeat);
      message = `] 代表這一層結束：從堆疊取回外層字串 "${previous}" 和次數 ${repeat}，外層字串接上 ${inner} 重複 ${repeat} 次，目前字串變成 ${current}。`;
    } else {
      current += ch;
      message = `${ch} 是字母，接到目前字串後面，變成 ${current}。`;
    }

    const saved = savedStrings.map((outer, index) => `"${outer}",${savedCounts[index]}`);
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 目前: i } }),
        stackRow("堆疊", saved),
        row("目前字串", [...current], { indexed: false }),
      ],
      message,
    });
  }

  const result = [...current];
  frames.push({
    rows: [
      row("字串", letters),
      stackRow("堆疊", []),
      row("目前字串", result, { indexed: false, answer: allPositions(result) }),
    ],
    message: `字串看完了，目前字串 ${current} 就是答案。不用回頭重找，每個字元只看一次，一共只看了 ${looked} 個字元。`,
  });
  return frames;
}

export function starsRescan(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  let looked = 0;
  let i = 0;

  while (i < letters.length) {
    looked++;

    if (letters[i] !== "*") {
      frames.push({
        rows: [row("字串", letters, { pointers: { 目前: i } })],
        message: `從頭找第一個星號：位置 ${i} 的 ${letters[i]} 不是星號，看下一個。`,
      });
      i++;
      continue;
    }

    frames.push({
      rows: [row("字串", letters, { pointers: { 目前: i }, rangeStart: i - 1, rangeEnd: i })],
      message: `位置 ${i} 是星號，把它和左邊的 ${letters[i - 1]} 一起刪掉，後面的字元往前補。然後回到開頭重新找。`,
    });
    letters.splice(i - 1, 2);
    i = 0;
  }

  frames.push({
    rows: [row("字串", letters, { answer: allPositions(letters) })],
    message: `從頭到尾都沒有星號了，答案是 ${letters.join("")}。每刪一次就從頭再找，一共看了 ${looked} 個字元。`,
  });
  return frames;
}

export function starsStack(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const stack: string[] = [];
  let looked = 0;

  for (let i = 0; i < letters.length; i++) {
    const ch = letters[i];
    const textRow = row("字串", letters, { pointers: { 目前: i } });
    looked++;

    if (ch === "*") {
      const removed = stack.pop();
      frames.push({
        rows: [textRow, stackRow("堆疊", stack)],
        message: `遇到星號：堆疊頂端的 ${removed} 就是它左邊最近的字母，直接彈出，像按一次退格鍵。`,
      });
    } else {
      stack.push(ch);
      frames.push({
        rows: [textRow, stackRow("堆疊", stack)],
        message: `${ch} 是字母，放進堆疊。`,
      });
    }
  }

  frames.push({
    rows: [row("字串", letters), row("堆疊", stack, { indexed: false, answer: allPositions(stack) })],
    message: `字串看完了，堆疊裡由底到頂接起來就是答案 ${stack.join("")}。不用回頭重找，每個字元只看一次，一共只看了 ${looked} 個字元。`,
  });
  return frames;
}
