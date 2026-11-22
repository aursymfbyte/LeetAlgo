import { Cell } from "../types";

export function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
}

export function listCells(lists: number[][]) {
  const cells: string[] = [];
  for (const list of lists) {
    if (list.length === 0) {
      cells.push("無");
    } else {
      cells.push(list.join(","));
    }
  }
  return cells;
}

export function fromOne(values: Cell[]) {
  const cells = [...values];
  cells[0] = "－";
  return cells;
}
