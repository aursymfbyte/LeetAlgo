import { Cell, Frame, ProblemAnimation, Row, row } from "./types";

const phoneLetters = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];

const directions = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const stepNames = ["一", "二", "三", "四", "五", "六"];

function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
}

function orEmpty(text: string) {
  if (text === "") {
    return "空";
  }
  return text;
}

function place(rowIndex: number, column: number) {
  return `第 ${rowIndex} 列第 ${column} 格`;
}

function gridRows(grid: Cell[][], marked: number[][]) {
  const rows: Row[] = [];
  for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    const answer: number[] = [];
    for (const cell of marked) {
      if (cell[0] === rowIndex) {
        answer.push(cell[1]);
      }
    }
    rows.push(row(`第 ${rowIndex} 列`, grid[rowIndex], { answer, indexed: false }));
  }
  return rows;
}

function neighbors(grid: Cell[][], rowIndex: number, column: number) {
  const list: number[][] = [];
  for (const [rowStep, columnStep] of directions) {
    const nextRow = rowIndex + rowStep;
    const nextColumn = column + columnStep;
    if (nextRow < 0 || nextRow >= grid.length) {
      continue;
    }
    if (nextColumn < 0 || nextColumn >= grid[0].length) {
      continue;
    }
    list.push([nextRow, nextColumn]);
  }
  return list;
}

function keyCells(digits: string) {
  const cells: string[] = [];
  for (const digit of digits) {
    const letters = phoneLetters[Number(digit)];
    cells.push(`${digit}→${letters}`);
  }
  return cells;
}

function lettersByRound(digits: string) {
  const frames: Frame[] = [];
  const keys = keyCells(digits);
  let oldList: string[] = [];
  let newList = [""];
  let added = 0;

  frames.push({
    rows: [
      row("數字", keys),
      row("舊清單", oldList, { indexed: false }),
      row("新清單", newList.map(orEmpty), { indexed: false }),
    ],
    message: "一次處理一個數字：把清單裡的每個字串拿出來，後面各接上這個數字的每個字母。一開始清單裡只有一個空字串。",
  });

  for (let index = 0; index < digits.length; index++) {
    const letters = phoneLetters[Number(digits[index])];
    oldList = newList;
    newList = [];

    for (let source = 0; source < oldList.length; source++) {
      for (const letter of letters) {
        const made = oldList[source] + letter;
        newList.push(made);
        added++;
        frames.push({
          rows: [
            row("數字", keys, { pointers: { 目前: index } }),
            row("舊清單", oldList.map(orEmpty), { pointers: { 來源: source }, indexed: false }),
            row("新清單", newList, { indexed: false }),
          ],
          message: `數字 ${digits[index]} 對應 ${letters}：把舊清單的 ${orEmpty(oldList[source])} 後面接上 ${letter}，得到 ${made}，放進新清單。`,
        });
      }
    }
  }

  frames.push({
    rows: [
      row("數字", keys),
      row("舊清單", oldList.map(orEmpty), { indexed: false }),
      row("新清單", newList, { indexed: false, answer: positions(0, newList.length - 1) }),
    ],
    message: `最後的新清單就是答案，一共 ${newList.length} 種組合。每接一個字母就多出一個新字串，一共接了 ${added} 次字母。`,
  });
  return frames;
}

