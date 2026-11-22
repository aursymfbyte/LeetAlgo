import { Frame, row } from "../types";
import { positions } from "./rows";

function addLetter(count: Record<string, number>, letter: string, amount: number) {
  count[letter] = (count[letter] ?? 0) + amount;
}

function countLetters(text: string) {
  const count: Record<string, number> = {};
  for (const letter of text) {
    addLetter(count, letter, 1);
  }
  return count;
}

function countCells(count: Record<string, number>) {
  const cells: string[] = [];
  for (const letter of Object.keys(count).sort()) {
    if (count[letter] > 0) {
      cells.push(`${letter}→${count[letter]}`);
    }
  }
  return cells;
}

function sameCount(first: Record<string, number>, second: Record<string, number>) {
  const letters = [...Object.keys(first), ...Object.keys(second)];
  for (const letter of letters) {
    const firstTimes = first[letter] ?? 0;
    const secondTimes = second[letter] ?? 0;
    if (firstTimes !== secondTimes) {
      return false;
    }
  }
  return true;
}

export function longestUniqueBrute(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  let bestStart = 0;
  let bestLength = 0;
  let checked = 0;

  for (let start = 0; start < letters.length; start++) {
    const seen: string[] = [];
    for (let end = start; end < letters.length; end++) {
      const letter = letters[end];
      const cells = row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end });
      checked++;

      if (seen.includes(letter)) {
        frames.push({
          rows: [cells],
          message: `從位置 ${start} 開始往右延伸：${letter} 在這一段裡已經出現過，不能再延伸。換下一個起點重新檢查。`,
        });
        break;
      }

      seen.push(letter);
      const length = end - start + 1;
      if (length > bestLength) {
        bestLength = length;
        bestStart = start;
      }
      frames.push({
        rows: [cells],
        message: `從位置 ${start} 開始往右延伸：加進 ${letter}，這一段沒有重複的字元，長度是 ${length}，目前最長是 ${bestLength}。`,
      });
    }
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `沒有重複字元的最長子字串是 ${best}，長度是 ${bestLength}。每個起點都重新檢查，一共檢查了 ${checked} 次。`,
  });
  return frames;
}

export function longestUniqueWindow(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const count: Record<string, number> = {};
  let left = 0;
  let bestStart = 0;
  let bestLength = 0;
  let moves = 0;

  for (let right = 0; right < letters.length; right++) {
    const letter = letters[right];
    addLetter(count, letter, 1);
    moves++;
    let action = `右邊界往右移，${letter} 進視窗。`;

    while (count[letter] > 1) {
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
          row("雜湊表", countCells(count), { indexed: false }),
        ],
        message: `${action}雜湊表裡 ${letter} 的次數是 ${count[letter]}，重複了，要把左邊的字元移出視窗。`,
      });
      addLetter(count, letters[left], -1);
      action = `把左邊的 ${letters[left]} 移出視窗。`;
      left++;
      moves++;
    }

    const length = right - left + 1;
    if (length > bestLength) {
      bestLength = length;
      bestStart = left;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
        row("雜湊表", countCells(count), { indexed: false }),
      ],
      message: `${action}視窗裡沒有重複的字元，長度是 ${length}，目前最長是 ${bestLength}。`,
    });
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("雜湊表", countCells(count), { indexed: false }),
    ],
    message: `沒有重複字元的最長子字串是 ${best}，長度是 ${bestLength}。每個字元最多進出視窗各一次，兩個邊界一共只移動了 ${moves} 次。`,
  });
  return frames;
}

function needCells(need: Record<string, number>, target: string) {
  const cells: string[] = [];
  for (const letter of new Set(target)) {
    cells.push(`${letter}→${need[letter]}`);
  }
  return cells;
}

