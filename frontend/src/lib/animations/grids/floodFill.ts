import { Cell, Frame, row } from "../types";
import { gridRows, hasCell, neighbors, place } from "./gridCells";

function numberCells(numbers: number[][]) {
  const cells: Cell[][] = [];
  for (const line of numbers) {
    const texts: Cell[] = [];
    for (const value of line) {
      if (value === 0) {
        texts.push("水");
      } else {
        texts.push(value);
      }
    }
    cells.push(texts);
  }
  return cells;
}

function spreadNumbers(grid: string[][]) {
  const frames: Frame[] = [];
  const numbers: number[][] = [];
  let next = 1;
  let looked = 0;
  let rounds = 0;

  for (const line of grid) {
    const numberLine: number[] = [];
    for (const value of line) {
      looked++;
      if (value === "陸") {
        numberLine.push(next);
        next++;
      } else {
        numberLine.push(0);
      }
    }
    numbers.push(numberLine);
  }

  frames.push({
    rows: [...gridRows(numberCells(numbers), []), row("答案", ["?"], { indexed: false })],
    message: "位置寫成「第幾列第幾格」，都從 0 開始數。先替每塊陸地編一個不同的號碼，再重掃整張圖：旁邊有更小的號碼就跟著改，改到沒得改為止。",
  });

  let changed = true;
  while (changed) {
    changed = false;
    rounds++;

    for (let rowIndex = 0; rowIndex < numbers.length; rowIndex++) {
      for (let column = 0; column < numbers[0].length; column++) {
        looked++;
        const old = numbers[rowIndex][column];
        if (old === 0) {
          continue;
        }

        let smallest = old;
        for (const [nextRow, nextColumn] of neighbors(numbers, rowIndex, column)) {
          looked++;
          const near = numbers[nextRow][nextColumn];
          if (near !== 0 && near < smallest) {
            smallest = near;
          }
        }

        const here = place(rowIndex, column);
        let message = `第 ${rounds} 輪重掃：${here}是 ${old} 號，旁邊沒有更小的號碼，不用改。`;
        if (smallest < old) {
          numbers[rowIndex][column] = smallest;
          changed = true;
          message = `第 ${rounds} 輪重掃：${here}是 ${old} 號，旁邊有更小的 ${smallest} 號，是同一座島，改成 ${smallest} 號。`;
        }
        const rows = gridRows(numberCells(numbers), []);
        rows[rowIndex].pointers = { 目前: column };
        frames.push({ rows: [...rows, row("答案", ["?"], { indexed: false })], message });
      }
    }

    let ending = "這一輪沒有格子改號碼，可以停了。";
    if (changed) {
      ending = "這一輪有格子改了號碼，還要再重掃一輪。";
    }
    frames[frames.length - 1].message += ending;
  }

  return { frames, numbers, looked, rounds };
}

export function islandsBrute(grid: string[][]) {
  const spread = spreadNumbers(grid);
  const frames = spread.frames;
  const kinds: number[] = [];
  let looked = spread.looked;

  for (const line of spread.numbers) {
    for (const value of line) {
      looked++;
      if (value !== 0 && !kinds.includes(value)) {
        kinds.push(value);
      }
    }
  }

  frames.push({
    rows: [
      ...gridRows(numberCells(spread.numbers), []),
      row("答案", [kinds.length], { answer: [0], indexed: false }),
    ],
    message: `圖上剩下 ${kinds.join("、")} 這 ${kinds.length} 種號碼，所以有 ${kinds.length} 座島。整張圖重掃了 ${spread.rounds} 輪，一共看了 ${looked} 次格子。`,
  });
  return frames;
}