function lettersBacktrack(digits: string) {
  const frames: Frame[] = [];
  const keys = keyCells(digits);
  const size = digits.length;
  const path: string[] = Array(size).fill("");
  const answers: string[] = [];
  let filled = 0;

  function fill(index: number, action: string) {
    if (index === size) {
      const text = path.join("");
      answers.push(text);
      frames.push({
        rows: [row("數字", keys), row("路徑", path), row("答案", answers, { indexed: false })],
        message: `${action}每一格都填好了，把 ${text} 記進答案。`,
      });
      return;
    }

    frames.push({
      rows: [
        row("數字", keys, { pointers: { 目前: index } }),
        row("路徑", path, { pointers: { 目前: index }, rangeEnd: index - 1 }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${action}接著替數字 ${digits[index]} 填路徑的位置 ${index}。`,
    });

    for (const letter of phoneLetters[Number(digits[index])]) {
      path[index] = letter;
      filled++;
      fill(index + 1, `位置 ${index} 填 ${letter}。`);
    }
  }

  fill(0, "路徑的每一格代表一個數字選的字母，一格一格試。新字母直接蓋掉舊的，不用另外清掉；灰色的格子還沒輪到。");
  frames.push({
    rows: [
      row("數字", keys),
      row("路徑", path, { rangeEnd: -1 }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `一共 ${answers.length} 種組合。只用一條路徑反覆覆蓋，不用複製字串，一共填了 ${filled} 次字母，次數和一輪一輪接的寫法一樣。`,
  });
  return frames;
}

function parenthesesBrute(pairs: number) {
  const frames: Frame[] = [];
  const size = pairs * 2;
  const path: string[] = Array(size).fill("");
  const answers: string[] = [];
  let filled = 0;
  let listed = 0;

  function fill(position: number) {
    if (position === size) {
      const text = path.join("");
      listed++;

      let balance = 0;
      let broken = -1;
      for (let index = 0; index < size; index++) {
        if (path[index] === "(") {
          balance++;
        } else {
          balance--;
        }
        if (balance < 0) {
          broken = index;
          break;
        }
      }

      let pointers: Record<string, number> = {};
      let result = "";
      if (broken >= 0) {
        pointers = { 目前: broken };
        result = `讀到位置 ${broken} 時，右括號比左括號多，不合法，丟掉。`;
      } else if (balance > 0) {
        result = `讀完還有 ${balance} 個左括號沒配到右括號，不合法，丟掉。`;
      } else {
        answers.push(text);
        result = "每個右括號都配得到前面的左括號，合法，記進答案。";
      }

      frames.push({
        rows: [row("字串", path, { pointers }), row("答案", answers, { indexed: false })],
        message: `每一格都試左、右兩種括號，列出第 ${listed} 個字串 ${text}：${result}`,
      });
      return;
    }

    for (const mark of ["(", ")"]) {
      path[position] = mark;
      filled++;
      fill(position + 1);
    }
  }

  fill(0);
  frames.push({
    rows: [
      row("字串", path, { rangeEnd: -1 }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `合法的有 ${answers.length} 個。${size} 格每格都有兩種填法，一共填了 ${filled} 次括號，列出 ${listed} 個字串才挑出來。`,
  });
  return frames;
}

function parenthesesBacktrack(pairs: number) {
  const frames: Frame[] = [];
  const path: string[] = Array(pairs * 2).fill("");
  const answers: string[] = [];
  let filled = 0;

  function fill(open: number, close: number, action: string) {
    const position = open + close;
    if (close === pairs) {
      const text = path.join("");
      answers.push(text);
      frames.push({
        rows: [row("字串", path), row("答案", answers, { indexed: false })],
        message: `${action}${pairs} 個右括號都放完了，${text} 一定合法，記進答案。`,
      });
      return;
    }

    let choices = "左括號還沒用完、右括號也比左括號少，兩種都能放，先試左括號。";
    if (close === open) {
      choices = "右括號沒有比左括號少，再放右括號會不合法，只能放左括號。";
    }
    if (open === pairs) {
      choices = "左括號用完了，只能放右括號。";
    }
    frames.push({
      rows: [
        row("字串", path, { pointers: { 目前: position }, rangeEnd: position - 1 }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${action}現在左括號 ${open} 個、右括號 ${close} 個。${choices}`,
    });

    if (open < pairs) {
      path[position] = "(";
      filled++;
      fill(open + 1, close, `位置 ${position} 放左括號。`);
    }
    if (close < open) {
      let turn = `位置 ${position} 放右括號。`;
      if (open < pairs) {
        turn = `放左括號的路走完了，退回來，位置 ${position} 改放右括號。`;
      }
      path[position] = ")";
      filled++;
      fill(open, close + 1, turn);
    }
  }

  fill(0, 0, "邊填邊守規則，填出來的一定合法，不用事後檢查。灰色的格子還沒輪到，舊內容會被蓋掉。");
  frames.push({
    rows: [
      row("字串", path, { rangeEnd: -1 }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `合法的有 ${answers.length} 個。只往合法的方向填，每一條路都通到答案，一共只填了 ${filled} 次括號。`,
  });
  return frames;
}

function combinationSumBrute(candidates: number[], target: number) {
  const frames: Frame[] = [];
  const path: number[] = [];
  const answers: string[] = [];
  let picked = 0;

  frames.push({
    rows: [row("候選", candidates), row("路徑", path, { indexed: false }), row("答案", answers, { indexed: false })],
    message: `要湊出 ${target}，同一個數可以重複選；下一個數只能選自己或右邊的數，才不會重複。暴力解不管大小先選再說，選完才看總和。`,
  });

  function pick(start: number, sum: number) {
    for (let index = start; index < candidates.length; index++) {
      const number = candidates[index];
      const total = sum + number;
      path.push(number);
      picked++;

      let result = `總和是 ${total}，還不到 ${target}，繼續往下選。`;
      if (total === target) {
        answers.push(path.join(","));
        result = `總和剛好是 ${target}，把 ${path.join(",")} 記進答案。`;
      }
      if (total > target) {
        result = `總和變成 ${total}，超過 ${target} 了，選完才發現走不通，退回去。`;
      }
      frames.push({
        rows: [
          row("候選", candidates, { pointers: { 目前: index }, rangeStart: start }),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `選 ${number}，${result}`,
      });

      if (total < target) {
        pick(index, total);
      }
      path.pop();
    }
  }

  pick(0, 0);
  frames.push({
    rows: [
      row("候選", candidates),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `總和是 ${target} 的組合有 ${answers.length} 組。不管會不會超過都先選再說，一共選了 ${picked} 次數。`,
  });
  return frames;
}

function combinationSumPruned(candidates: number[], target: number) {
  const frames: Frame[] = [];
  const sorted = [...candidates];
  sorted.sort((a, b) => a - b);
  const path: number[] = [];
  const answers: string[] = [];
  let picked = 0;

  frames.push({
    rows: [row("候選", sorted), row("路徑", path, { indexed: false }), row("答案", answers, { indexed: false })],
    message: `要湊出 ${target}。先把候選數由小到大排序，並記住還要湊多少。選之前先比大小，比剩下的還大就不選，後面更大的也不用試。`,
  });

  function pick(start: number, remaining: number) {
    if (remaining === 0) {
      const last = path[path.length - 1];
      answers.push(path.join(","));
      frames.push({
        rows: [
          row("候選", sorted, { pointers: { 目前: start }, rangeStart: start }),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `選 ${last}，剛好湊滿 ${target}，把 ${path.join(",")} 記進答案。`,
      });
      return;
    }

    for (let index = start; index < sorted.length; index++) {
      const number = sorted[index];
      if (number > remaining) {
        frames.push({
          rows: [
            row("候選", sorted, { pointers: { 目前: index }, rangeStart: start }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `還要湊 ${remaining}，但 ${number} 比它大。候選排過序，後面的數只會更大，不用再試，退回去。`,
        });
        break;
      }

      path.push(number);
      picked++;
      const left = remaining - number;
      if (left > 0) {
        frames.push({
          rows: [
            row("候選", sorted, { pointers: { 目前: index }, rangeStart: start }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `還要湊 ${remaining}，${number} 沒有比它大，選 ${number}，還剩 ${left} 要湊。`,
        });
      }
      pick(index, left);
      path.pop();
    }
  }

  pick(0, target);
  frames.push({
    rows: [
      row("候選", sorted),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `總和是 ${target} 的組合有 ${answers.length} 組。太大的數在選之前就擋掉，一共只選了 ${picked} 次數。`,
  });
  return frames;
}

function yesNo(flags: boolean[]) {
  const cells: string[] = [];
  for (const flag of flags) {
    if (flag) {
      cells.push("是");
    } else {
      cells.push("否");
    }
  }
  return cells;
}

function permuteBrute(numbers: number[]) {
  const frames: Frame[] = [];
  const size = numbers.length;
  const path: Cell[] = numbers.map(() => "");
  const answers: string[] = [];
  let filled = 0;
  let listed = 0;

  function fill(position: number) {
    if (position === size) {
      const text = path.join("、");
      const kinds = new Set(path).size;
      listed++;

      let result = "裡面有重複的數，不是排列，丟掉。";
      if (kinds === size) {
        answers.push(path.join(","));
        result = `${size} 個數都不一樣，記進答案。`;
      }
      frames.push({
        rows: [row("陣列", numbers), row("路徑", path), row("答案", answers, { indexed: false })],
        message: `每個位置都可以放任何一個數，列出第 ${listed} 種：${text}，${result}`,
      });
      return;
    }

    for (const number of numbers) {
      path[position] = number;
      filled++;
      fill(position + 1);
    }
  }

  fill(0);
  frames.push({
    rows: [
      row("陣列", numbers),
      row("路徑", path, { rangeEnd: -1 }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `排列有 ${answers.length} 種。每個位置都把 ${size} 個數試一遍，一共填了 ${filled} 次數，列出 ${listed} 種才挑出來。`,
  });
  return frames;
}

function permuteBacktrack(numbers: number[]) {
  const frames: Frame[] = [];
  const size = numbers.length;
  const path: Cell[] = numbers.map(() => "");
  const used = numbers.map(() => false);
  const answers: string[] = [];
  let filled = 0;

  function fill(position: number, action: string) {
    if (position === size) {
      answers.push(path.join(","));
      frames.push({
        rows: [
          row("陣列", numbers),
          row("用過", yesNo(used)),
          row("路徑", path),
          row("答案", answers, { indexed: false }),
        ],
        message: `${action}${size} 個位置都放滿了，把 ${path.join(",")} 記進答案。`,
      });
      return;
    }

    frames.push({
      rows: [
        row("陣列", numbers),
        row("用過", yesNo(used)),
        row("路徑", path, { pointers: { 目前: position }, rangeEnd: position - 1 }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${action}接著從還沒用過的數裡，挑一個放進路徑的位置 ${position}。`,
    });

    for (let index = 0; index < size; index++) {
      if (!used[index]) {
        used[index] = true;
        path[position] = numbers[index];
        filled++;
        fill(position + 1, `位置 ${position} 放 ${numbers[index]}，把它標成用過。`);
        used[index] = false;
      }
    }
  }

  fill(0, "用過的數不能再選，退回來時再把標記改回「否」。灰色的格子還沒輪到，舊內容會被蓋掉。");
  frames.push({
    rows: [
      row("陣列", numbers),
      row("用過", yesNo(used)),
      row("路徑", path, { rangeEnd: -1 }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `排列有 ${answers.length} 種。用過的數不再選，排出來的一定沒有重複，一共只填了 ${filled} 次數。`,
  });
  return frames;
}

function queenGrid(size: number, queens: number[]) {
  const grid: string[][] = [];
  for (let rowIndex = 0; rowIndex < size; rowIndex++) {
    const line: string[] = Array(size).fill("");
    grid.push(line);
  }
  for (let rowIndex = 0; rowIndex < queens.length; rowIndex++) {
    const column = queens[rowIndex];
    grid[rowIndex][column] = "后";
  }
  return grid;
}

function queenCells(queens: number[]) {
  return queens.map((column, rowIndex) => [rowIndex, column]);
}

function answerCells(solutions: number[][]) {
  return solutions.map((queens) => queens.join(","));
}

function attacking(queens: number[]) {
  for (let lower = 0; lower < queens.length; lower++) {
    for (let upper = 0; upper < lower; upper++) {
      const columnGap = Math.abs(queens[lower] - queens[upper]);
      const rowGap = lower - upper;
      if (columnGap === 0 || columnGap === rowGap) {
        return true;
      }
    }
  }
  return false;
}

function queensBrute(size: number) {
  const frames: Frame[] = [];
  const queens: number[] = [];
  const solutions: number[][] = [];
  let placed = 0;
  let boards = 0;

  frames.push({
    rows: [...gridRows(queenGrid(size, []), []), row("答案", [], { indexed: false })],
    message: `每一列放一個皇后。暴力解每一列都隨便放，${size} 列全放完才檢查，一共有 ${size ** size} 種擺法。答案記的是每一列的皇后在第幾格。`,
  });

  function fillRest(rowIndex: number) {
    if (rowIndex === size) {
      boards++;
      if (!attacking(queens)) {
        solutions.push([...queens]);
      }
      return;
    }
    for (let column = 0; column < size; column++) {
      queens[rowIndex] = column;
      placed++;
      fillRest(rowIndex + 1);
    }
  }

  for (let first = 0; first < size; first++) {
    queens[0] = first;
    placed++;

    for (let second = 0; second < size; second++) {
      queens[1] = second;
      placed++;
      const boardsBefore = boards;
      const foundBefore = solutions.length;
      fillRest(2);

      const fixed = queens.slice(0, 2);
      const count = boards - boardsBefore;
      const found = solutions.length - foundBefore;
      const start = `第 0 列放第 ${first} 格、第 1 列放第 ${second} 格`;

      if (found > 0) {
        const solution = solutions[solutions.length - 1];
        frames.push({
          rows: [
            ...gridRows(queenGrid(size, solution), queenCells(solution)),
            row("答案", answerCells(solutions), { indexed: false }),
          ],
          message: `${start}：後面 ${size - 2} 列的 ${count} 種擺法都擺完才檢查，有 ${found} 種沒有互相攻擊，記進答案。`,
        });
      } else if (attacking(fixed)) {
        frames.push({
          rows: [...gridRows(queenGrid(size, fixed), []), row("答案", answerCells(solutions), { indexed: false })],
          message: `${start}，這兩個皇后已經互相攻擊，暴力解還是把後面的 ${count} 種擺法都擺完才檢查，全部不合格。`,
        });
      } else {
        frames.push({
          rows: [...gridRows(queenGrid(size, fixed), []), row("答案", answerCells(solutions), { indexed: false })],
          message: `${start}：後面 ${size - 2} 列的 ${count} 種擺法都擺完才檢查，每一種都有皇后互相攻擊。`,
        });
      }
    }
  }

  const shown = solutions[0];
  frames.push({
    rows: [
      ...gridRows(queenGrid(size, shown), queenCells(shown)),
      row("答案", answerCells(solutions), { indexed: false, answer: positions(0, solutions.length - 1) }),
    ],
    message: `${size} 皇后有 ${solutions.length} 種擺法，棋盤上是第一種。${boards} 種擺法全部擺完才檢查，一共放了 ${placed} 次皇后。`,
  });
  return frames;
}

function queensBacktrack(size: number) {
  const frames: Frame[] = [];
  const queens: number[] = Array(size).fill(0);
  const columnUsed: boolean[] = Array(size).fill(false);
  const slashUsed: boolean[] = Array(2 * size - 1).fill(false);
  const backslashUsed: boolean[] = Array(2 * size - 1).fill(false);
  const solutions: number[][] = [];
  let placed = 0;

  function attacked(rowIndex: number, column: number) {
    const slash = rowIndex + column;
    const backslash = rowIndex - column + size - 1;
    return columnUsed[column] || slashUsed[slash] || backslashUsed[backslash];
  }

  function fillRow(rowIndex: number, action: string) {
    const grid = queenGrid(size, queens.slice(0, rowIndex));
    if (rowIndex === size) {
      solutions.push([...queens]);
      frames.push({
        rows: [...gridRows(grid, queenCells(queens)), row("答案", answerCells(solutions), { indexed: false })],
        message: `${action}${size} 列都放好了，沒有皇后互相攻擊，記進答案。`,
      });
      return;
    }

    const free: number[] = [];
    for (let column = 0; column < size; column++) {
      if (attacked(rowIndex, column)) {
        grid[rowIndex][column] = "×";
      } else {
        free.push(column);
      }
    }
    let next = `第 ${rowIndex} 列能放的是第 ${free.join("、")} 格。`;
    if (free.length === 0) {
      next = `第 ${rowIndex} 列每一格都畫了 ×，放不下去，退回去換別格。`;
    }
    frames.push({
      rows: [...gridRows(grid, []), row("答案", answerCells(solutions), { indexed: false })],
      message: `${action}${next}`,
    });

    for (let column = 0; column < size; column++) {
      if (!attacked(rowIndex, column)) {
        const slash = rowIndex + column;
        const backslash = rowIndex - column + size - 1;
        queens[rowIndex] = column;
        columnUsed[column] = true;
        slashUsed[slash] = true;
        backslashUsed[backslash] = true;
        placed++;
        fillRow(rowIndex + 1, `第 ${rowIndex} 列放第 ${column} 格。`);
        columnUsed[column] = false;
        slashUsed[slash] = false;
        backslashUsed[backslash] = false;
      }
    }
  }

  fillRow(0, "一列一列放，放之前先看直行和兩條斜線有沒有皇后；會被攻擊的格子畫 ×，不放。");
  const shown = solutions[0];
  frames.push({
    rows: [
      ...gridRows(queenGrid(size, shown), queenCells(shown)),
      row("答案", answerCells(solutions), { indexed: false, answer: positions(0, solutions.length - 1) }),
    ],
    message: `${size} 皇后有 ${solutions.length} 種擺法，棋盤上是第一種。會被攻擊的格子一開始就不放，一共只放了 ${placed} 次皇后。`,
  });
  return frames;
}

function combineBrute(top: number, size: number) {
  const frames: Frame[] = [];
  const numbers = positions(1, top);
  const path: number[] = [];
  const answers: string[] = [];
  let decided = 0;
  let listed = 0;

  function choose(number: number) {
    if (number > top) {
      const text = orEmpty(path.join(","));
      listed++;

      let result = `有 ${path.length} 個數，不是 ${size} 個，丟掉。`;
      if (path.length === size) {
        answers.push(text);
        result = `剛好有 ${size} 個數，記進答案。`;
      }
      frames.push({
        rows: [
          row("數字", numbers, { indexed: false }),
          row("子集", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `每個數都決定選或不選，列出第 ${listed} 個子集 ${text}：${result}`,
      });
      return;
    }

    path.push(number);
    decided++;
    choose(number + 1);
    path.pop();
    decided++;
    choose(number + 1);
  }

  choose(1);
  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("子集", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `從 1 到 ${top} 選 ${size} 個，一共 ${answers.length} 種。${listed} 個子集全部列出來才挑，選或不選一共決定了 ${decided} 次。`,
  });
  return frames;
}

function combineBacktrack(top: number, size: number) {
  const frames: Frame[] = [];
  const numbers = positions(1, top);
  const path: number[] = [];
  const answers: string[] = [];
  let decided = 0;

  function choose(start: number, action: string) {
    const need = size - path.length;
    if (need === 0) {
      const chosen = path[path.length - 1];
      answers.push(path.join(","));
      frames.push({
        rows: [
          row("數字", numbers, { pointers: { 目前: chosen - 1 }, indexed: false }),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `${action}湊滿 ${size} 個了，把 ${path.join(",")} 記進答案。`,
      });
      return;
    }

    const last = top - need + 1;
    frames.push({
      rows: [
        row("數字", numbers, { rangeStart: start - 1, rangeEnd: last - 1, indexed: false }),
        row("路徑", path, { indexed: false }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${action}還要選 ${need} 個，下一個數從 ${start} 開始，最多到 ${last}，再往後剩下的數就不夠了。`,
    });

    for (let number = start; number <= last; number++) {
      path.push(number);
      decided++;
      choose(number + 1, `選 ${number}。`);
      path.pop();
    }
  }

  choose(1, "只往後選，同一組數就只會出現一次。");
  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `從 1 到 ${top} 選 ${size} 個，一共 ${answers.length} 種。只走湊得滿的路，每一條都通到答案，選哪個數一共只決定了 ${decided} 次。`,
  });
  return frames;
}

function subsetsByCopy(numbers: number[]) {
  const frames: Frame[] = [];
  const subsets: number[][] = [[]];
  let added = 0;

  function subsetCells() {
    return subsets.map((subset) => orEmpty(subset.join(",")));
  }

  frames.push({
    rows: [row("陣列", numbers), row("答案", subsetCells(), { indexed: false })],
    message: "答案裡先放一個空的子集。之後每看到一個數，就把答案裡現有的子集各複製一份，在複製品裡放進這個數。",
  });

  for (let index = 0; index < numbers.length; index++) {
    const number = numbers[index];
    const count = subsets.length;

    for (let source = 0; source < count; source++) {
      const copy = [...subsets[source], number];
      const before = orEmpty(subsets[source].join(","));
      subsets.push(copy);
      added++;
      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 目前: index } }),
          row("答案", subsetCells(), { pointers: { 來源: source, 新的: subsets.length - 1 }, indexed: false }),
        ],
        message: `輪到 ${number}：複製答案裡的 ${before}，再放進 ${number}，得到新的子集 ${copy.join(",")}。`,
      });
    }
  }

  frames.push({
    rows: [
      row("陣列", numbers),
      row("答案", subsetCells(), { indexed: false, answer: positions(0, subsets.length - 1) }),
    ],
    message: `一共 ${subsets.length} 個子集。每多一個數，子集的數量就變兩倍，一共放了 ${added} 次數。`,
  });
  return frames;
}

function subsetsBacktrack(numbers: number[]) {
  const frames: Frame[] = [];
  const path: number[] = [];
  const answers: string[] = [];
  let added = 0;

  function choose(index: number, action: string) {
    if (index === numbers.length) {
      const text = orEmpty(path.join(","));
      answers.push(text);
      frames.push({
        rows: [
          row("陣列", numbers),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `${action}每個數都決定完了，把 ${text} 記進答案。`,
      });
      return;
    }

    const number = numbers[index];
    frames.push({
      rows: [
        row("陣列", numbers, { pointers: { 目前: index } }),
        row("路徑", path, { indexed: false }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${action}接著決定 ${number} 要不要選，先走不選的路。`,
    });

    choose(index + 1, `不選 ${number}。`);
    path.push(number);
    added++;
    choose(index + 1, `退回來，改成選 ${number}，放進路徑。`);
    path.pop();
  }

  choose(0, "每個數只有選或不選兩條路，一個一個決定，全部決定完就是一個子集。");
  frames.push({
    rows: [
      row("陣列", numbers),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `一共 ${answers.length} 個子集。一共放了 ${added} 次數，次數和一份一份複製的寫法一樣；子集本來就有這麼多個，省不了。`,
  });
  return frames;
}

function wordSearchBrute(grid: string[][], word: string) {
  const frames: Frame[] = [];
  const letters = [...word];
  const used = grid.map((line) => line.map(() => false));
  const trail: number[][] = [];
  let spelled: string[] = [];
  let found: number[][] = [];
  let walked = 0;

  frames.push({
    rows: [...gridRows(grid, []), row("單字", letters), row("拼出", spelled)],
    message: `要在網格裡拼出 ${word}：從某一格出發，每次往上下左右走一格，同一格不能走兩次。暴力解每一格都當起點，把每一條路都走滿再比對。`,
  });

  function walk(rowIndex: number, column: number) {
    trail.push([rowIndex, column]);
    used[rowIndex][column] = true;
    walked++;
    let success = false;

    if (trail.length === word.length) {
      const rows = gridRows(grid, []);
      for (let step = 0; step < trail.length; step++) {
        const [stepRow, stepColumn] = trail[step];
        rows[stepRow].pointers[stepNames[step]] = stepColumn;
      }
      spelled = trail.map((cell) => grid[cell[0]][cell[1]]);
      const text = spelled.join("");
      const [startRow, startColumn] = trail[0];

      let result = `不是 ${word}，這條路白走了。`;
      if (text === word) {
        success = true;
        found = [...trail];
        result = `和 ${word} 一樣，找到了。`;
      }
      frames.push({
        rows: [...rows, row("單字", letters), row("拼出", spelled)],
        message: `從${place(startRow, startColumn)}出發，不管字母對不對，先走滿 ${word.length} 格再比對：拼出 ${text}，${result}`,
      });
    } else {
      for (const [nextRow, nextColumn] of neighbors(grid, rowIndex, column)) {
        if (used[nextRow][nextColumn]) {
          continue;
        }
        if (walk(nextRow, nextColumn)) {
          success = true;
          break;
        }
      }
    }

    used[rowIndex][column] = false;
    trail.pop();
    return success;
  }

  function walkAll() {
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      for (let column = 0; column < grid[0].length; column++) {
        if (walk(rowIndex, column)) {
          return true;
        }
      }
    }
    return false;
  }

  let result = `在網格裡找到 ${word} 了。`;
  if (!walkAll()) {
    result = `每一條路都走過了，拼不出 ${word}。`;
  }
  frames.push({
    rows: [...gridRows(grid, found), row("單字", letters), row("拼出", spelled)],
    message: `${result}每一條路都走滿 ${word.length} 格才比對，一共走了 ${walked} 格。`,
  });
  return frames;
}

function wordSearchBacktrack(grid: string[][], word: string) {
  const frames: Frame[] = [];
  const board = grid.map((line) => [...line]);
  const letters = [...word];
  const lastIndex = word.length - 1;
  let found: number[][] = [];
  let walked = 0;

  frames.push({
    rows: [...gridRows(grid, []), row("單字", letters)],
    message: `要在網格裡拼出 ${word}：從某一格出發，每次往上下左右走一格，同一格不能走兩次。每一格輪流當起點，每走一格就先比對字母。`,
  });

  function search(rowIndex: number, column: number, index: number) {
    const rows = gridRows(board, []);
    rows[rowIndex].pointers = { 目前: column };
    const wordRow = row("單字", letters, { pointers: { 目前: index } });
    const here = `${place(rowIndex, column)}是 ${board[rowIndex][column]}`;
    walked++;

    if (board[rowIndex][column] === "#") {
      frames.push({
        rows: [...rows, wordRow],
        message: `${here}，代表這條路已經用過這一格，不能再用，退回去。`,
      });
      return false;
    }
    if (board[rowIndex][column] !== word[index]) {
      frames.push({
        rows: [...rows, wordRow],
        message: `${here}，要找的是 ${word[index]}，不一樣，這條路不通，馬上退回去。`,
      });
      return false;
    }
    if (index === lastIndex) {
      for (let markRow = 0; markRow < board.length; markRow++) {
        for (let markColumn = 0; markColumn < board[0].length; markColumn++) {
          if (board[markRow][markColumn] === "#") {
            found.push([markRow, markColumn]);
          }
        }
      }
      found.push([rowIndex, column]);
      frames.push({
        rows: [...rows, wordRow],
        message: `${here}，和最後一個字母一樣，整個單字都拼出來了。`,
      });
      return true;
    }

    frames.push({
      rows: [...rows, wordRow],
      message: `${here}，和要找的 ${word[index]} 一樣。把這格暫時改成 #，免得重複走，再往四個方向找 ${word[index + 1]}。`,
    });
    board[rowIndex][column] = "#";
    let success = false;
    for (const [nextRow, nextColumn] of neighbors(board, rowIndex, column)) {
      if (search(nextRow, nextColumn, index + 1)) {
        success = true;
        break;
      }
    }
    board[rowIndex][column] = word[index];
    return success;
  }

  function searchAll() {
    for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
      for (let column = 0; column < board[0].length; column++) {
        if (search(rowIndex, column, 0)) {
          return true;
        }
      }
    }
    return false;
  }

  let result = `在網格裡找到 ${word} 了。`;
  if (!searchAll()) {
    result = `每一格都當過起點了，拼不出 ${word}。`;
  }
  frames.push({
    rows: [...gridRows(grid, found), row("單字", letters)],
    message: `${result}每走一格就先比對字母，不對馬上退回，一共只走了 ${walked} 格。`,
  });
  return frames;
}

function isPalindrome(text: string, left: number, right: number) {
  while (left < right) {
    if (text[left] !== text[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

function partitionBrute(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const lastIndex = text.length - 1;
  const path: string[] = [];
  const answers: string[] = [];
  let cuts = 0;
  let listed = 0;

  frames.push({
    rows: [row("字串", letters), row("路徑", path, { indexed: false }), row("答案", answers, { indexed: false })],
    message: "要把字串切成幾段，每一段都要是回文。暴力解不管是不是回文先切再說，整個字串切完才一段一段檢查。",
  });

  function cut(start: number) {
    for (let end = start; end <= lastIndex; end++) {
      const part = text.slice(start, end + 1);
      path.push(part);
      cuts++;

      let result = "剩下的繼續切。";
      if (end === lastIndex) {
        listed++;
        let bad = "";
        for (const piece of path) {
          if (!isPalindrome(piece, 0, piece.length - 1)) {
            bad = piece;
            break;
          }
        }
        if (bad === "") {
          answers.push(path.join("|"));
          result = "整個字串切完了，這時才檢查：每一段都是回文，記進答案。";
        } else {
          result = `整個字串切完了，這時才檢查：${bad} 不是回文，這種切法作廢。`;
        }
      }
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end }),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `不管是不是回文，先切下 ${part}。${result}`,
      });

      if (end < lastIndex) {
        cut(end + 1);
      }
      path.pop();
    }
  }

  cut(0);
  frames.push({
    rows: [
      row("字串", letters),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `每一段都是回文的切法有 ${answers.length} 種。${listed} 種切法全部切完才檢查，一共切下了 ${cuts} 段。`,
  });
  return frames;
}

function partitionBacktrack(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const size = text.length;
  const path: string[] = [];
  const answers: string[] = [];
  let cuts = 0;

  frames.push({
    rows: [row("字串", letters), row("路徑", path, { indexed: false }), row("答案", answers, { indexed: false })],
    message: "要把字串切成幾段，每一段都要是回文。切之前先檢查這一段是不是回文，不是就不切，也不用往下走。",
  });

  function cut(start: number) {
    if (start === size) {
      answers.push(path.join("|"));
      frames.push({
        rows: [row("字串", letters), row("路徑", path, { indexed: false }), row("答案", answers, { indexed: false })],
        message: `切到字串結尾了，路徑裡每一段都是回文，把 ${path.join("|")} 記進答案。`,
      });
      return;
    }

    for (let end = start; end < size; end++) {
      const part = text.slice(start, end + 1);
      if (isPalindrome(text, start, end)) {
        path.push(part);
        cuts++;
        frames.push({
          rows: [
            row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `從位置 ${start} 切到位置 ${end}：${part} 是回文，可以切，放進路徑。`,
        });
        cut(end + 1);
        path.pop();
      } else {
        frames.push({
          rows: [
            row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `從位置 ${start} 切到位置 ${end}：${part} 不是回文，不切，這個方向不用往下走。`,
        });
      }
    }
  }

  cut(0);
  frames.push({
    rows: [
      row("字串", letters),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `每一段都是回文的切法有 ${answers.length} 種。切之前先檢查，不是回文就不往下切，一共只切下了 ${cuts} 段。`,
  });
  return frames;
}

function sumThreeBrute(size: number, target: number) {
  const frames: Frame[] = [];
  const numbers = positions(1, 9);
  const path: number[] = [];
  const answers: string[] = [];
  let picked = 0;
  let tried = 0;

  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false }),
    ],
    message: `從 1 到 9 選 ${size} 個不同的數，總和要是 ${target}。暴力解不管數字大小，每一種選法都選滿 ${size} 個，最後才算總和。`,
  });

  function pickRest(start: number) {
    if (path.length === size) {
      let sum = 0;
      for (const number of path) {
        sum += number;
      }
      tried++;
      if (sum === target) {
        answers.push(path.join(","));
      }
      return;
    }
    for (let number = start; number <= 9; number++) {
      path.push(number);
      picked++;
      pickRest(number + 1);
      path.pop();
    }
  }

  for (let first = 1; first <= 9; first++) {
    const triedBefore = tried;
    const foundBefore = answers.length;
    path.push(first);
    picked++;
    pickRest(first + 1);

    const count = tried - triedBefore;
    const found = answers.length - foundBefore;
    let result = `後面沒有數可以選了，湊不滿 ${size} 個。`;
    if (count > 0) {
      result = `後面的數全部配一遍，${count} 種選法都選滿才算總和，沒有一種等於 ${target}。`;
    }
    if (found > 0) {
      result = `後面的數全部配一遍，${count} 種選法都選滿才算總和，等於 ${target} 的有 ${found} 種，記進答案。`;
    }
    frames.push({
      rows: [
        row("數字", numbers, { pointers: { 目前: first - 1 }, rangeStart: first - 1, indexed: false }),
        row("路徑", path, { indexed: false }),
        row("答案", answers, { indexed: false }),
      ],
      message: `第一個數選 ${first}：${result}`,
    });
    path.pop();
  }

  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `${size} 個數加起來是 ${target} 的組合有 ${answers.length} 組。${tried} 種選法全部選滿才算總和，一共選了 ${picked} 次數。`,
  });
  return frames;
}

function sumThreeBacktrack(size: number, target: number) {
  const frames: Frame[] = [];
  const numbers = positions(1, 9);
  const path: number[] = [];
  const answers: string[] = [];
  let picked = 0;

  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false }),
    ],
    message: `從 1 到 9 選 ${size} 個不同的數，總和要是 ${target}。記住還要湊多少：比它大的數不選，後面更大的也不試；剩下的數不夠選也不走。`,
  });

  function pick(start: number, remaining: number) {
    const need = size - path.length;
    if (need === 0) {
      const chosen = path[path.length - 1];
      let result = `但還差 ${remaining} 才到 ${target}，不是答案，退回去。`;
      if (remaining === 0) {
        answers.push(path.join(","));
        result = `總和剛好是 ${target}，把 ${path.join(",")} 記進答案。`;
      }
      frames.push({
        rows: [
          row("數字", numbers, { pointers: { 目前: chosen - 1 }, rangeStart: chosen - 1, indexed: false }),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `選 ${chosen}，選滿 ${size} 個了，${result}`,
      });
      return;
    }

    const last = 9 - need + 1;
    for (let number = start; number <= last; number++) {
      if (number > remaining) {
        frames.push({
          rows: [
            row("數字", numbers, { pointers: { 目前: number - 1 }, rangeStart: start - 1, rangeEnd: last - 1, indexed: false }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `還要湊 ${remaining}，但 ${number} 比它大，後面的數只會更大，不用再試，退回去。`,
        });
        break;
      }

      path.push(number);
      picked++;
      const left = remaining - number;
      if (need > 1) {
        frames.push({
          rows: [
            row("數字", numbers, { pointers: { 目前: number - 1 }, rangeStart: start - 1, rangeEnd: last - 1, indexed: false }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `還要湊 ${remaining}，${number} 沒有比它大，選 ${number}。還要再選 ${need - 1} 個數，湊出 ${left}。`,
        });
      }
      pick(number + 1, left);
      path.pop();
    }
  }

  pick(1, target);
  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `${size} 個數加起來是 ${target} 的組合有 ${answers.length} 組。太大的數在選之前就擋掉，一共只選了 ${picked} 次數。`,
  });
  return frames;
}

const sumCandidates = [2, 3, 5];
const permuteNumbers = [1, 2, 3];
const subsetNumbers = [1, 2, 3];
const wordGrid = [
  ["B", "S", "T"],
  ["D", "C", "A"],
  ["E", "A", "R"],
];

export const stage4c: ProblemAnimation[] = [
  {
    problemId: 17,
    brute: lettersByRound("23"),
    efficient: lettersBacktrack("23"),
  },
  {
    problemId: 22,
    brute: parenthesesBrute(2),
    efficient: parenthesesBacktrack(2),
  },
  {
    problemId: 39,
    brute: combinationSumBrute(sumCandidates, 7),
    efficient: combinationSumPruned(sumCandidates, 7),
  },
  {
    problemId: 46,
    brute: permuteBrute(permuteNumbers),
    efficient: permuteBacktrack(permuteNumbers),
  },
  {
    problemId: 51,
    brute: queensBrute(4),
    efficient: queensBacktrack(4),
  },
  {
    problemId: 77,
    brute: combineBrute(4, 2),
    efficient: combineBacktrack(4, 2),
  },
  {
    problemId: 78,
    brute: subsetsByCopy(subsetNumbers),
    efficient: subsetsBacktrack(subsetNumbers),
  },
  {
    problemId: 79,
    brute: wordSearchBrute(wordGrid, "CAT"),
    efficient: wordSearchBacktrack(wordGrid, "CAT"),
  },
  {
    problemId: 131,
    brute: partitionBrute("abac"),
    efficient: partitionBacktrack("abac"),
  },
  {
    problemId: 216,
    brute: sumThreeBrute(2, 5),
    efficient: sumThreeBacktrack(2, 5),
  },
];
