import { Cell, Row, row } from "../types";

export function linkedRow(label: string, cells: Cell[], options: Partial<Row> = {}) {
  return row(label, cells, { shape: "linked", indexed: false, ...options });
}

export function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
}

export function spaced(cell: Cell) {
  if (cell === "空") {
    return "空";
  }
  return ` ${cell}`;
}