export function islandsSink(grid: string[][]) {
  const frames: Frame[] = [];
  const cells = grid.map((line) => [...line]);
  let island: number[][] = [];
  let islands = 0;
  let looked = 0;

  function sink(rowIndex: number, column: number) {
    looked++;
    if (cells[rowIndex][column] !== "陸") {
      return;
    }
    cells[rowIndex][column] = "沉";
    island.push([rowIndex, column]);
    const here = place(rowIndex, column);
    let message = `從旁邊走到${here}，也是陸地，和剛才是同一座島。改成「沉」，之後就不會再被算一次。`;
    if (island.length === 1) {
      message = `掃到${here}是陸地，找到第 ${islands} 座島。把它改成「沉」，再往上下左右找相連的陸地。`;
    }
    const rows = gridRows(cells, island);
    rows[rowIndex].pointers = { 目前: column };
    frames.push({ rows: [...rows, row("答案", [islands], { indexed: false })], message });

    for (const [nextRow, nextColumn] of neighbors(cells, rowIndex, column)) {
      sink(nextRow, nextColumn);
    }
  }

  frames.push({
    rows: [...gridRows(cells, []), row("答案", [islands], { indexed: false })],
    message: "位置寫成「第幾列第幾格」，都從 0 開始數。從左上角一格一格掃，遇到陸地就是一座新島，馬上把整座島相連的陸地都改成「沉」。",
  });

  for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
    for (let column = 0; column < cells[0].length; column++) {
      looked++;
      if (cells[rowIndex][column] === "陸") {
        islands++;
        island = [];
        sink(rowIndex, column);
      }
    }
  }

  frames.push({
    rows: [...gridRows(cells, []), row("答案", [islands], { answer: [0], indexed: false })],
    message: `整張圖掃完了，一共有 ${islands} 座島。每塊陸地只會被改成「沉」一次，一共只看了 ${looked} 次格子。`,
  });
  return frames;
}

export function maxAreaBrute(grid: string[][]) {
  const spread = spreadNumbers(grid);
  const frames = spread.frames;
  const sizes: Record<number, number> = {};
  const biggest: number[][] = [];
  let best = 0;
  let bestNumber = 0;
  let looked = spread.looked;

  for (const line of spread.numbers) {
    for (const value of line) {
      looked++;
      if (value === 0) {
        continue;
      }
      sizes[value] = (sizes[value] ?? 0) + 1;
      if (sizes[value] > best) {
        best = sizes[value];
        bestNumber = value;
      }
    }
  }

  for (let rowIndex = 0; rowIndex < spread.numbers.length; rowIndex++) {
    for (let column = 0; column < spread.numbers[0].length; column++) {
      if (spread.numbers[rowIndex][column] === bestNumber) {
        biggest.push([rowIndex, column]);
      }
    }
  }

  frames.push({
    rows: [
      ...gridRows(numberCells(spread.numbers), biggest),
      row("答案", [best], { answer: [0], indexed: false }),
    ],
    message: `數每種號碼各有幾格：${bestNumber} 號最多，有 ${best} 格，最大面積就是 ${best}。整張圖重掃了 ${spread.rounds} 輪，一共看了 ${looked} 次格子。`,
  });
  return frames;
}

export function maxAreaSink(grid: string[][]) {
  const frames: Frame[] = [];
  const cells = grid.map((line) => [...line]);
  let island: number[][] = [];
  let biggest: number[][] = [];
  let best = 0;
  let looked = 0;

  function area(rowIndex: number, column: number): number {
    looked++;
    if (cells[rowIndex][column] !== "陸") {
      return 0;
    }
    cells[rowIndex][column] = "沉";
    island.push([rowIndex, column]);
    const here = place(rowIndex, column);
    let message = `從旁邊走到${here}，也是陸地，改成「沉」，這座島的面積變成 ${island.length}。`;
    if (island.length === 1) {
      message = `掃到${here}是陸地，是一座新的島。把它改成「沉」，面積先算 1，再往上下左右找相連的陸地。`;
    }
    const rows = gridRows(cells, island);
    rows[rowIndex].pointers = { 目前: column };
    frames.push({ rows: [...rows, row("答案", [best], { indexed: false })], message });

    let total = 1;
    for (const [nextRow, nextColumn] of neighbors(cells, rowIndex, column)) {
      total += area(nextRow, nextColumn);
    }
    return total;
  }

  frames.push({
    rows: [...gridRows(cells, []), row("答案", [best], { indexed: false })],
    message: "位置寫成「第幾列第幾格」，都從 0 開始數。從左上角一格一格掃，遇到陸地就把整座島走完，邊走邊改成「沉」、邊數面積。「答案」是目前最大的面積。",
  });

  for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
    for (let column = 0; column < cells[0].length; column++) {
      looked++;
      if (cells[rowIndex][column] !== "陸") {
        continue;
      }
      island = [];
      const size = area(rowIndex, column);

      let result = `沒有比目前最大的 ${best} 大。`;
      if (size > best) {
        best = size;
        biggest = island;
        result = "是目前最大的，記下來。";
      }
      frames.push({
        rows: [...gridRows(cells, island), row("答案", [best], { indexed: false })],
        message: `這座島相連的陸地都走完了，面積是 ${size}，${result}`,
      });
    }
  }

  frames.push({
    rows: [...gridRows(cells, biggest), row("答案", [best], { answer: [0], indexed: false })],
    message: `整張圖掃完了，最大的島面積是 ${best}。每塊陸地只會被走到一次，一共只看了 ${looked} 次格子。`,
  });
  return frames;
}

