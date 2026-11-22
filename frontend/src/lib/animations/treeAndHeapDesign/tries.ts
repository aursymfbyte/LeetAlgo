import { Cell, Frame, row } from "../types";
import { hasNode, treeCells } from "./treeRows";

function matchedLetters(word: string, text: string) {
  let count = 0;
  while (count < word.length && count < text.length) {
    if (text[count] !== "." && text[count] !== word[count]) {
      break;
    }
    count++;
  }
  return count;
}

export function wordListScan(ops: string[], addName: string) {
  const frames: Frame[] = [];
  const words: string[] = [];
  const results: string[] = [];
  let compared = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", words, { indexed: false })],
    message: "暴力解不建字典樹，只把加進來的單字依序放進「清單」。查詢時從清單的第一個單字開始，一個一個拿出來逐字比。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "加") {
      words.push(text);
      frames.push({
        rows: [opRow, row("清單", words, { indexed: false, pointers: { 目前: words.length - 1 } })],
        message: `${ops[step]}（${addName}）：直接放到清單最後面，不用整理。`,
      });
      continue;
    }

    let method = "search";
    if (name === "開頭") {
      method = "startsWith";
    }
    const head = `${ops[step]}（${method}）：`;
    let found = false;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const matched = matchedLetters(word, text);
      const shorter = Math.min(word.length, text.length);
      let used = matched;
      let verdict = `能比的 ${matched} 個字元都對得上，但長度不合，不算`;
      if (matched < shorter) {
        used = matched + 1;
        verdict = `第 ${used} 個字元 ${word[matched]} 和 ${text[matched]} 對不上，不是它`;
      }
      compared += used;

      found = matched === text.length;
      if (name === "找" && word.length !== text.length) {
        found = false;
      }
      if (found) {
        verdict = `${matched} 個字元全部對得上，符合，回傳 true`;
      }
      frames.push({
        rows: [opRow, row("清單", words, { indexed: false, pointers: { 目前: i }, rangeStart: i })],
        message: `${head}和清單裡的 ${word} 逐字比，比了 ${used} 個字元：${verdict}。`,
      });
      if (found) {
        break;
      }
    }

    results.push(String(found));
    if (!found) {
      frames.push({
        rows: [opRow, row("清單", words, { indexed: false })],
        message: `${head}清單裡的 ${words.length} 個單字都比過了，沒有符合的，回傳 false。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", words, { indexed: false })],
    message: `${results.length} 次查詢依序回傳 ${results.join("、")}。每次都從清單的第一個單字開始逐字比，查詢一共比較了 ${compared} 個字元。`,
  });
  return frames;
}

function trieChild(letters: Cell[], node: number, letter: string) {
  const left = node * 2 + 1;
  const right = node * 2 + 2;
  if (letters[left] === letter) {
    return left;
  }
  if (letters[right] === letter) {
    return right;
  }
  return -1;
}

function trieAdd(letters: Cell[], ends: number[], word: string) {
  let node = 0;
  let created = 0;

  for (const letter of word) {
    let child = trieChild(letters, node, letter);
    if (child === -1) {
      child = node * 2 + 1;
      if (letters[child] !== "") {
        child = node * 2 + 2;
      }
      letters[child] = letter;
      created++;
    }
    node = child;
  }
  ends.push(node);
  return created;
}

export function trieWalk(ops: string[]) {
  const frames: Frame[] = [];
  const letters = treeCells(["根"], 15);
  const ends: number[] = [];
  const results: string[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("字典樹", letters, { shape: "tree" })],
    message: "字典樹從「根」出發，每往下一層多一個字母，開頭相同的單字共用同一段路。標起來的節點代表有單字在這裡結束。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "加") {
      const created = trieAdd(letters, ends, text);
      const last = ends[ends.length - 1];
      frames.push({
        rows: [opRow, row("字典樹", letters, { shape: "tree", pointers: { 目前: last }, answer: [...ends] })],
        message: `${ops[step]}（insert）：從根沿著字母往下走，已經有的節點直接共用，沒有的才新建，這次新建 ${created} 個。最後把 ${letters[last]} 標成單字結尾。`,
      });
      continue;
    }

    let method = "search";
    if (name === "開頭") {
      method = "startsWith";
    }
    const head = `${ops[step]}（${method}）：`;
    let node = 0;
    let missing = "";

    for (const letter of text) {
      const child = trieChild(letters, node, letter);
      looked++;
      if (child === -1) {
        missing = letter;
        break;
      }
      node = child;
      frames.push({
        rows: [opRow, row("字典樹", letters, { shape: "tree", pointers: { 目前: node }, answer: [...ends] })],
        message: `${head}下一個字母是 ${letter}，往下一層找得到 ${letter}，走到這個節點。只比了 1 個字元。`,
      });
    }

    let found = true;
    let reason = "字母都走完了，路沒有斷，代表有單字用它開頭";
    if (name === "找") {
      found = ends.includes(node);
      reason = "字母都走完了，停下來的節點有單字結尾的標記";
      if (!found) {
        reason = "字母都走完了，但停下來的節點沒有單字結尾的標記，它只是別的單字的開頭";
      }
    }
    if (missing !== "") {
      found = false;
      reason = `下一個字母是 ${missing}，但這個節點底下沒有 ${missing}，路斷了`;
    }
    results.push(String(found));
    frames.push({
      rows: [opRow, row("字典樹", letters, { shape: "tree", pointers: { 目前: node }, answer: [...ends] })],
      message: `${head}${reason}，回傳 ${found}。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("字典樹", letters, { shape: "tree", answer: [...ends] })],
    message: `${results.length} 次查詢依序回傳 ${results.join("、")}。查詢只沿著字母往下走，和存了多少單字無關，查詢一共只比較了 ${looked} 個字元。`,
  });
  return frames;
}

