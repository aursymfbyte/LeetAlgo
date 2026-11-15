import { Cell, Frame, ProblemAnimation, Row, row } from "./types";

function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
}

function palindromeBrute(text: string) {
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

function palindromeManacher(text: string) {
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

function pathRows(grid: Cell[][], path: number[][]) {
  const current = path[path.length - 1];
  const rows: Row[] = [];

  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    let first = grid[rowIndex].length;
    let last = -1;
    for (const cell of path) {
      if (cell[0] === rowIndex) {
        first = Math.min(first, cell[1]);
        last = Math.max(last, cell[1]);
      }
    }

    const pointers: Record<string, number> = {};
    if (current[0] === rowIndex) {
      pointers.目前 = current[1];
    }
    rows.push(row(`第 ${rowIndex} 列`, grid[rowIndex], { pointers, rangeStart: first, rangeEnd: last }));
  }

  return rows;
}

function pathsBrute(height: number, width: number) {
  const frames: Frame[] = [];
  const grid: Cell[][] = [];
  const path: number[][] = [];
  let found = 0;
  let calls = 0;

  for (let rowIndex = 0; rowIndex < height; rowIndex++) {
    const line: Cell[] = [];
    for (let column = 0; column < width; column++) {
      line.push("·");
    }
    grid.push(line);
  }

  function walk(rowIndex: number, column: number) {
    calls++;
    path.push([rowIndex, column]);
    grid[rowIndex][column] = path.length;

    if (rowIndex === height - 1 && column === width - 1) {
      found++;
      frames.push({
        rows: pathRows(grid, path),
        message: `第 ${found} 條路徑，格子上的數字是走的順序。不記結果的遞迴每一格都先試往右、再試往下，走到右下角才算找到 1 條。`,
      });
    }
    if (column < width - 1) {
      walk(rowIndex, column + 1);
    }
    if (rowIndex < height - 1) {
      walk(rowIndex + 1, column);
    }

    grid[rowIndex][column] = "·";
    path.pop();
  }

  walk(0, 0);

  frames.push({
    rows: frames[frames.length - 1].rows,
    message: `從左上角走到右下角一共有 ${found} 條路徑。每一條都要一格一格實際走過，遞迴一共呼叫了 ${calls} 次。`,
  });
  return frames;
}

function pathsFormula(height: number, width: number) {
  const frames: Frame[] = [];
  const larger = Math.max(height, width);
  const k = Math.min(height, width) - 1;
  const steps = height + width - 2;
  const multipliers: number[] = [];
  const dividers: number[] = [];
  const results: Cell[] = [];
  let direction = "往下";
  if (width < height) {
    direction = "往右";
  }
  let result = 1;
  let operations = 0;

  for (let i = 1; i <= k; i++) {
    multipliers.push(larger - 1 + i);
    dividers.push(i);
    results.push("?");
  }

  frames.push({
    rows: [
      row("乘數", multipliers, { indexed: false }),
      row("除數", dividers, { indexed: false }),
      row("結果", results, { indexed: false }),
    ],
    message: `一定是往下 ${height - 1} 步、往右 ${width - 1} 步，共 ${steps} 步。路徑數就是從 ${steps} 步裡挑 ${k} 步${direction}的挑法。結果從 1 開始，每一輪先乘再除。`,
  });

  for (let i = 1; i <= k; i++) {
    const position = i - 1;
    const multiplier = multipliers[position];
    const product = result * multiplier;
    operations++;
    results[position] = product;
    frames.push({
      rows: [
        row("乘數", multipliers, { pointers: { 目前: position }, indexed: false }),
        row("除數", dividers, { indexed: false }),
        row("結果", results, { pointers: { 目前: position }, indexed: false }),
      ],
      message: `第 ${i} 輪先乘：目前的結果 ${result} 乘上 ${multiplier}，得到 ${product}。`,
    });

    const quotient = product / i;
    operations++;
    results[position] = quotient;
    frames.push({
      rows: [
        row("乘數", multipliers, { indexed: false }),
        row("除數", dividers, { pointers: { 目前: position }, indexed: false }),
        row("結果", results, { pointers: { 目前: position }, indexed: false }),
      ],
      message: `第 ${i} 輪再除：${product} 除以 ${i}，得到 ${quotient}。這剛好是從 ${multiplier} 步裡挑 ${i} 步的挑法，所以一定除得盡。`,
    });
    result = quotient;
  }

  frames.push({
    rows: [
      row("乘數", multipliers, { indexed: false }),
      row("除數", dividers, { indexed: false }),
      row("結果", results, { answer: [k - 1], indexed: false }),
    ],
    message: `從左上角走到右下角一共有 ${result} 條路徑。不用真的去走，一共只做了 ${operations} 次乘除。`,
  });
  return frames;
}

function minPathBrute(grid: number[][]) {
  const frames: Frame[] = [];
  const lastRow = grid.length - 1;
  const lastColumn = grid[0].length - 1;
  const visits = grid.map((line) => line.map(() => 0));
  const path: number[][] = [];
  let best = Infinity;
  let bestCell: Cell = "∞";
  let bestRows: Row[] = [];
  let paths = 0;
  let calls = 0;

  function walk(rowIndex: number, column: number, before: number) {
    const value = grid[rowIndex][column];
    const sum = before + value;
    calls++;
    visits[rowIndex][column]++;
    path.push([rowIndex, column]);
    const rows = pathRows(grid, path);

    if (rowIndex === lastRow && column === lastColumn) {
      let result = `沒有比目前最小的 ${best} 小。`;
      paths++;
      if (sum < best) {
        best = sum;
        bestCell = sum;
        bestRows = rows;
        result = "是目前最小的，記下來。";
      }
      frames.push({
        rows: [...rows, row("最小", [bestCell], { indexed: false })],
        message: `第 ${calls} 次呼叫：走到右下角，這條路徑的總和是 ${sum}，${result}`,
      });
    } else {
      let again = "";
      if (visits[rowIndex][column] > 1) {
        again = `這一格已經是第 ${visits[rowIndex][column]} 次走到了。`;
      }
      let message = `第 ${calls} 次呼叫：走到第 ${rowIndex} 列位置 ${column}，加上 ${value}，這條路徑目前的總和是 ${sum}。${again}`;
      if (calls === 1) {
        message = `不記結果的遞迴：從左上角的 ${value} 出發，每一格都先試往下、再試往右，走到右下角再退回來換方向。`;
      }
      frames.push({
        rows: [...rows, row("最小", [bestCell], { indexed: false })],
        message,
      });
    }

    if (rowIndex < lastRow) {
      walk(rowIndex + 1, column, sum);
    }
    if (column < lastColumn) {
      walk(rowIndex, column + 1, sum);
    }
    path.pop();
  }

  walk(0, 0, 0);

  frames.push({
    rows: [...bestRows, row("最小", [bestCell], { answer: [0], indexed: false })],
    message: `最小的路徑總和是 ${best}。不記結果的遞迴把 ${paths} 條路徑都走過一遍，一共呼叫了 ${calls} 次。`,
  });
  return frames;
}

function gridRows(grid: number[][]) {
  const rows: Row[] = [];
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    rows.push(row(`第 ${rowIndex} 列`, grid[rowIndex]));
  }
  return rows;
}

