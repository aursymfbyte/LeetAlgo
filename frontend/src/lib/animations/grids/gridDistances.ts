import { Cell, Frame, row } from "../types";
import { gridRows, neighbors, onEdge, place } from "./gridCells";

function queueRow(queue: number[][]) {
  const cells = queue.map((cell) => cell.join(","));
  return row("佇列", cells, { indexed: false });
}

export function orangesBrute(grid: string[][]) {
  const frames: Frame[] = [];
  const cells = grid.map((line) => [...line]);
  let minutes = 0;
  let scans = 0;
  let fresh = 0;
  let looked = 0;

  frames.push({
    rows: gridRows(cells, []),
    message: "位置寫成「第幾列第幾格」，都從 0 開始數。「鮮」是新鮮橘子，「爛」是爛橘子，「空」是空格。每一分鐘都把整張圖重掃一遍，找旁邊有爛橘子的新鮮橘子。",
  });

  while (true) {
    const rotting: number[][] = [];
    scans++;
    fresh = 0;

    for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
      for (let column = 0; column < cells[0].length; column++) {
        looked++;
        if (cells[rowIndex][column] !== "鮮") {
          continue;
        }
        fresh++;

        let near = false;
        for (const [nextRow, nextColumn] of neighbors(cells, rowIndex, column)) {
          looked++;
          if (cells[nextRow][nextColumn] === "爛") {
            near = true;
          }
        }

        const here = place(rowIndex, column);
        let message = `第 ${scans} 次重掃：${here}是新鮮的，旁邊沒有爛橘子，這一分鐘還不會爛。`;
        if (near) {
          rotting.push([rowIndex, column]);
          message = `第 ${scans} 次重掃：${here}是新鮮的，旁邊有爛橘子，先記下來，這一分鐘結束時會爛。`;
        }
        const rows = gridRows(cells, rotting);
        rows[rowIndex].pointers = { 目前: column };
        frames.push({ rows, message });
      }
    }

    if (rotting.length === 0) {
      break;
    }
    minutes++;
    for (const [rowIndex, column] of rotting) {
      cells[rowIndex][column] = "爛";
    }
    frames.push({
      rows: gridRows(cells, rotting),
      message: `第 ${minutes} 分鐘結束，記下來的 ${rotting.length} 顆一起變爛。有橘子變爛，下一分鐘就要再把整張圖重掃一遍。`,
    });
  }

  let result = `新鮮橘子全部爛掉了，一共要 ${minutes} 分鐘。`;
  if (fresh > 0) {
    result = `還有 ${fresh} 顆新鮮橘子永遠不會爛，答案是 -1。`;
  }
  frames.push({
    rows: gridRows(cells, []),
    message: `第 ${scans} 次重掃沒有橘子變爛，停止。${result}整張圖重掃了 ${scans} 次，一共看了 ${looked} 次格子。`,
  });
  return frames;
}

export function orangesQueue(grid: string[][]) {
  const frames: Frame[] = [];
  const cells = grid.map((line) => [...line]);
  const queue: number[][] = [];
  let fresh = 0;
  let minutes = 0;
  let looked = 0;

  for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
    for (let column = 0; column < cells[0].length; column++) {
      looked++;
      if (cells[rowIndex][column] === "爛") {
        queue.push([rowIndex, column]);
      } else if (cells[rowIndex][column] === "鮮") {
        fresh++;
      }
    }
  }

  frames.push({
    rows: [...gridRows(cells, queue), queueRow(queue)],
    message: `「鮮」是新鮮橘子，「爛」是爛橘子，「空」是空格。先掃一遍，數出 ${fresh} 顆新鮮的，並把爛橘子放進佇列。佇列裡的「0,0」代表第 0 列第 0 格，都從 0 開始數。`,
  });

  while (queue.length > 0 && fresh > 0) {
    minutes++;
    const size = queue.length;

    for (let count = 0; count < size; count++) {
      const [rowIndex, column] = queue[0];
      queue.shift();
      const spread: number[][] = [];

      for (const [nextRow, nextColumn] of neighbors(cells, rowIndex, column)) {
        looked++;
        if (cells[nextRow][nextColumn] !== "鮮") {
          continue;
        }
        cells[nextRow][nextColumn] = "爛";
        fresh--;
        queue.push([nextRow, nextColumn]);
        spread.push([nextRow, nextColumn]);
      }

      let result = "旁邊沒有新鮮橘子。";
      if (spread.length > 0) {
        result = `旁邊有 ${spread.length} 顆新鮮橘子，變爛之後放進佇列。`;
      }
      const rows = gridRows(cells, spread);
      rows[rowIndex].pointers = { 目前: column };
      frames.push({
        rows: [...rows, queueRow(queue)],
        message: `第 ${minutes} 分鐘：從佇列拿出${place(rowIndex, column)}的爛橘子，${result}還剩 ${fresh} 顆新鮮的。`,
      });
    }
  }

  let result = `新鮮橘子全部爛掉了，一共要 ${minutes} 分鐘。`;
  if (fresh > 0) {
    result = `還有 ${fresh} 顆新鮮橘子永遠不會爛，答案是 -1。`;
  }
  frames.push({
    rows: [...gridRows(cells, []), queueRow(queue)],
    message: `${result}每顆橘子只進佇列一次，只看自己的上下左右，一共只看了 ${looked} 次格子。`,
  });
  return frames;
}

