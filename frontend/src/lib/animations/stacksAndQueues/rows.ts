import { Cell, row } from "../types";

export function allPositions(cells: Cell[]) {
  return cells.map((cell, index) => index);
}

export function stackRow(label: string, cells: Cell[]) {
  if (cells.length === 0) {
    return row(label, cells, { indexed: false });
  }
  return row(label, cells, { indexed: false, pointers: { 頂: cells.length - 1 } });
}