function minPathRolling(grid: number[][]) {
  const frames: Frame[] = [];
  const height = grid.length;
  const width = grid[0].length;
  const f: number[] = grid[0].map(() => 0);
  const shown: Cell[] = grid[0].map(() => "?");
  let filled = 0;

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const value = grid[i][j];
      const marks: Record<string, number> = { 目前: j };
      let message = "";

      if (i === 0 && j === 0) {
        f[j] = value;
        message = `只留一列「最小和」，位置 j 記錄走到目前這一列位置 j 的最小總和。左上角是起點，最小和就是它自己的 ${value}。`;
      } else if (i === 0) {
        const left = f[j - 1];
        f[j] = left + value;
        marks.左 = j - 1;
        message = `第 0 列只能從左邊走過來：左邊的 ${left} 加上這格的 ${value}，得到 ${f[j]}。`;
      } else if (j === 0) {
        const above = f[j];
        f[j] = above + value;
        message = `換到第 ${i} 列，位置 0 只能從上面來：這格原本存的是上一列的 ${above}，加上 ${value}，得到 ${f[j]}。灰色格子還是上一列的值。`;
      } else {
        const above = f[j];
        const left = f[j - 1];
        const smaller = Math.min(above, left);
        f[j] = smaller + value;
        marks.左 = j - 1;
        message = `從上面來是這格原本存的 ${above}，從左邊來是 ${left}，取較小的 ${smaller}，加上這格的 ${value}，得到 ${f[j]}。`;
      }

      shown[j] = f[j];
      filled++;
      const rows = gridRows(grid);
      rows[i].pointers = { 目前: j };
      rows.push(row("最小和", shown, { pointers: marks, rangeEnd: j }));
      frames.push({ rows, message });
    }
  }

  const rows = gridRows(grid);
  rows.push(row("最小和", shown, { answer: [width - 1] }));
  frames.push({
    rows,
    message: `走到右下角的最小總和是 ${f[width - 1]}。每一格只算一次，一共只算了 ${filled} 格。`,
  });
  return frames;
}