export function minWindowBrute(text: string, target: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const kinds = new Set(target).size;
  let bestStart = 0;
  let bestLength = 0;
  let added = 0;

  frames.push({
    rows: [row("字串", letters), row("還缺", needCells(countLetters(target), target), { indexed: false })],
    message: `要找最短的一段，湊齊 ${target} 的每個字母。「還缺」記錄每種字母還差幾個，負數代表這一段裡有多的。`,
  });

  for (let start = 0; start < letters.length; start++) {
    const need = countLetters(target);
    let missing = kinds;

    for (let end = start; end < letters.length; end++) {
      const letter = letters[end];
      addLetter(need, letter, -1);
      if (need[letter] === 0) {
        missing--;
      }
      added++;
      const rows = [
        row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end }),
        row("還缺", needCells(need, target), { indexed: false }),
      ];

      if (missing === 0) {
        const length = end - start + 1;
        if (bestLength === 0 || length < bestLength) {
          bestLength = length;
          bestStart = start;
        }
        frames.push({
          rows,
          message: `從位置 ${start} 開始往右延伸：加進 ${letter}，字母都湊齊了，長度是 ${length}，目前最短是 ${bestLength}。換下一個起點重新數。`,
        });
        break;
      }

      frames.push({
        rows,
        message: `從位置 ${start} 開始往右延伸：加進 ${letter}，還有 ${missing} 種字母沒湊齊。`,
      });
    }
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  const need = countLetters(target);
  for (const letter of best) {
    addLetter(need, letter, -1);
  }
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("還缺", needCells(need, target), { indexed: false }),
    ],
    message: `湊齊 ${target} 的最短子字串是 ${best}，長度是 ${bestLength}。每個起點都重新數，一共加了 ${added} 次字母。`,
  });
  return frames;
}

export function minWindowSliding(text: string, target: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const need = countLetters(target);
  let missing = new Set(target).size;
  let left = 0;
  let bestStart = 0;
  let bestLength = 0;
  let moves = 0;

  frames.push({
    rows: [row("字串", letters), row("還缺", needCells(need, target), { indexed: false })],
    message: `要找最短的一段，湊齊 ${target} 的每個字母。「還缺」記錄每種字母還差幾個，負數代表視窗裡有多的。`,
  });

  for (let right = 0; right < letters.length; right++) {
    const letter = letters[right];
    addLetter(need, letter, -1);
    if (need[letter] === 0) {
      missing--;
    }
    moves++;

    let status = `還有 ${missing} 種字母沒湊齊。`;
    if (missing === 0) {
      status = "字母都湊齊了。";
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
        row("還缺", needCells(need, target), { indexed: false }),
      ],
      message: `右邊界往右移，${letter} 進視窗。${status}`,
    });

    while (missing === 0) {
      const length = right - left + 1;
      if (bestLength === 0 || length < bestLength) {
        bestLength = length;
        bestStart = left;
      }
      const out = letters[left];
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
          row("還缺", needCells(need, target), { indexed: false }),
        ],
        message: `視窗湊齊了，長度是 ${length}，目前最短是 ${bestLength}。把左邊的 ${out} 移出視窗，看能不能更短。`,
      });
      if (need[out] === 0) {
        missing++;
      }
      addLetter(need, out, 1);
      left++;
      moves++;
    }
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("還缺", needCells(need, target), { indexed: false }),
    ],
    message: `湊齊 ${target} 的最短子字串是 ${best}，長度是 ${bestLength}。每個字母最多進出視窗各一次，兩個邊界一共只移動了 ${moves} 次。`,
  });
  return frames;
}

export function replaceBrute(text: string, limit: number) {
  const frames: Frame[] = [];
  const letters = [...text];
  let bestStart = 0;
  let bestLength = 0;
  let checked = 0;

  for (let start = 0; start < letters.length; start++) {
    const count: Record<string, number> = {};
    let most = 0;

    for (let end = start; end < letters.length; end++) {
      const letter = letters[end];
      addLetter(count, letter, 1);
      most = Math.max(most, count[letter]);
      checked++;
      const length = end - start + 1;
      const changes = length - most;
      const rows = [
        row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end }),
        row("計數", countCells(count), { indexed: false }),
      ];
      const detail = `從位置 ${start} 開始：加進 ${letter}，長度 ${length}，最多的字母有 ${most} 個，其餘 ${changes} 個要換掉`;

      if (changes > limit) {
        frames.push({
          rows,
          message: `${detail}，超過 ${limit} 個了。換下一個起點重新數。`,
        });
        break;
      }

      if (length > bestLength) {
        bestLength = length;
        bestStart = start;
      }
      frames.push({
        rows,
        message: `${detail}，沒超過 ${limit} 個，目前最長是 ${bestLength}。`,
      });
    }
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("計數", countCells(countLetters(best)), { indexed: false }),
    ],
    message: `最長是 ${bestLength}：位置 ${bestStart} 到 ${bestEnd} 的 ${best}，最多換 ${limit} 個字母就全部一樣。每個起點都重新數，一共檢查了 ${checked} 次。`,
  });
  return frames;
}

