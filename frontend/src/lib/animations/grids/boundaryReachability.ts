import { Frame } from "../types";
import { gridRows, hasCell, neighbors, onEdge, place } from "./gridCells";

export function surroundedBrute(board: string[][]) {
  const frames: Frame[] = [];
  const cells = board.map((line) => [...line]);
  const captured: number[][] = [];
  let start = [0, 0];
  let walked: number[][] = [];
  let looked = 0;

  function reach(rowIndex: number, column: number): boolean {
    walked.push([rowIndex, column]);
    const here = place(rowIndex, column);
    const rows = gridRows(cells, walked);
    rows[start[0]].pointers.起點 = start[1];
    if (walked.length > 1) {
      rows[rowIndex].pointers.目前 = column;
    }

    if (onEdge(cells, rowIndex, column)) {
      let message = `走到${here}，它在邊界上。起點連得到邊界，不會被圍住，保持 O。`;
      if (walked.length === 1) {
        message = `${here}是 O，它自己就在邊界上，不會被圍住，保持 O。`;
      }
      frames.push({ rows, message });
      return true;
    }

    let message = `走到${here}，還不是邊界，繼續往上下左右相連的 O 找。`;
    if (walked.length === 1) {
      message = `${here}是 O，從它出發搜尋一次，看能不能沿著相連的 O 走到邊界。`;
    }
    frames.push({ rows, message });

    for (const [nextRow, nextColumn] of neighbors(cells, rowIndex, column)) {
      looked++;
      if (cells[nextRow][nextColumn] !== "O") {
        continue;
      }
      if (hasCell(walked, nextRow, nextColumn)) {
        continue;
      }
      if (reach(nextRow, nextColumn)) {
        return true;
      }
    }
    return false;
  }

  frames.push({
    rows: gridRows(cells, []),
    message: "位置寫成「第幾列第幾格」，都從 0 開始數。每遇到一個 O 就從它出發搜尋一次：走得到邊界就保留，走不到就是被圍住，改成 X。",
  });

  for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
    for (let column = 0; column < cells[0].length; column++) {
      looked++;
      if (cells[rowIndex][column] !== "O") {
        continue;
      }
      start = [rowIndex, column];
      walked = [];
      if (reach(rowIndex, column)) {
        continue;
      }

      cells[rowIndex][column] = "X";
      captured.push([rowIndex, column]);
      const rows = gridRows(cells, walked);
      rows[rowIndex].pointers = { 起點: column };
      frames.push({
        rows,
        message: `這次搜尋走過 ${walked.length} 格，都碰不到邊界。${place(rowIndex, column)}被圍住了，改成 X。`,
      });
    }
  }

  frames.push({
    rows: gridRows(cells, captured),
    message: `被圍住的 ${captured.length} 個 O 都改成 X 了。每個 O 都各自搜尋一次，同一塊區域重複走了好幾遍，一共看了 ${looked} 次格子。`,
  });
  return frames;
}

export function surroundedFromEdge(board: string[][]) {
  const frames: Frame[] = [];
  const cells = board.map((line) => [...line]);
  const lastRow = cells.length - 1;
  const lastColumn = cells[0].length - 1;
  const safe: number[][] = [];
  const captured: number[][] = [];
  let looked = 0;

  function markSafe(rowIndex: number, column: number) {
    looked++;
    if (cells[rowIndex][column] !== "O") {
      return;
    }
    cells[rowIndex][column] = "#";
    safe.push([rowIndex, column]);
    const here = place(rowIndex, column);
    let message = `從旁邊走到${here}，也是 O。它連得到邊界，不會被圍住，一樣標成 #。`;
    if (onEdge(cells, rowIndex, column)) {
      message = `邊界上的${here}是 O，一定不會被圍住。先標成 #，再往上下左右找和它相連的 O。`;
    }
    const rows = gridRows(cells, safe);
    rows[rowIndex].pointers = { 目前: column };
    frames.push({ rows, message });

    for (const [nextRow, nextColumn] of neighbors(cells, rowIndex, column)) {
      markSafe(nextRow, nextColumn);
    }
  }

  frames.push({
    rows: gridRows(cells, []),
    message: "位置寫成「第幾列第幾格」，都從 0 開始數。反過來想：只有連到邊界的 O 不會被圍住，所以只從四條邊上的 O 出發，把連得到的 O 標成 #。",
  });

  for (let rowIndex = 0; rowIndex <= lastRow; rowIndex++) {
    markSafe(rowIndex, 0);
    markSafe(rowIndex, lastColumn);
  }
  for (let column = 0; column <= lastColumn; column++) {
    markSafe(0, column);
    markSafe(lastRow, column);
  }

  frames.push({
    rows: gridRows(cells, safe),
    message: `四條邊都檢查完了，標成 # 的有 ${safe.length} 格。現在還是 O 的格子都連不到邊界，就是被圍住的。`,
  });

  for (let rowIndex = 0; rowIndex <= lastRow; rowIndex++) {
    for (let column = 0; column <= lastColumn; column++) {
      looked++;
      if (cells[rowIndex][column] === "O") {
        cells[rowIndex][column] = "X";
        captured.push([rowIndex, column]);
      } else if (cells[rowIndex][column] === "#") {
        cells[rowIndex][column] = "O";
      }
    }
  }

  frames.push({
    rows: gridRows(cells, captured),
    message: `最後掃一遍：剩下的 ${captured.length} 個 O 改成 X，# 還原成 O。從邊界反過來只搜尋一次，一共只看了 ${looked} 次格子。`,
  });
  return frames;
}