function prefixRow(label: string, letters: string[], length: number) {
  if (length === 0) {
    return row(label, letters, { rangeEnd: -1 });
  }
  return row(label, letters, { pointers: { 目前: length - 1 }, rangeEnd: length - 1 });
}

function editBrute(word1: string, word2: string) {
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

function editRolling(word1: string, word2: string) {
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

function coinCells(f: number[], impossible: number) {
  const cells: Cell[] = [];
  for (const value of f) {
    if (value === impossible) {
      cells.push("∞");
    } else {
      cells.push(value);
    }
  }
  return cells;
}

function coinBrute(coins: number[], amount: number) {
  const frames: Frame[] = [];
  const most = coins.map((coin) => Math.floor(amount / coin));
  let fewest = Infinity;
  let fewestCell: Cell = "∞";
  let bestCounts: number[] = [];
  let tried = 0;

  for (let first = 0; first <= most[0]; first++) {
    for (let second = 0; second <= most[1]; second++) {
      for (let third = 0; third <= most[2]; third++) {
        const counts = [first, second, third];
        const sum = first * coins[0] + second * coins[1] + third * coins[2];
        const used = first + second + third;
        const countRow = row("枚數", counts, { indexed: false });
        let result = `不是 ${amount}，不算。`;
        tried++;

        if (sum === amount) {
          if (used < fewest) {
            fewest = used;
            fewestCell = used;
            bestCounts = counts;
          }
          countRow.answer = [0, 1, 2];
          result = `湊到了，用了 ${used} 枚，目前最少是 ${fewest} 枚。`;
        }

        frames.push({
          rows: [row("硬幣", coins, { indexed: false }), countRow, row("最少", [fewestCell], { indexed: false })],
          message: `每種枚數都配一遍：${coins[0]} 用 ${first} 枚、${coins[1]} 用 ${second} 枚、${coins[2]} 用 ${third} 枚，總和是 ${sum}，${result}`,
        });
      }
    }
  }

  frames.push({
    rows: [
      row("硬幣", coins, { indexed: false }),
      row("枚數", bestCounts, { answer: [0, 1, 2], indexed: false }),
      row("最少", [fewestCell], { answer: [0], indexed: false }),
    ],
    message: `湊出金額 ${amount} 最少要 ${fewest} 枚硬幣。三層迴圈把每種枚數都配一遍，一共試了 ${tried} 種組合。`,
  });
  return frames;
}

function coinTable(coins: number[], amount: number) {
  const frames: Frame[] = [];
  const impossible = amount + 1;
  const f: number[] = [];
  for (let c = 0; c <= amount; c++) {
    f.push(impossible);
  }
  f[0] = 0;
  let updates = 0;

  frames.push({
    rows: [row("硬幣", coins, { indexed: false }), row("最少硬幣", coinCells(f, impossible))],
    message: "位置 c 記錄湊出金額 c 最少要幾枚。金額 0 不用硬幣，是 0；其他先當成湊不出來，記成 ∞。接著硬幣一種一種加進來。",
  });

  for (let index = 0; index < coins.length; index++) {
    const coin = coins[index];

    for (let c = coin; c <= amount; c++) {
      const before = f[c];
      const source = f[c - coin];
      const candidate = source + 1;
      let result = `沒有比原本的 ${before} 枚少，不變。`;

      if (before === impossible) {
        result = `原本湊不出來，記成 ${candidate}。`;
      } else if (candidate < before) {
        result = `比原本的 ${before} 枚少，改成 ${candidate}。`;
      }
      f[c] = Math.min(before, candidate);
      updates++;

      frames.push({
        rows: [
          row("硬幣", coins, { pointers: { 目前: index }, indexed: false }),
          row("最少硬幣", coinCells(f, impossible), { pointers: { 來源: c - coin, 目前: c } }),
        ],
        message: `加進面額 ${coin}：金額 ${c} 可以從金額 ${c - coin} 的 ${source} 枚再加一枚 ${coin}，共 ${candidate} 枚，${result}`,
      });
    }
  }

  frames.push({
    rows: [
      row("硬幣", coins, { indexed: false }),
      row("最少硬幣", coinCells(f, impossible), { answer: [amount] }),
    ],
    message: `湊出金額 ${amount} 最少要 ${f[amount]} 枚硬幣。每種硬幣只把金額掃一遍，一共只更新了 ${updates} 格。`,
  });
  return frames;
}

function totalOf(numbers: number[]) {
  let total = 0;
  for (const number of numbers) {
    total += number;
  }
  return total;
}

function reachCells(f: boolean[]) {
  const cells: string[] = [];
  for (const reachable of f) {
    if (reachable) {
      cells.push("可以");
    } else {
      cells.push("不行");
    }
  }
  return cells;
}

function partitionBrute(numbers: number[]) {
  const frames: Frame[] = [];
  const half = totalOf(numbers) / 2;
  const picks: string[] = numbers.map(() => "不選");
  let hitRows: Row[] = [];
  let tried = 0;
  let found = 0;

  function choose(index: number, sum: number) {
    if (index < numbers.length) {
      picks[index] = "不選";
      choose(index + 1, sum);
      picks[index] = "選";
      choose(index + 1, sum + numbers[index]);
      return;
    }

    const chosen: number[] = [];
    for (let position = 0; position < numbers.length; position++) {
      if (picks[position] === "選") {
        chosen.push(position);
      }
    }
    tried++;

    if (sum === half) {
      const rows = [row("陣列", numbers, { answer: chosen }), row("選法", picks, { answer: chosen, indexed: false })];
      found++;
      hitRows = rows;
      frames.push({
        rows,
        message: `第 ${tried} 種選法：選出的數總和是 ${sum}，剛好是一半，剩下的也是 ${half}，分得開。目前找到 ${found} 種。`,
      });
    } else {
      frames.push({
        rows: [row("陣列", numbers), row("選法", picks, { indexed: false })],
        message: `每個數都有選和不選兩種，全部列出來。第 ${tried} 種選法：選出的數總和是 ${sum}，不是一半的 ${half}。`,
      });
    }
  }

  choose(0, 0);

  frames.push({
    rows: hitRows,
    message: `有 ${found} 種選法的總和剛好是一半，所以可以分成兩組。${numbers.length} 個數每個都有選和不選，一共試了 ${tried} 種選法。`,
  });
  return frames;
}

function partitionTable(numbers: number[]) {
  const frames: Frame[] = [];
  const total = totalOf(numbers);
  const half = total / 2;
  const f: boolean[] = [];
  for (let c = 0; c <= half; c++) {
    f.push(false);
  }
  f[0] = true;
  let updates = 0;

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 }), row("湊得出", reachCells(f))],
    message: `全部總和是 ${total}，一半是 ${half}。問題變成：能不能選出一些數，總和剛好是 ${half}。位置 c 記錄湊不湊得出總和 c，一開始只有 0 可以。`,
  });

  for (let index = 0; index < numbers.length; index++) {
    const number = numbers[index];

    for (let c = half; c >= number; c--) {
      const rest = c - number;
      let result = `原本就湊得出 ${c}，不用改。`;

      if (!f[c] && f[rest]) {
        result = `原本湊不出 ${c}，但 ${rest} 湊得出來，再加上這個 ${number} 就是 ${c}，改成可以。`;
      } else if (!f[c]) {
        result = `原本湊不出 ${c}，去掉這個 ${number} 剩下的 ${rest} 也湊不出來，還是不行。`;
      }
      f[c] = f[c] || f[rest];
      updates++;

      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 目前: index }, rangeEnd: index }),
          row("湊得出", reachCells(f), { pointers: { 來源: rest, 目前: c } }),
        ],
        message: `輪到位置 ${index} 的 ${number}，總和從大到小看，才不會把它選兩次。總和 ${c}：${result}`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers), row("湊得出", reachCells(f), { answer: [half] })],
    message: `總和 ${half} 湊得出來，所以可以分成總和相等的兩組。每個數只把總和掃一遍，一共只更新了 ${updates} 格。`,
  });
  return frames;
}

