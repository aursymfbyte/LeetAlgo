import { Cell, Frame, row } from "../types";

function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
}

export function palindromeBrute(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  let bestStart = 0;
  let bestLength = 0;
  let checked = 0;
  let compared = 0;

  for (let start = 0; start < letters.length; start++) {
    for (let end = start; end < letters.length; end++) {
      const part = letters.slice(start, end + 1);
      const reversed = [...part].reverse();
      const length = part.length;
      let same = true;
      checked++;

      for (let index = 0; index < length; index++) {
        compared++;
        if (part[index] !== reversed[index]) {
          same = false;
          break;
        }
      }

      let result = `倒過來是 ${reversed.join("")}，和原本不一樣，不是回文。`;
      if (same) {
        if (length > bestLength) {
          bestLength = length;
          bestStart = start;
        }
        result = `倒過來還是一樣，是回文，長度 ${length}，目前最長是 ${bestLength}。`;
      }

      const best = letters.slice(bestStart, bestStart + bestLength);
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end }),
          row("最長", best, { indexed: false }),
        ],
        message: `每一段子字串都倒過來逐字比：${part.join("")} ${result}`,
      });
    }
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = letters.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("最長", best, { answer: positions(0, bestLength - 1), indexed: false }),
    ],
    message: `最長的回文子字串是 ${best.join("")}，長度是 ${bestLength}。${checked} 段子字串每一段都要倒過來比，一共比較了 ${compared} 次字元。`,
  });
  return frames;
}

export function palindromeManacher(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const marked = ["#"];
  for (const letter of letters) {
    marked.push(letter);
    marked.push("#");
  }
  const size = marked.length;
  const radius: number[] = marked.map(() => 0);
  const shown: Cell[] = marked.map(() => "?");
  let center = 0;
  let edge = 0;
  let bestCenter = 0;
  let bestStart = 0;
  let bestLength = 0;
  let compared = 0;

  frames.push({
    rows: [row("字串", letters), row("新字串", marked), row("半徑", shown)],
    message: "先在每個字元前後插入 #，回文的中心就一定落在某一格上。半徑是從中心往左右各能延伸幾格，剛好等於原字串裡的回文長度。",
  });
  frames.push({
    rows: [row("字串", letters), row("新字串", marked), row("半徑", shown)],
    message: "從左到右算半徑，同時記住右端伸得最遠的回文：它的中心和右邊的邊界。在邊界之內的位置，可以參考鏡像位置算過的半徑，不用從 0 比起。",
  });

  for (let i = 0; i < size; i++) {
    const marks: Record<string, number> = { 目前: i, 中心: center, 邊界: edge };
    const radiusMarks: Record<string, number> = { 目前: i };
    let current = 0;
    let start = `位置 ${i} 不在邊界 ${edge} 之內，沒有鏡像可以參考，半徑從 0 開始。`;

    if (i < edge) {
      const mirror = 2 * center - i;
      const room = edge - i;
      current = Math.min(radius[mirror], room);
      marks.鏡像 = mirror;
      radiusMarks.鏡像 = mirror;
      start = `位置 ${i} 在邊界 ${edge} 之內，鏡像位置 ${mirror} 的半徑 ${radius[mirror]}、離邊界 ${room} 格，取較小的 ${current} 開始。`;
    }

    let tries = 0;
    while (i - current - 1 >= 0 && i + current + 1 < size) {
      tries++;
      if (marked[i - current - 1] !== marked[i + current + 1]) {
        break;
      }
      current++;
    }
    compared += tries;
    radius[i] = current;
    shown[i] = current;

    let expand = `往外比了 ${tries} 次，半徑是 ${current}。`;
    if (tries === 0) {
      expand = `再往外就超出字串了，不用比，半徑是 ${current}。`;
    }

    let update = "";
    if (i + current > edge) {
      center = i;
      edge = i + current;
      update = `邊界推到位置 ${edge}。`;
    }
    if (current > bestLength) {
      bestLength = current;
      bestCenter = i;
      bestStart = (i - current) / 2;
      update += `長度 ${current} 是目前最長。`;
    }

    frames.push({
      rows: [
        row("字串", letters, { answer: positions(bestStart, bestStart + bestLength - 1) }),
        row("新字串", marked, { pointers: marks, rangeStart: i - current, rangeEnd: i + current }),
        row("半徑", shown, { pointers: radiusMarks }),
      ],
      message: `${start}${expand}${update}`,
    });
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("新字串", marked, { rangeStart: bestCenter - bestLength, rangeEnd: bestCenter + bestLength }),
      row("半徑", shown, { answer: [bestCenter] }),
    ],
    message: `最大的半徑是 ${bestLength}，換回原字串就是 ${best}，長度是 ${bestLength}。靠鏡像省掉重複的比對，一共只比較了 ${compared} 次字元。`,
  });
  return frames;
}

