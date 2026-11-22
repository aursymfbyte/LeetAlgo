import { Cell, Frame, row } from "../types";

export function between(label: string, cells: Cell[], left: number, right: number) {
  return row(label, cells, {
    pointers: { 左: left, 右: right },
    rangeStart: left + 1,
    rangeEnd: right - 1,
    ends: true,
  });
}

export function lowerBoundSteps(frames: Frame[], numbers: number[], left: number, right: number, target: number) {
  let compared = 0;

  while (left + 1 < right) {
    const middle = Math.floor((left + right) / 2);
    const value = numbers[middle];
    const cells = between("陣列", numbers, left, right);
    cells.pointers.中 = middle;
    compared++;

    if (value >= target) {
      frames.push({
        rows: [cells],
        message: `中間的 ${value} 大於等於 ${target}，第一個大於等於 ${target} 的數在它這裡或左邊，把右邊界移到位置 ${middle}。`,
      });
      right = middle;
    } else {
      frames.push({
        rows: [cells],
        message: `中間的 ${value} 小於 ${target}，第一個大於等於 ${target} 的數一定在它右邊，把左邊界移到位置 ${middle}。`,
      });
      left = middle;
    }
  }

  return { index: right, compared };
}