function oceanCells(heights: number[][], pacific: boolean[][], atlantic: boolean[][]) {
  const cells: string[][] = [];
  for (let rowIndex = 0; rowIndex < heights.length; rowIndex++) {
    const texts: string[] = [];
    for (let column = 0; column < heights[0].length; column++) {
      let text = String(heights[rowIndex][column]);
      if (pacific[rowIndex][column]) {
        text += "平";
      }
      if (atlantic[rowIndex][column]) {
        text += "西";
      }
      texts.push(text);
    }
    cells.push(texts);
  }
  return cells;
}

function bothOceans(pacific: boolean[][], atlantic: boolean[][]) {
  const both: number[][] = [];
  for (let rowIndex = 0; rowIndex < pacific.length; rowIndex++) {
    for (let column = 0; column < pacific[0].length; column++) {
      if (pacific[rowIndex][column] && atlantic[rowIndex][column]) {
        both.push([rowIndex, column]);
      }
    }
  }
  return both;
}

export function oceansBrute(heights: number[][]) {
  const frames: Frame[] = [];
  const lastRow = heights.length - 1;
  const lastColumn = heights[0].length - 1;
  const pacific = heights.map((line) => line.map(() => false));
  const atlantic = heights.map((line) => line.map(() => false));
  let walked: number[][] = [];
  let looked = 0;

  function flow(rowIndex: number, column: number) {
    walked.push([rowIndex, column]);
    for (const [nextRow, nextColumn] of neighbors(heights, rowIndex, column)) {
      looked++;
      if (heights[nextRow][nextColumn] > heights[rowIndex][column]) {
        continue;
      }
      if (hasCell(walked, nextRow, nextColumn)) {
        continue;
      }
      flow(nextRow, nextColumn);
    }
  }

  frames.push({
    rows: gridRows(oceanCells(heights, pacific, atlantic), []),
    message: "位置寫成「第幾列第幾格」，從 0 開始數，數字是高度。上邊、左邊是太平洋，下邊、右邊是大西洋。每一格都各自順著水流搜尋，流得到就標「平」或「西」。",
  });

  for (let rowIndex = 0; rowIndex <= lastRow; rowIndex++) {
    for (let column = 0; column <= lastColumn; column++) {
      looked++;
      walked = [];
      flow(rowIndex, column);

      let pacificText = "流不到太平洋";
      let atlanticText = "流不到大西洋";
      for (const cell of walked) {
        if (cell[0] === 0 || cell[1] === 0) {
          pacific[rowIndex][column] = true;
          pacificText = "流得到太平洋";
        }
        if (cell[0] === lastRow || cell[1] === lastColumn) {
          atlantic[rowIndex][column] = true;
          atlanticText = "流得到大西洋";
        }
      }

      const rows = gridRows(oceanCells(heights, pacific, atlantic), walked);
      rows[rowIndex].pointers = { 起點: column };
      frames.push({
        rows,
        message: `從${place(rowIndex, column)}（高度 ${heights[rowIndex][column]}）出發，水往不升高的方向流，連自己能流到 ${walked.length} 格：${pacificText}，${atlanticText}。`,
      });
    }
  }

  const both = bothOceans(pacific, atlantic);
  frames.push({
    rows: gridRows(oceanCells(heights, pacific, atlantic), both),
    message: `「平」和「西」都有的 ${both.length} 格就是答案。每一格都各自搜尋一次，同樣的路流了好幾遍，一共看了 ${looked} 次格子。`,
  });
  return frames;
}

export function oceansClimb(heights: number[][]) {
  const frames: Frame[] = [];
  const lastRow = heights.length - 1;
  const lastColumn = heights[0].length - 1;
  const pacific = heights.map((line) => line.map(() => false));
  const atlantic = heights.map((line) => line.map(() => false));
  let looked = 0;

  function climb(rowIndex: number, column: number, reachable: boolean[][], ocean: string, reason: string) {
    if (reachable[rowIndex][column]) {
      return;
    }
    reachable[rowIndex][column] = true;
    const here = place(rowIndex, column);
    const height = heights[rowIndex][column];
    const rows = gridRows(oceanCells(heights, pacific, atlantic), []);
    rows[rowIndex].pointers = { 目前: column };
    frames.push({
      rows,
      message: `${here}（高度 ${height}）${reason}，所以流得到${ocean}。`,
    });

    for (const [nextRow, nextColumn] of neighbors(heights, rowIndex, column)) {
      looked++;
      if (heights[nextRow][nextColumn] >= height) {
        climb(nextRow, nextColumn, reachable, ocean, `不比旁邊的${here}低，水可以流過去`);
      }
    }
  }

  frames.push({
    rows: gridRows(oceanCells(heights, pacific, atlantic), []),
    message: "位置寫成「第幾列第幾格」，從 0 開始數，數字是高度。上邊、左邊是太平洋，下邊、右邊是大西洋。反過來從海邊往高處爬，爬得到就標「平」或「西」。",
  });

  for (let rowIndex = 0; rowIndex <= lastRow; rowIndex++) {
    looked += 2;
    climb(rowIndex, 0, pacific, "太平洋", "緊鄰太平洋");
    climb(rowIndex, lastColumn, atlantic, "大西洋", "緊鄰大西洋");
  }
  for (let column = 0; column <= lastColumn; column++) {
    looked += 2;
    climb(0, column, pacific, "太平洋", "緊鄰太平洋");
    climb(lastRow, column, atlantic, "大西洋", "緊鄰大西洋");
  }

  const both = bothOceans(pacific, atlantic);
  looked += heights.length * heights[0].length;
  frames.push({
    rows: gridRows(oceanCells(heights, pacific, atlantic), both),
    message: `最後掃一遍，「平」和「西」都有的 ${both.length} 格就是答案。從兩個海各反過來搜尋一次，一共只看了 ${looked} 次格子。`,
  });
  return frames;
}