export function replaceWindow(text: string, limit: number) {
  const frames: Frame[] = [];
  const letters = [...text];
  const count: Record<string, number> = {};
  let most = 0;
  let left = 0;
  let bestStart = 0;
  let bestLength = 0;
  let moves = 0;

  frames.push({
    rows: [row("字串", letters), row("視窗計數", [], { indexed: false })],
    message: `視窗裡出現最多的字母留著，其他的都換掉。所以「視窗長度減掉最多個數」不超過 ${limit}，這個視窗就換得完。`,
  });

  for (let right = 0; right < letters.length; right++) {
    const letter = letters[right];
    addLetter(count, letter, 1);
    most = Math.max(most, count[letter]);
    moves++;
    let action = `右邊界往右移，${letter} 進視窗。`;

    while (right - left + 1 - most > limit) {
      const length = right - left + 1;
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
          row("視窗計數", countCells(count), { indexed: false }),
        ],
        message: `${action}長度 ${length} 減掉最多個數 ${most} 是 ${length - most}，超過 ${limit} 了，要把左邊的字母移出視窗。`,
      });
      addLetter(count, letters[left], -1);
      action = `把左邊的 ${letters[left]} 移出視窗。最多個數沿用記錄過的 ${most}，不重算，因為視窗沒有變長，不會影響答案。`;
      left++;
      moves++;
    }

    const length = right - left + 1;
    if (length > bestLength) {
      bestLength = length;
      bestStart = left;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
        row("視窗計數", countCells(count), { indexed: false }),
      ],
      message: `${action}長度 ${length} 減掉最多個數 ${most} 是 ${length - most}，沒超過 ${limit}，目前最長是 ${bestLength}。`,
    });
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("視窗計數", countCells(countLetters(best)), { indexed: false }),
    ],
    message: `最長是 ${bestLength}：位置 ${bestStart} 到 ${bestEnd} 的 ${best}，最多換 ${limit} 個字母就全部一樣。兩個邊界一共只移動了 ${moves} 次。`,
  });
  return frames;
}