export function fillBrute(image: number[][], startRow: number, startColumn: number, color: number) {
  const frames: Frame[] = [];
  const cells = image.map((line) => [...line]);
  const original = cells[startRow][startColumn];
  const filled = [[startRow, startColumn]];
  let looked = 1;
  let rounds = 0;
  let painted = 1;

  cells[startRow][startColumn] = color;
  const firstRows = gridRows(cells, filled);
  firstRows[startRow].pointers = { 起點: startColumn };
  frames.push({
    rows: firstRows,
    message: `位置寫成「第幾列第幾格」，從 0 開始數，數字是顏色。起點原本是 ${original}，先塗成 ${color}。接著重掃整張圖，找緊鄰已上色格子、顏色是 ${original} 的格子。`,
  });

  while (painted > 0) {
    painted = 0;
    rounds++;

    for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
      for (let column = 0; column < cells[0].length; column++) {
        looked++;
        if (cells[rowIndex][column] !== original) {
          continue;
        }

        let near = false;
        for (const [nextRow, nextColumn] of neighbors(cells, rowIndex, column)) {
          looked++;
          if (hasCell(filled, nextRow, nextColumn)) {
            near = true;
          }
        }

        const here = place(rowIndex, column);
        let message = `第 ${rounds} 輪重掃：${here}的顏色是 ${original}，但旁邊沒有已經上色的格子，先跳過。`;
        if (near) {
          cells[rowIndex][column] = color;
          filled.push([rowIndex, column]);
          painted++;
          message = `第 ${rounds} 輪重掃：${here}的顏色是 ${original}，旁邊有已經上色的格子，把它塗成 ${color}。`;
        }
        const rows = gridRows(cells, filled);
        rows[rowIndex].pointers = { 目前: column };
        frames.push({ rows, message });
      }
    }

    let ending = "沒有塗到任何格子，可以停了。";
    if (painted > 0) {
      ending = `塗了 ${painted} 格。新塗的格子旁邊可能還有顏色 ${original} 的格子，要再重掃一輪。`;
    }
    frames.push({
      rows: gridRows(cells, filled),
      message: `第 ${rounds} 輪掃完，${ending}`,
    });
  }

  frames.push({
    rows: gridRows(cells, filled),
    message: `和起點相連的 ${filled.length} 格都塗成 ${color} 了。整張圖重掃了 ${rounds} 輪，一共看了 ${looked} 次格子。`,
  });
  return frames;
}

export function fillSpread(image: number[][], startRow: number, startColumn: number, color: number) {
  const frames: Frame[] = [];
  const cells = image.map((line) => [...line]);
  const original = cells[startRow][startColumn];
  const filled: number[][] = [];
  let looked = 0;

  function fill(rowIndex: number, column: number) {
    looked++;
    if (cells[rowIndex][column] !== original) {
      return;
    }
    cells[rowIndex][column] = color;
    filled.push([rowIndex, column]);
    const here = place(rowIndex, column);
    let message = `從旁邊走到${here}，顏色也是 ${original}，塗成 ${color}，再繼續往它的上下左右找。`;
    if (filled.length === 1) {
      message = `位置寫成「第幾列第幾格」，從 0 開始數，數字是顏色。起點${here}原本是 ${original}，塗成 ${color}，再往上下左右找顏色一樣是 ${original} 的格子。`;
    }
    const rows = gridRows(cells, filled);
    rows[rowIndex].pointers = { 目前: column };
    frames.push({ rows, message });

    for (const [nextRow, nextColumn] of neighbors(cells, rowIndex, column)) {
      fill(nextRow, nextColumn);
    }
  }

  fill(startRow, startColumn);

  frames.push({
    rows: gridRows(cells, filled),
    message: `和起點相連的 ${filled.length} 格都塗成 ${color} 了。塗過的格子不會再塗第二次，一共只看了 ${looked} 次格子。`,
  });
  return frames;
}
