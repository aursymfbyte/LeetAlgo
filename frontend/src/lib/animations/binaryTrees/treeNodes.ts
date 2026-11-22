import { Cell } from "../types";

export function hasNode(tree: Cell[], index: number) {
  return index < tree.length && tree[index] !== "";
}
