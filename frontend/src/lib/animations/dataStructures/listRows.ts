import { Cell, Row, row } from "../types";

export type Entry = { key: number; value: number };

export function linkedRow(label: string, cells: Cell[], options: Partial<Row> = {}) {
  return row(label, cells, { shape: "linked", indexed: false, ...options });
}

export function pointAt(index: number) {
  const pointers: Record<string, number> = {};
  if (index >= 0) {
    pointers["目前"] = index;
  }
  return pointers;
}

export function scanned(found: number, length: number) {
  if (found === -1) {
    return length;
  }
  return found + 1;
}
