import { Cell } from "../types";

export function hasNode(tree: Cell[], index: number) {
  return index < tree.length && tree[index] !== "";
}

export function treeCells(cells: Cell[], size: number) {
  const padded = [...cells];
  while (padded.length < size) {
    padded.push("");
  }
  return padded;
}
