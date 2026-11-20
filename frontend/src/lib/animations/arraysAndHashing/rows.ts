import { Cell } from "../types";

export function tableCells(table: Map<Cell, number>) {
  const cells: string[] = [];
  for (const [key, value] of table) {
    cells.push(`${key}→${value}`);
  }
  return cells;
}

export function allPositions(cells: Cell[]) {
  return cells.map((cell, index) => index);
}
