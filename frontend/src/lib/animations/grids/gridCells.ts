import { Cell, Row, row } from "../types";

const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function place(rowIndex: number, column: number) {
  return `第 ${rowIndex} 列第 ${column} 格`;
}

export function neighbors(grid: Cell[][], rowIndex: number, column: number) {
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

export function onEdge(grid: Cell[][], rowIndex: number, column: number) {
  const lastRow = grid.length - 1;
  const lastColumn = grid[0].length - 1;
  return rowIndex === 0 || rowIndex === lastRow || column === 0 || column === lastColumn;
}

export function hasCell(list: number[][], rowIndex: number, column: number) {
  return list.some((cell) => cell[0] === rowIndex && cell[1] === column);
}

export function gridRows(grid: Cell[][], marked: number[][]) {
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