function prefixRow(label: string, letters: string[], length: number) {
  if (length === 0) {
    return row(label, letters, { rangeEnd: -1 });
  }
  return row(label, letters, { pointers: { 目前: length - 1 }, rangeEnd: length - 1 });
}

export function editBrute(word1: string, word2: string) {
  const frames: Frame[] = [];
  const first = [...word1];
  const second = [...word2];
  const stack: string[] = [];
  const visits: Record<string, number> = {};
  let calls = 0;

  frames.push({
    rows: [row("字串一", first), row("字串二", second), row("呼叫路徑", stack, { indexed: false })],
    message: `不記結果的遞迴：每次只看兩邊最後一個字元。呼叫路徑裡的 ${first.length},${second.length} 代表把字串一的前 ${first.length} 個字元變成字串二的前 ${second.length} 個字元。`,
  });

  function distance(i: number, j: number): number {
    const key = `${i},${j}`;
    calls++;
    visits[key] = (visits[key] ?? 0) + 1;
    stack.push(key);
    const rows = [
      prefixRow("字串一", first, i),
      prefixRow("字串二", second, j),
      row("呼叫路徑", stack, { indexed: false }),
    ];
    let again = "";
    if (visits[key] > 1) {
      again = `這一組已經是第 ${visits[key]} 次算了。`;
    }
    let result = 0;

    if (i === 0) {
      frames.push({
        rows,
        message: `第 ${calls} 次呼叫：字串一沒有字元了，字串二剩幾個就要插入幾個，回傳 ${j}。${again}`,
      });
      result = j;
    } else if (j === 0) {
      frames.push({
        rows,
        message: `第 ${calls} 次呼叫：字串二沒有字元了，字串一剩幾個就要刪掉幾個，回傳 ${i}。${again}`,
      });
      result = i;
    } else if (first[i - 1] === second[j - 1]) {
      frames.push({
        rows,
        message: `第 ${calls} 次呼叫：兩邊最後一個字元都是 ${first[i - 1]}，不用操作，兩邊各去掉它再往前算。${again}`,
      });
      result = distance(i - 1, j - 1);
    } else {
      frames.push({
        rows,
        message: `第 ${calls} 次呼叫：最後的 ${first[i - 1]} 和 ${second[j - 1]} 不同，刪除、插入、替換三種都要各自往下算，取最少的再加 1。${again}`,
      });
      const removed = distance(i - 1, j);
      const inserted = distance(i, j - 1);
      const replaced = distance(i - 1, j - 1);
      result = Math.min(removed, inserted, replaced) + 1;
    }

    stack.pop();
    return result;
  }

  const answer = distance(first.length, second.length);
  const repeated = calls - Object.keys(visits).length;

  frames.push({
    rows: [row("字串一", first), row("字串二", second), row("呼叫路徑", stack, { indexed: false })],
    message: `把 ${word1} 變成 ${word2} 最少要 ${answer} 次操作。不記結果的遞迴一共呼叫了 ${calls} 次，其中 ${repeated} 次是重複算同一組。`,
  });
  return frames;
}