export function anagramsBrute(text: string, pattern: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const size = pattern.length;
  const targetCount = countLetters(pattern);
  const answers: number[] = [];
  let counted = 0;

  for (let start = 0; start + size <= letters.length; start++) {
    const end = start + size - 1;
    const count: Record<string, number> = {};

    for (let index = start; index <= end; index++) {
      addLetter(count, letters[index], 1);
      counted++;
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 起點: start, 目前: index }, rangeStart: start, rangeEnd: end }),
          row("計數", countCells(count), { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `從位置 ${start} 取長度 ${size} 的一段，從頭數一次字母：數到 ${letters[index]}。`,
      });
    }

    let result = `這一段的計數和 ${pattern} 不一樣，不是異位詞。換下一個起點，全部重數。`;
    if (sameCount(count, targetCount)) {
      answers.push(start);
      result = `這一段的計數和 ${pattern} 一樣，是異位詞，把起點 ${start} 記進答案。換下一個起點，全部重數。`;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 起點: start }, rangeStart: start, rangeEnd: end }),
        row("計數", countCells(count), { indexed: false }),
        row("答案", answers, { indexed: false }),
      ],
      message: result,
    });
  }

  frames.push({
    rows: [
      row("字串", letters, { answer: answers }),
      row("計數", countCells(targetCount), { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `異位詞的起點是位置 ${answers.join("、")}。每個起點都重新數 ${size} 個字母，一共數了 ${counted} 次。`,
  });
  return frames;
}

export function anagramsWindow(text: string, pattern: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const size = pattern.length;
  const targetCount = countLetters(pattern);
  const count: Record<string, number> = {};
  const answers: number[] = [];
  let updates = 0;

  frames.push({
    rows: [
      row("字串", letters),
      row("視窗計數", [], { indexed: false }),
      row("答案", answers, { indexed: false }),
    ],
    message: `異位詞就是字母計數一樣。用長度固定是 ${size} 的視窗往右滑，只維護視窗裡的字母計數，再和 ${pattern} 的計數比。`,
  });

  for (let right = 0; right < letters.length; right++) {
    addLetter(count, letters[right], 1);
    updates++;
    const left = right - size + 1;

    if (left < 0) {
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 右: right }, rangeEnd: right }),
          row("視窗計數", countCells(count), { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `${letters[right]} 進視窗，計數加一。視窗長度還不到 ${size}，繼續往右。`,
      });
      continue;
    }

    let result = `視窗計數和 ${pattern} 不一樣。`;
    if (sameCount(count, targetCount)) {
      answers.push(left);
      result = `視窗計數和 ${pattern} 一樣，把左邊界的位置 ${left} 記進答案。`;
    }
    const out = letters[left];
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
        row("視窗計數", countCells(count), { indexed: false }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${letters[right]} 進視窗，計數加一。${result}接著把左邊的 ${out} 移出視窗，計數減一。`,
    });
    addLetter(count, out, -1);
    updates++;
  }

  frames.push({
    rows: [
      row("字串", letters, { answer: answers }),
      row("視窗計數", countCells(count), { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `異位詞的起點是位置 ${answers.join("、")}。視窗每滑一格只加一個、減一個字母，一共只更新了 ${updates} 次計數。`,
  });
  return frames;
}

function permutations(letters: string) {
  if (letters.length === 1) {
    return [letters];
  }

  const list: string[] = [];
  for (let index = 0; index < letters.length; index++) {
    const rest = letters.slice(0, index) + letters.slice(index + 1);
    for (const tail of permutations(rest)) {
      list.push(letters[index] + tail);
    }
  }
  return list;
}

export function permutationBrute(pattern: string, text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const size = pattern.length;
  const orders = permutations(pattern);
  let compared = 0;

  for (let current = 0; current < orders.length; current++) {
    const order = orders[current];

    for (let start = 0; start + size <= letters.length; start++) {
      const end = start + size - 1;
      const part = text.slice(start, end + 1);
      compared++;

      if (part === order) {
        frames.push({
          rows: [
            row("字串", letters, { rangeStart: start, rangeEnd: end, answer: positions(start, end) }),
            row("排列", orders, { pointers: { 目前: current }, rangeStart: current, answer: [current], indexed: false }),
          ],
          message: `排列 ${order} 和位置 ${start} 開始的 ${part} 一樣，找到了。${size} 個字母就有 ${orders.length} 種排列，一共比對了 ${compared} 次。`,
        });
        return frames;
      }

      frames.push({
        rows: [
          row("字串", letters, { pointers: { 起點: start }, rangeStart: start, rangeEnd: end }),
          row("排列", orders, { pointers: { 目前: current }, rangeStart: current, indexed: false }),
        ],
        message: `先列出 ${pattern} 的所有排列，一種一種拿去字串裡找：${order} 和位置 ${start} 開始的 ${part} 不一樣。`,
      });
    }
  }

  frames.push({
    rows: [row("字串", letters, { rangeEnd: -1 }), row("排列", orders, { rangeEnd: -1, indexed: false })],
    message: `每一種排列都找過了，字串裡都沒有。${size} 個字母就有 ${orders.length} 種排列，一共比對了 ${compared} 次。`,
  });
  return frames;
}

export function permutationWindow(pattern: string, text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const size = pattern.length;
  const targetCount = countLetters(pattern);
  const count: Record<string, number> = {};
  let updates = 0;

  frames.push({
    rows: [row("字串", letters), row("視窗計數", [], { indexed: false })],
    message: `排列只是順序不同，字母計數一定一樣。用長度固定是 ${size} 的視窗往右滑，比對視窗和 ${pattern} 的字母計數就好。`,
  });

  for (let right = 0; right < letters.length; right++) {
    addLetter(count, letters[right], 1);
    updates++;
    const left = right - size + 1;

    if (left < 0) {
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 右: right }, rangeEnd: right }),
          row("視窗計數", countCells(count), { indexed: false }),
        ],
        message: `${letters[right]} 進視窗，計數加一。視窗長度還不到 ${size}，繼續往右。`,
      });
      continue;
    }

    if (sameCount(count, targetCount)) {
      const part = text.slice(left, right + 1);
      frames.push({
        rows: [
          row("字串", letters, { rangeStart: left, rangeEnd: right, answer: positions(left, right) }),
          row("視窗計數", countCells(count), { indexed: false }),
        ],
        message: `${letters[right]} 進視窗，視窗計數和 ${pattern} 一樣，${part} 就是它的一種排列，找到了。不用列出排列，一共只更新了 ${updates} 次計數。`,
      });
      return frames;
    }

    const out = letters[left];
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
        row("視窗計數", countCells(count), { indexed: false }),
      ],
      message: `${letters[right]} 進視窗，計數加一。視窗計數和 ${pattern} 不一樣，把左邊的 ${out} 移出視窗，計數減一。`,
    });
    addLetter(count, out, -1);
    updates++;
  }

  frames.push({
    rows: [row("字串", letters, { rangeEnd: -1 }), row("視窗計數", countCells(count), { indexed: false })],
    message: `視窗滑到底了，沒有一段的字母計數和 ${pattern} 一樣。一共只更新了 ${updates} 次計數。`,
  });
  return frames;
}
