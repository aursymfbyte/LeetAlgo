import { Cell, Frame, Row, row } from "../types";

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

export function pathsBrute(height: number, width: number) {
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

export function pathsFormula(height: number, width: number) {
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

export function minPathBrute(grid: number[][]) {
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

export function minPathRolling(grid: number[][]) {
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