export function exitBrute(maze: string[][], startRow: number, startColumn: number) {
  const frames: Frame[] = [];
  const cells: Cell[][] = maze.map((line) => [...line]);
  let best = Infinity;
  let bestCell: Cell = "?";
  let bestRows = gridRows(cells, []);
  let looked = 0;

  function walk(rowIndex: number, column: number, steps: number) {
    cells[rowIndex][column] = steps;
    const here = place(rowIndex, column);
    const rows = gridRows(cells, []);
    rows[rowIndex].pointers = { 目前: column };

    if (steps > 0 && onEdge(cells, rowIndex, column)) {
      rows[rowIndex].answer = [column];
      let result = `沒有比目前最短的 ${best} 步短。`;
      if (steps < best) {
        best = steps;
        bestCell = steps;
        bestRows = rows;
        result = "是目前最短的，記下來。";
      }
      frames.push({
        rows: [...rows, row("最短", [bestCell], { indexed: false })],
        message: `走到${here}，它在邊界上，是出口。這條路走了 ${steps} 步，${result}退回去換別條路試。`,
      });
    } else {
      let message = `走到${here}，這條路走了 ${steps} 步，還不是出口，繼續往上下左右還沒踩過的路走。`;
      if (steps === 0) {
        message = `「牆」不能走，「路」可以走，數字是這條路走到第幾步。從入口${here}（從 0 開始數）出發，每條走法都走走看，走到邊界上的路就是出口，入口不算。`;
      }
      frames.push({
        rows: [...rows, row("最短", [bestCell], { indexed: false })],
        message,
      });

      for (const [nextRow, nextColumn] of neighbors(cells, rowIndex, column)) {
        looked++;
        if (cells[nextRow][nextColumn] === "路") {
          walk(nextRow, nextColumn, steps + 1);
        }
      }
    }

    cells[rowIndex][column] = "路";
  }

  walk(startRow, startColumn, 0);

  let result = `最近的出口要 ${best} 步。`;
  if (best === Infinity) {
    result = "沒有任何出口走得到，答案是 -1。";
  }
  frames.push({
    rows: [...bestRows, row("最短", [bestCell], { answer: [0], indexed: false })],
    message: `每一條走法都試過了，${result}因為不記哪些格子走過，同一格被不同的路重複走，一共看了 ${looked} 次格子。`,
  });
  return frames;
}

export function exitQueue(maze: string[][], startRow: number, startColumn: number) {
  const frames: Frame[] = [];
  const cells: Cell[][] = maze.map((line) => [...line]);
  const queue = [[startRow, startColumn]];
  let steps = 0;
  let looked = 0;

  cells[startRow][startColumn] = 0;
  const firstRows = gridRows(cells, []);
  firstRows[startRow].pointers = { 入口: startColumn };
  frames.push({
    rows: [...firstRows, queueRow(queue)],
    message: `「牆」不能走，「路」可以走。入口${place(startRow, startColumn)}（從 0 開始數）寫上 0、放進佇列，佇列裡寫成「${startRow},${startColumn}」。走過的格子寫上第幾步走到，就不會再走第二次。`,
  });

  while (queue.length > 0) {
    steps++;
    const size = queue.length;

    for (let count = 0; count < size; count++) {
      const [rowIndex, column] = queue[0];
      queue.shift();
      const here = place(rowIndex, column);
      const added: number[][] = [];

      for (const [nextRow, nextColumn] of neighbors(cells, rowIndex, column)) {
        looked++;
        if (cells[nextRow][nextColumn] !== "路") {
          continue;
        }
        cells[nextRow][nextColumn] = steps;

        if (onEdge(cells, nextRow, nextColumn)) {
          const rows = gridRows(cells, [[nextRow, nextColumn]]);
          rows[rowIndex].pointers = { 目前: column };
          frames.push({
            rows: [...rows, queueRow(queue)],
            message: `從佇列拿出${here}，旁邊的${place(nextRow, nextColumn)}是路，又在邊界上，就是最近的出口，要 ${steps} 步。每一格只走一次，一共只看了 ${looked} 次格子。`,
          });
          return frames;
        }

        queue.push([nextRow, nextColumn]);
        added.push([nextRow, nextColumn]);
      }

      let result = "旁邊沒有還沒走過的路。";
      if (added.length > 0) {
        result = `旁邊有 ${added.length} 格還沒走過的路，寫上 ${steps}、放進佇列。`;
      }
      const rows = gridRows(cells, added);
      rows[rowIndex].pointers = { 目前: column };
      frames.push({
        rows: [...rows, queueRow(queue)],
        message: `第 ${steps} 步：從佇列拿出${here}，${result}`,
      });
    }
  }

  frames.push({
    rows: [...gridRows(cells, []), queueRow(queue)],
    message: `佇列空了，能走的格子都走過了，還是沒有出口，答案是 -1。每一格只走一次，一共只看了 ${looked} 次格子。`,
  });
  return frames;
}
