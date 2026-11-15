export type Cell = string | number;

export type Shape = "cells" | "linked" | "tree";

export type Row = {
  label: string;
  cells: Cell[];
  pointers: Record<string, number>;
  rangeStart: number;
  rangeEnd: number;
  answer: number[];
  indexed: boolean;
  shape: Shape;
};

export type Frame = {
  rows: Row[];
  message: string;
};

export type ProblemAnimation = {
  problemId: number;
  brute: Frame[];
  efficient: Frame[];
};

export function row(label: string, cells: Cell[], options: Partial<Row> = {}): Row {
  return {
    label,
    cells: [...cells],
    pointers: {},
    rangeStart: 0,
    rangeEnd: cells.length - 1,
    answer: [],
    indexed: true,
    shape: "cells",
    ...options,
  };
}