export function editRolling(word1: string, word2: string) {
  const frames: Frame[] = [];
  const first = [...word1];
  const second = [...word2];
  const n = first.length;
  const m = second.length;
  const f: number[] = [];
  for (let j = 0; j <= m; j++) {
    f.push(j);
  }
  let filled = m + 1;

  frames.push({
    rows: [
      row("字串一", first, { rangeEnd: -1 }),
      row("字串二", second),
      row("最少操作", f),
      row("上一列", [], { indexed: false }),
    ],
    message: `只留一列，長度跟著較短的字串二。位置 j 記錄把字串一看過的部分變成字串二的前 j 個字元要幾次。還沒看任何字元時，只能插入 j 次。`,
  });

  for (let i = 1; i <= n; i++) {
    const letter = first[i - 1];
    let pre = f[0];
    f[0] = i;
    filled++;
    frames.push({
      rows: [
        prefixRow("字串一", first, i),
        row("字串二", second, { rangeEnd: -1 }),
        row("最少操作", f, { pointers: { 目前: 0 }, rangeEnd: 0 }),
        row("上一列", [`左上 ${pre}`], { indexed: false }),
      ],
      message: `字串一多看一個字元 ${letter}。位置 0 改成 ${i}：全部刪掉要 ${i} 次。原本的 ${pre} 先留著當左上，灰色格子還是上一列的值。`,
    });

    for (let j = 1; j <= m; j++) {
      const temp = f[j];
      const left = f[j - 1];
      let message = `兩邊都是 ${letter}，不用操作，直接沿用左上的 ${pre}。`;

      if (letter === second[j - 1]) {
        f[j] = pre;
      } else {
        const smallest = Math.min(temp, left, pre);
        f[j] = smallest + 1;
        message = `${letter} 和 ${second[j - 1]} 不同：上面 ${temp} 是刪除、左邊 ${left} 是插入、左上 ${pre} 是替換，取最小的 ${smallest} 再加 1，得到 ${f[j]}。`;
      }

      filled++;
      frames.push({
        rows: [
          prefixRow("字串一", first, i),
          prefixRow("字串二", second, j),
          row("最少操作", f, { pointers: { 左: j - 1, 目前: j }, rangeEnd: j }),
          row("上一列", [`左上 ${pre}`, `上 ${temp}`], { indexed: false }),
        ],
        message,
      });
      pre = temp;
    }
  }

  frames.push({
    rows: [
      row("字串一", first),
      row("字串二", second),
      row("最少操作", f, { answer: [m] }),
      row("上一列", [], { indexed: false }),
    ],
    message: `把 ${word1} 變成 ${word2} 最少要 ${f[m]} 次操作。每一格只算一次，一共只填了 ${filled} 格。`,
  });
  return frames;
}

export function subsequenceBrute(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const stack: string[] = [];
  const visits: Record<string, number> = {};
  let calls = 0;

  frames.push({
    rows: [row("字串", letters), row("呼叫路徑", stack, { indexed: false })],
    message: `不記結果的遞迴：每次只看這一段的左右兩端。呼叫路徑裡的 0~${letters.length - 1} 代表要算位置 0 到 ${letters.length - 1} 這一段的最長回文子序列。`,
  });

  function longest(i: number, j: number): number {
    const key = `${i}~${j}`;
    calls++;
    visits[key] = (visits[key] ?? 0) + 1;
    let again = "";
    if (visits[key] > 1) {
      again = `這一段已經是第 ${visits[key]} 次算了。`;
    }
    let result = 0;

    if (i > j) {
      stack.push("空");
      frames.push({
        rows: [row("字串", letters, { rangeEnd: -1 }), row("呼叫路徑", stack, { indexed: false })],
        message: `第 ${calls} 次呼叫：兩端中間已經沒有字元，長度是 0。`,
      });
      stack.pop();
      return 0;
    }

    stack.push(key);
    const rows = [
      row("字串", letters, { pointers: { 左端: i, 右端: j }, rangeStart: i, rangeEnd: j }),
      row("呼叫路徑", stack, { indexed: false }),
    ];

    if (i === j) {
      frames.push({
        rows,
        message: `第 ${calls} 次呼叫：只剩一個字元 ${letters[i]}，自己就是回文，長度是 1。${again}`,
      });
      result = 1;
    } else if (letters[i] === letters[j]) {
      frames.push({
        rows,
        message: `第 ${calls} 次呼叫：兩端都是 ${letters[i]}，一起選進回文，長度加 2，再往中間算。${again}`,
      });
      result = longest(i + 1, j - 1) + 2;
    } else {
      frames.push({
        rows,
        message: `第 ${calls} 次呼叫：兩端的 ${letters[i]} 和 ${letters[j]} 不同，分別試去掉左端和去掉右端，取比較長的。${again}`,
      });
      const withoutLeft = longest(i + 1, j);
      const withoutRight = longest(i, j - 1);
      result = Math.max(withoutLeft, withoutRight);
    }

    stack.pop();
    return result;
  }

  const answer = longest(0, letters.length - 1);
  const repeated = calls - Object.keys(visits).length;

  frames.push({
    rows: [row("字串", letters), row("呼叫路徑", stack, { indexed: false })],
    message: `最長回文子序列的長度是 ${answer}。不記結果的遞迴一共呼叫了 ${calls} 次，其中 ${repeated} 次是重複算同一段。`,
  });
  return frames;
}