function targetBrute(numbers: number[], target: number) {
  const frames: Frame[] = [];
  const signs: string[] = numbers.map(() => "+");
  let hitRows: Row[] = [];
  let tried = 0;
  let found = 0;

  function place(index: number, sum: number) {
    if (index < numbers.length) {
      signs[index] = "+";
      place(index + 1, sum + numbers[index]);
      signs[index] = "-";
      place(index + 1, sum - numbers[index]);
      return;
    }

    let expression = "";
    for (let position = 0; position < numbers.length; position++) {
      expression += signs[position] + numbers[position];
    }
    const rows = [row("陣列", numbers), row("符號", signs, { indexed: false })];
    tried++;

    if (sum === target) {
      found++;
      hitRows = rows;
      frames.push({
        rows,
        message: `第 ${tried} 種放法：${expression} = ${sum}，等於目標 ${target}，算一種，目前有 ${found} 種。`,
      });
    } else {
      frames.push({
        rows,
        message: `每個數前面放 + 或 -，全部列出來。第 ${tried} 種放法：${expression} = ${sum}，不是 ${target}。`,
      });
    }
  }

  place(0, 0);

  frames.push({
    rows: hitRows,
    message: `結果等於 ${target} 的放法有 ${found} 種。${numbers.length} 個數每個都有正負兩種符號，一共試了 ${tried} 種放法。`,
  });
  return frames;
}