export function dictionaryDfs(ops: string[]) {
  const frames: Frame[] = [];
  const letters = treeCells(["根"], 15);
  const ends: number[] = [];
  const results: string[] = [];
  let looked = 0;
  let step = 0;
  let text = "";

  function show(node: number, message: string) {
    frames.push({
      rows: [
        row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step }),
        row("字典樹", letters, { shape: "tree", pointers: { 目前: node }, answer: [...ends] }),
      ],
      message,
    });
  }

  function dfs(node: number, index: number): boolean {
    const head = `${ops[step]}（search）：`;

    if (index === text.length) {
      if (ends.includes(node)) {
        show(node, `${head}字元都配完了，停下來的節點有單字結尾的標記，配對成功，回傳 true。`);
        return true;
      }
      show(node, `${head}字元都配完了，但停下來的節點沒有單字結尾的標記，這條路不算。`);
      return false;
    }

    const letter = text[index];
    if (letter === ".") {
      for (const child of [node * 2 + 1, node * 2 + 2]) {
        if (!hasNode(letters, child)) {
          continue;
        }
        looked++;
        show(child, `${head}第 ${index + 1} 個字元是 .，任何字母都可以，所以每個孩子都要試。走 ${letters[child]} 這條路試試看。`);
        if (dfs(child, index + 1)) {
          return true;
        }
      }
      return false;
    }

    const child = trieChild(letters, node, letter);
    looked++;
    if (child === -1) {
      show(node, `${head}第 ${index + 1} 個字元是 ${letter}，但這個節點底下沒有 ${letter}，這條路不通，退回去。`);
      return false;
    }
    show(child, `${head}第 ${index + 1} 個字元是 ${letter}，往下一層找得到 ${letter}，走到這個節點。`);
    return dfs(child, index + 1);
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("字典樹", letters, { shape: "tree" })],
    message: "單字存在字典樹裡，標起來的節點代表有單字在這裡結束。查詢時從根往下走，遇到 . 才需要把每個孩子都試一次。",
  });

  for (step = 0; step < ops.length; step++) {
    const parts = ops[step].split(" ");
    text = parts[1];

    if (parts[0] === "加") {
      const created = trieAdd(letters, ends, text);
      const last = ends[ends.length - 1];
      show(last, `${ops[step]}（addWord）：從根沿著字母往下走，已經有的節點直接共用，沒有的才新建，這次新建 ${created} 個。最後把 ${letters[last]} 標成單字結尾。`);
      continue;
    }

    const found = dfs(0, 0);
    results.push(String(found));
    if (!found) {
      show(0, `${ops[step]}（search）：能走的路都試過了，沒有單字配得上，回傳 false。`);
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("字典樹", letters, { shape: "tree", answer: [...ends] })],
    message: `${results.length} 次查詢依序回傳 ${results.join("、")}。只走字典樹上對得上的路，不用把每個單字都拿出來比，查詢一共只比較了 ${looked} 個字元。`,
  });
  return frames;
}
