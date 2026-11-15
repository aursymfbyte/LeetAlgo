import { Cell, Frame, ProblemAnimation, Row, row } from "./types";

const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function place(rowIndex: number, column: number) {
  return `第 ${rowIndex} 列第 ${column} 格`;
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

function onEdge(grid: Cell[][], rowIndex: number, column: number) {
  const lastRow = grid.length - 1;
  const lastColumn = grid[0].length - 1;
  return rowIndex === 0 || rowIndex === lastRow || column === 0 || column === lastColumn;
}

function hasCell(list: number[][], rowIndex: number, column: number) {
  return list.some((cell) => cell[0] === rowIndex && cell[1] === column);
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

function queueRow(queue: number[][]) {
  const cells = queue.map((cell) => cell.join(","));
  return row("佇列", cells, { indexed: false });
}

function surroundedBrute(board: string[][]) {
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

function surroundedFromEdge(board: string[][]) {
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

function islandsBrute(grid: string[][]) {
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

function islandsSink(grid: string[][]) {
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

function oceansBrute(heights: number[][]) {
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

function oceansClimb(heights: number[][]) {
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

function maxAreaBrute(grid: string[][]) {
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

function maxAreaSink(grid: string[][]) {
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

function fillBrute(image: number[][], startRow: number, startColumn: number, color: number) {
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

function fillSpread(image: number[][], startRow: number, startColumn: number, color: number) {
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

function orangesBrute(grid: string[][]) {
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

function orangesQueue(grid: string[][]) {
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

function exitBrute(maze: string[][], startRow: number, startColumn: number) {
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

function exitQueue(maze: string[][], startRow: number, startColumn: number) {
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

const board = [
  ["X", "X", "X", "X", "O", "X"],
  ["X", "O", "O", "X", "O", "X"],
  ["X", "O", "O", "O", "X", "O"],
  ["X", "X", "X", "X", "X", "X"],
];
const islandGrid = [
  ["水", "陸", "水", "水"],
  ["陸", "陸", "水", "陸"],
  ["水", "水", "水", "陸"],
];
const oceanHeights = [
  [1, 2, 2, 3],
  [3, 2, 3, 4],
  [2, 4, 5, 3],
];
const areaGrid = [
  ["水", "水", "陸", "水"],
  ["陸", "陸", "陸", "水"],
  ["水", "水", "水", "陸"],
];
const image = [
  [1, 1, 1],
  [1, 1, 0],
  [1, 0, 1],
];
const oranges = [
  ["爛", "鮮", "鮮"],
  ["鮮", "鮮", "空"],
  ["空", "鮮", "鮮"],
];
const maze = [
  ["牆", "牆", "牆", "牆", "牆"],
  ["路", "路", "路", "路", "牆"],
  ["牆", "路", "路", "路", "牆"],
  ["牆", "牆", "牆", "路", "牆"],
];

export const stage5a: ProblemAnimation[] = [
  {
    problemId: 130,
    brute: surroundedBrute(board),
    efficient: surroundedFromEdge(board),
  },
  {
    problemId: 200,
    brute: islandsBrute(islandGrid),
    efficient: islandsSink(islandGrid),
  },
  {
    problemId: 417,
    brute: oceansBrute(oceanHeights),
    efficient: oceansClimb(oceanHeights),
  },
  {
    problemId: 695,
    brute: maxAreaBrute(areaGrid),
    efficient: maxAreaSink(areaGrid),
  },
  {
    problemId: 733,
    brute: fillBrute(image, 1, 1, 2),
    efficient: fillSpread(image, 1, 1, 2),
  },
  {
    problemId: 994,
    brute: orangesBrute(oranges),
    efficient: orangesQueue(oranges),
  },
  {
    problemId: 1926,
    brute: exitBrute(maze, 1, 0),
    efficient: exitQueue(maze, 1, 0),
  },
];