export function subsequenceRolling(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const n = letters.length;
  const f: number[] = letters.map(() => 0);
  const shown: Cell[] = letters.map(() => "?");
  let filled = 0;

  for (let i = n - 1; i >= 0; i--) {
    let pre = 0;
    let message = `左端往左移到位置 ${i} 的 ${letters[i]}，只看它自己時長度是 1。灰色格子還留著左端在位置 ${i + 1} 時的舊值，也就是表格裡的下一列。`;
    if (i === n - 1) {
      message = `只留一列，位置 j 記錄從左端到位置 j 這一段的最長回文子序列長度。左端從最後一個字元 ${letters[i]} 開始，只有它自己，長度是 1。`;
    }
    f[i] = 1;
    shown[i] = 1;
    filled++;
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 左端: i }, rangeStart: i, rangeEnd: i }),
        row("最長長度", shown, { pointers: { 目前: i }, rangeStart: i, rangeEnd: i }),
        row("下一列", [`左下 ${pre}`], { indexed: false }),
      ],
      message,
    });

    for (let j = i + 1; j < n; j++) {
      const temp = f[j];
      const left = f[j - 1];

      if (letters[i] === letters[j]) {
        f[j] = pre + 2;
        message = `兩端都是 ${letters[i]}，一起選進回文：中間那一段的答案是左下的 ${pre}，加 2 得到 ${f[j]}。`;
      } else {
        f[j] = Math.max(temp, left);
        message = `兩端的 ${letters[i]} 和 ${letters[j]} 不同：去掉左端是下面的 ${temp}（這格的舊值），去掉右端是左邊的 ${left}，取較大的 ${f[j]}。`;
      }

      shown[j] = f[j];
      filled++;
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 左端: i, 右端: j }, rangeStart: i, rangeEnd: j }),
          row("最長長度", shown, { pointers: { 左: j - 1, 目前: j }, rangeStart: i, rangeEnd: j }),
          row("下一列", [`左下 ${pre}`, `下 ${temp}`], { indexed: false }),
        ],
        message,
      });
      pre = temp;
    }
  }

  frames.push({
    rows: [
      row("字串", letters),
      row("最長長度", shown, { answer: [n - 1] }),
      row("下一列", [], { indexed: false }),
    ],
    message: `最長回文子序列的長度是 ${f[n - 1]}。每一段只算一次，一共只填了 ${filled} 格。`,
  });
  return frames;
}