function targetTable(numbers: number[], target: number) {
  const frames: Frame[] = [];
  const total = totalOf(numbers);
  const negative = (total - target) / 2;
  const f: number[] = [];
  const unknown: string[] = [];
  for (let c = 0; c <= negative; c++) {
    f.push(0);
    unknown.push("?");
  }
  f[0] = 1;
  let updates = 0;

  frames.push({
    rows: [row("陣列", numbers), row("方法數", unknown)],
    message: `全部總和是 ${total}。設放負號的數總和是 q，結果就是 (${total} - q) - q = ${target}，算出 q = ${negative}。所以只要決定哪些數放負號。`,
  });
  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 }), row("方法數", f)],
    message: `題目變成：選一些數，總和剛好是 ${negative} 的選法有幾種。位置 c 記錄湊出總和 c 的選法數，都不選就是總和 0，算 1 種。總和從大到小更新，同一個數才不會選兩次。`,
  });

  for (let index = 0; index < numbers.length; index++) {
    const number = numbers[index];

    for (let c = negative; c >= number; c--) {
      const before = f[c];
      const rest = c - number;
      const source = f[rest];
      f[c] = before + source;
      updates++;

      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 目前: index }, rangeEnd: index }),
          row("方法數", f, { pointers: { 來源: rest, 目前: c } }),
        ],
        message: `輪到位置 ${index} 的 ${number}，總和 ${c}：不選它有 ${before} 種；選它就要先湊出 ${rest}，有 ${source} 種。合起來 ${f[c]} 種。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers), row("方法數", f, { answer: [negative] })],
    message: `湊出總和 ${negative} 的選法有 ${f[negative]} 種，每一種對應一種符號放法，答案是 ${f[negative]}。一共只更新了 ${updates} 格。`,
  });
  return frames;
}

function subsequenceBrute(text: string) {
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

function subsequenceRolling(text: string) {
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

function combinationBrute(coins: number[], amount: number) {
  const frames: Frame[] = [];
  const most = coins.map((coin) => Math.floor(amount / coin));
  let hitRow = row("枚數", [], { indexed: false });
  let tried = 0;
  let found = 0;

  for (let first = 0; first <= most[0]; first++) {
    for (let second = 0; second <= most[1]; second++) {
      for (let third = 0; third <= most[2]; third++) {
        const counts = [first, second, third];
        const sum = first * coins[0] + second * coins[1] + third * coins[2];
        const countRow = row("枚數", counts, { indexed: false });
        let result = `不是 ${amount}，不算。`;
        tried++;

        if (sum === amount) {
          found++;
          countRow.answer = [0, 1, 2];
          hitRow = countRow;
          result = `剛好是 ${amount}，算一種組合，目前有 ${found} 種。`;
        }

        frames.push({
          rows: [row("硬幣", coins, { indexed: false }), countRow],
          message: `每種枚數都配一遍：${coins[0]} 用 ${first} 枚、${coins[1]} 用 ${second} 枚、${coins[2]} 用 ${third} 枚，總和是 ${sum}，${result}`,
        });
      }
    }
  }

  frames.push({
    rows: [row("硬幣", coins, { indexed: false }), hitRow],
    message: `湊出金額 ${amount} 的組合有 ${found} 種。三層迴圈把每種枚數都配一遍，一共試了 ${tried} 種組合。`,
  });
  return frames;
}

function combinationTable(coins: number[], amount: number) {
  const frames: Frame[] = [];
  const f: number[] = [];
  for (let c = 0; c <= amount; c++) {
    f.push(0);
  }
  f[0] = 1;
  let updates = 0;

  frames.push({
    rows: [row("硬幣", coins, { indexed: false }), row("組合數", f)],
    message: "位置 c 記錄湊出金額 c 的組合數。什麼都不拿就是金額 0，算 1 種。硬幣一種一種加進來，所以 1 + 2 和 2 + 1 只會算到一次。",
  });

  for (let index = 0; index < coins.length; index++) {
    const coin = coins[index];

    for (let c = coin; c <= amount; c++) {
      const before = f[c];
      const rest = c - coin;
      const source = f[rest];
      f[c] = before + source;
      updates++;

      frames.push({
        rows: [
          row("硬幣", coins, { pointers: { 目前: index }, indexed: false }),
          row("組合數", f, { pointers: { 來源: rest, 目前: c } }),
        ],
        message: `加進面額 ${coin}：金額 ${c} 不用它有 ${before} 種；用一枚就要先湊出金額 ${rest}，有 ${source} 種。合起來 ${f[c]} 種。`,
      });
    }
  }

  frames.push({
    rows: [row("硬幣", coins, { indexed: false }), row("組合數", f, { answer: [amount] })],
    message: `湊出金額 ${amount} 的組合有 ${f[amount]} 種。每種硬幣只把金額掃一遍，一共只更新了 ${updates} 格。`,
  });
  return frames;
}

function commonBrute(text1: string, text2: string) {
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

function commonRolling(text1: string, text2: string) {
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

const pathGrid = [
  [1, 3, 1],
  [1, 5, 1],
  [4, 2, 1],
];
const changeCoins = [1, 3, 4];
const partitionNumbers = [1, 1, 2, 2];
const targetNumbers = [1, 2, 1, 2];
const combinationCoins = [1, 2, 3];

export const stage6c: ProblemAnimation[] = [
  {
    problemId: 5,
    brute: palindromeBrute("ababa"),
    efficient: palindromeManacher("ababa"),
  },
  {
    problemId: 62,
    brute: pathsBrute(4, 4),
    efficient: pathsFormula(4, 4),
  },
  {
    problemId: 64,
    brute: minPathBrute(pathGrid),
    efficient: minPathRolling(pathGrid),
  },
  {
    problemId: 72,
    brute: editBrute("tea", "at"),
    efficient: editRolling("tea", "at"),
  },
  {
    problemId: 322,
    brute: coinBrute(changeCoins, 5),
    efficient: coinTable(changeCoins, 5),
  },
  {
    problemId: 416,
    brute: partitionBrute(partitionNumbers),
    efficient: partitionTable(partitionNumbers),
  },
  {
    problemId: 494,
    brute: targetBrute(targetNumbers, 2),
    efficient: targetTable(targetNumbers, 2),
  },
  {
    problemId: 516,
    brute: subsequenceBrute("abcbd"),
    efficient: subsequenceRolling("abcbd"),
  },
  {
    problemId: 518,
    brute: combinationBrute(combinationCoins, 3),
    efficient: combinationTable(combinationCoins, 3),
  },
  {
    problemId: 1143,
    brute: commonBrute("abcd", "bac"),
    efficient: commonRolling("abcd", "bac"),
  },
];
