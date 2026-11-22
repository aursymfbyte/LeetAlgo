import { Cell, Frame, Row, row } from "../types";
import { positions } from "./rows";

const directions = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const stepNames = ["一", "二", "三", "四", "五", "六"];

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

export function queensBrute(size: number) {
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

export function queensBacktrack(size: number) {
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

export function wordSearchBrute(grid: string[][], word: string) {
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

export function wordSearchBacktrack(grid: string[][], word: string) {
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