export function commonBrute(text1: string, text2: string) {
  const frames: Frame[] = [];
  const first = [...text1];
  const second = [...text2];
  const stack: string[] = [];
  const visits: Record<string, number> = {};
  let calls = 0;

  frames.push({
    rows: [row("字串一", first), row("字串二", second), row("呼叫路徑", stack, { indexed: false })],
    message: `不記結果的遞迴：每次只看兩邊最後一個字元。呼叫路徑裡的 ${first.length},${second.length} 代表比字串一的前 ${first.length} 個字元和字串二的前 ${second.length} 個字元。`,
  });

  function longest(i: number, j: number): number {
    const key = `${i},${j}`;
    calls++;
    visits[key] = (visits[key] ?? 0) + 1;
    stack.push(key);
    const rows = [
      prefixRow("字串一", first, i),
      prefixRow("字串二", second, j),
      row("呼叫路徑", stack, { indexed: false }),
    ];
    let again = "";
    if (visits[key] > 1) {
      again = `這一組已經是第 ${visits[key]} 次算了。`;
    }
    let result = 0;

    if (i === 0 || j === 0) {
      frames.push({
        rows,
        message: `第 ${calls} 次呼叫：有一邊已經沒有字元，公共子序列的長度是 0。${again}`,
      });
    } else if (first[i - 1] === second[j - 1]) {
      frames.push({
        rows,
        message: `第 ${calls} 次呼叫：兩邊最後一個字元都是 ${first[i - 1]}，配成一對，長度加 1，兩邊各去掉它再往前算。${again}`,
      });
      result = longest(i - 1, j - 1) + 1;
    } else {
      frames.push({
        rows,
        message: `第 ${calls} 次呼叫：最後的 ${first[i - 1]} 和 ${second[j - 1]} 不同，分別試去掉 ${first[i - 1]} 和去掉 ${second[j - 1]}，取比較長的。${again}`,
      });
      const withoutFirst = longest(i - 1, j);
      const withoutSecond = longest(i, j - 1);
      result = Math.max(withoutFirst, withoutSecond);
    }

    stack.pop();
    return result;
  }

  const answer = longest(first.length, second.length);
  const repeated = calls - Object.keys(visits).length;

  frames.push({
    rows: [row("字串一", first), row("字串二", second), row("呼叫路徑", stack, { indexed: false })],
    message: `最長公共子序列的長度是 ${answer}。不記結果的遞迴一共呼叫了 ${calls} 次，其中 ${repeated} 次是重複算同一組。`,
  });
  return frames;
}

export function commonRolling(text1: string, text2: string) {
  const frames: Frame[] = [];
  const first = [...text1];
  const second = [...text2];
  const n = first.length;
  const m = second.length;
  const f: number[] = [];
  for (let j = 0; j <= m; j++) {
    f.push(0);
  }
  let filled = 0;

  frames.push({
    rows: [
      row("字串一", first, { rangeEnd: -1 }),
      row("字串二", second),
      row("最長長度", f),
      row("上一列", [], { indexed: false }),
    ],
    message: "只留一列，長度跟著較短的字串二。位置 j 記錄字串一看過的部分和字串二的前 j 個字元，最長公共子序列有多長。還沒開始看，全部是 0。",
  });

  for (let i = 1; i <= n; i++) {
    const letter = first[i - 1];
    let pre = f[0];

    for (let j = 1; j <= m; j++) {
      const temp = f[j];
      const left = f[j - 1];
      const other = second[j - 1];
      let start = "";
      if (j === 1) {
        start = `字串一多看一個字元 ${letter}，灰色格子還是上一列的值。`;
      }
      let message = `${start}兩邊都是 ${letter}，配成一對：左上的 ${pre} 加 1，得到 ${pre + 1}。`;

      if (letter === other) {
        f[j] = pre + 1;
      } else {
        f[j] = Math.max(temp, left);
        message = `${start}${letter} 和 ${other} 不同：不看 ${letter} 是上面的 ${temp}，不看 ${other} 是左邊的 ${left}，取較大的 ${f[j]}。`;
      }

      filled++;
      frames.push({
        rows: [
          prefixRow("字串一", first, i),
          prefixRow("字串二", second, j),
          row("最長長度", f, { pointers: { 左: j - 1, 目前: j }, rangeEnd: j }),
          row("上一列", [`左上 ${pre}`, `上 ${temp}`], { indexed: false }),
        ],
        message,
      });
      pre = temp;
    }
  }

  frames.push({
    rows: [
      row("字串一", first),
      row("字串二", second),
      row("最長長度", f, { answer: [m] }),
      row("上一列", [], { indexed: false }),
    ],
    message: `最長公共子序列的長度是 ${f[m]}。每一格只算一次，一共只算了 ${filled} 格。`,
  });
  return frames;
}
