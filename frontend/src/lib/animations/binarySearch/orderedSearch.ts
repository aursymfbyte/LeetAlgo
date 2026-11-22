import { Frame, Row, row } from "../types";
import { between, lowerBoundSteps } from "./searchSteps";

export function linearSearch(numbers: number[], target: number) {
  const frames: Frame[] = [];

  for (let index = 0; index < numbers.length; index++) {
    const value = numbers[index];
    const cells = row("陣列", numbers, { pointers: { 目前: index }, rangeStart: index });

    if (value === target) {
      frames.push({
        rows: [{ ...cells, answer: [index] }],
        message: `${value} 等於 ${target}，找到了，位置是 ${index}。從頭找到這裡，一共比較了 ${index + 1} 次。`,
      });
      return frames;
    }

    frames.push({
      rows: [cells],
      message: `要找 ${target}。從頭一個一個看：${value} 不是 ${target}，看下一個。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 })],
    message: `全部看完了，${target} 不在陣列中。一共比較了 ${numbers.length} 次。`,
  });
  return frames;
}

export function binarySearch(numbers: number[], target: number) {
  const frames: Frame[] = [];
  let left = 0;
  let right = numbers.length - 1;
  let checked = 0;

  frames.push({
    rows: [row("陣列", numbers, { pointers: { 左: left, 右: right } })],
    message: `要找 ${target}。陣列已經排序好，所以每次只看範圍正中間的數。`,
  });

  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    const value = numbers[middle];
    const cells = row("陣列", numbers, {
      pointers: { 左: left, 右: right, 中: middle },
      rangeStart: left,
      rangeEnd: right,
    });
    checked++;

    if (value === target) {
      frames.push({
        rows: [{ ...cells, answer: [middle] }],
        message: `中間的 ${value} 等於 ${target}，找到了，位置是 ${middle}。一共只比較了 ${checked} 次。`,
      });
      return frames;
    }

    if (value < target) {
      frames.push({
        rows: [cells],
        message: `中間的 ${value} 小於 ${target}，答案只可能在右半邊，把左邊界移到位置 ${middle + 1}。`,
      });
      left = middle + 1;
    } else {
      frames.push({
        rows: [cells],
        message: `中間的 ${value} 大於 ${target}，答案只可能在左半邊，把右邊界移到位置 ${middle - 1}。`,
      });
      right = middle - 1;
    }
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 })],
    message: `左邊界超過右邊界，範圍裡已經沒有數字，${target} 不在陣列中。一共只比較了 ${checked} 次。`,
  });
  return frames;
}

export function rangeScan(numbers: number[], target: number) {
  const frames: Frame[] = [];
  let first = -1;
  let last = -1;
  let answer: number[] = [];

  for (let index = 0; index < numbers.length; index++) {
    const value = numbers[index];
    let message = `要找 ${target} 的開始位置和結束位置。從頭到尾每個數都看：${value} 不是 ${target}，看下一個。`;

    if (value === target) {
      message = `${value} 等於 ${target}，又遇到一個，結束位置改成 ${index}。`;
      if (first === -1) {
        first = index;
        message = `${value} 等於 ${target}，這是第一次遇到，開始位置和結束位置都先記成 ${index}。`;
      }
      last = index;
      answer = [first, last];
    }

    frames.push({
      rows: [row("陣列", numbers, { pointers: { 目前: index }, rangeStart: index, answer })],
      message,
    });
  }

  if (first === -1) {
    frames.push({
      rows: [row("陣列", numbers, { rangeEnd: -1 })],
      message: `全部看完了，${target} 不在陣列中，答案是 -1 和 -1。一共比較了 ${numbers.length} 次。`,
    });
    return frames;
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeStart: first, rangeEnd: last, answer })],
    message: `全部看完了，${target} 的開始位置是 ${first}，結束位置是 ${last}。一共比較了 ${numbers.length} 次。`,
  });
  return frames;
}

export function rangeBinary(numbers: number[], target: number) {
  const frames: Frame[] = [];
  const count = numbers.length;

  frames.push({
    rows: [between("陣列", numbers, -1, count)],
    message: `先找第一個大於等於 ${target} 的位置，那就是開始位置。左邊界放在位置 -1，右邊界放在位置 ${count}，都在陣列外面，每次看正中間的數。`,
  });
  const first = lowerBoundSteps(frames, numbers, -1, count, target);
  const start = first.index;
  let compared = first.compared;

  if (start === count) {
    frames.push({
      rows: [row("陣列", numbers, { rangeEnd: -1, ends: true })],
      message: `右邊界還停在位置 ${count}（陣列外面），沒有數大於等於 ${target}，所以 ${target} 不在陣列中，答案是 -1 和 -1。一共只比較了 ${compared} 次。`,
    });
    return frames;
  }

  compared++;
  if (numbers[start] !== target) {
    frames.push({
      rows: [row("陣列", numbers, { rangeEnd: -1, ends: true })],
      message: `右邊界停在位置 ${start}，那裡是 ${numbers[start]}，不是 ${target}，所以 ${target} 不在陣列中，答案是 -1 和 -1。一共只比較了 ${compared} 次。`,
    });
    return frames;
  }

  const startCells = between("陣列", numbers, start - 1, start);
  startCells.answer = [start];
  frames.push({
    rows: [startCells],
    message: `右邊界停在位置 ${start}，那裡正好是 ${target}，開始位置找到了。左右邊界回到陣列外面，改找第一個大於等於 ${target + 1} 的位置。`,
  });

  const second = lowerBoundSteps(frames, numbers, -1, count, target + 1);
  const end = second.index - 1;
  compared += second.compared;

  const cells = between("陣列", numbers, end, second.index);
  cells.rangeStart = start;
  cells.answer = [start, end];
  frames.push({
    rows: [cells],
    message: `右邊界停在位置 ${second.index}，它的前一格就是最後一個 ${target}。開始位置是 ${start}，結束位置是 ${end}。一共只比較了 ${compared} 次。`,
  });
  return frames;
}

export function insertScan(numbers: number[], target: number) {
  const frames: Frame[] = [];

  for (let index = 0; index < numbers.length; index++) {
    const value = numbers[index];
    const cells = row("陣列", numbers, { pointers: { 目前: index }, rangeStart: index });

    if (value >= target) {
      frames.push({
        rows: [{ ...cells, answer: [index] }],
        message: `${value} 大於等於 ${target}，${target} 要放在它這個位置，插入位置是 ${index}。從頭找到這裡，一共比較了 ${index + 1} 次。`,
      });
      return frames;
    }

    frames.push({
      rows: [cells],
      message: `要找 ${target} 的插入位置。從頭一個一個看：${value} 比 ${target} 小，${target} 要排在它後面，看下一個。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 })],
    message: `每個數都比 ${target} 小，${target} 要放在最後面，插入位置是 ${numbers.length}。一共比較了 ${numbers.length} 次。`,
  });
  return frames;
}

export function insertBinary(numbers: number[], target: number) {
  const frames: Frame[] = [];
  const count = numbers.length;

  frames.push({
    rows: [between("陣列", numbers, -1, count)],
    message: `插入位置就是第一個大於等於 ${target} 的位置。左邊界放在位置 -1，右邊界放在位置 ${count}，都在陣列外面，每次看正中間的數。`,
  });
  const found = lowerBoundSteps(frames, numbers, -1, count, target);
  const index = found.index;

  const cells = between("陣列", numbers, index - 1, index);
  if (index < count) {
    cells.answer = [index];
  }
  frames.push({
    rows: [cells],
    message: `左右邊界相鄰，中間沒有位置了。右邊界停在位置 ${index}，這就是 ${target} 的插入位置。一共只比較了 ${found.compared} 次。`,
  });
  return frames;
}

function matrixRows(matrix: number[][], marks: Record<string, number>, start: number, end: number) {
  const width = matrix[0].length;
  const rows: Row[] = [];

  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
    const offset = rowIndex * width;
    const pointers: Record<string, number> = {};
    for (const name of Object.keys(marks)) {
      const column = marks[name] - offset;
      if (column >= 0 && column < width) {
        pointers[name] = column;
      }
    }
    rows.push(row(`第 ${rowIndex} 列`, matrix[rowIndex], { pointers, rangeStart: start - offset, rangeEnd: end - offset }));
  }

  return rows;
}

export function matrixScan(matrix: number[][], target: number) {
  const frames: Frame[] = [];
  const width = matrix[0].length;
  const total = matrix.length * width;
  let compared = 0;

  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex++) {
    for (let column = 0; column < width; column++) {
      const value = matrix[rowIndex][column];
      const index = rowIndex * width + column;
      const rows = matrixRows(matrix, { 目前: index }, index, total - 1);
      compared++;

      if (value === target) {
        rows[rowIndex].answer = [column];
        frames.push({
          rows,
          message: `${value} 等於 ${target}，找到了，在第 ${rowIndex} 列位置 ${column}。從頭找到這裡，一共比較了 ${compared} 次。`,
        });
        return frames;
      }

      frames.push({
        rows,
        message: `要找 ${target}。一列一列、一格一格看：${value} 不是 ${target}，看下一格。`,
      });
    }
  }

  frames.push({
    rows: matrixRows(matrix, {}, total, total - 1),
    message: `整個矩陣都看完了，${target} 不在矩陣中。一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function matrixBinary(matrix: number[][], target: number) {
  const frames: Frame[] = [];
  const width = matrix[0].length;
  const total = matrix.length * width;
  let left = -1;
  let right = total;
  let compared = 0;

  frames.push({
    rows: matrixRows(matrix, {}, 0, total - 1),
    message: `要找 ${target}。把每一列接在上一列後面，就是長度 ${total} 的排序陣列，位置從 0 數到 ${total - 1}。左邊界放在位置 -1，右邊界放在位置 ${total}，都在矩陣外面。`,
  });

  while (left + 1 < right) {
    const middle = Math.floor((left + right) / 2);
    const rowIndex = Math.floor(middle / width);
    const column = middle % width;
    const value = matrix[rowIndex][column];
    const rows = matrixRows(matrix, { 左: left, 右: right, 中: middle }, left + 1, right - 1);
    compared++;

    if (value >= target) {
      frames.push({
        rows,
        message: `中間是位置 ${middle}，除以 ${width} 得 ${rowIndex} 餘 ${column}，也就是第 ${rowIndex} 列位置 ${column} 的 ${value}，大於等於 ${target}，把右邊界移到位置 ${middle}。`,
      });
      right = middle;
    } else {
      frames.push({
        rows,
        message: `中間是位置 ${middle}，除以 ${width} 得 ${rowIndex} 餘 ${column}，也就是第 ${rowIndex} 列位置 ${column} 的 ${value}，小於 ${target}，把左邊界移到位置 ${middle}。`,
      });
      left = middle;
    }
  }

  const rows = matrixRows(matrix, { 左: left, 右: right }, left + 1, right - 1);
  if (right === total) {
    frames.push({
      rows,
      message: `右邊界還停在位置 ${total}（矩陣外面），沒有數大於等於 ${target}，所以 ${target} 不在矩陣中。一共只比較了 ${compared} 次。`,
    });
    return frames;
  }

  const rowIndex = Math.floor(right / width);
  const column = right % width;
  const value = matrix[rowIndex][column];
  compared++;

  if (value !== target) {
    frames.push({
      rows,
      message: `右邊界停在位置 ${right}，那裡是 ${value}，不是 ${target}，所以 ${target} 不在矩陣中。一共只比較了 ${compared} 次。`,
    });
    return frames;
  }

  rows[rowIndex].answer = [column];
  frames.push({
    rows,
    message: `左右邊界相鄰，右邊界停在位置 ${right}，也就是第 ${rowIndex} 列位置 ${column}，那裡正好是 ${target}，找到了。一共只比較了 ${compared} 次。`,
  });
  return frames;
}

export function pairsAll(spells: number[], potions: number[], success: number) {
  const frames: Frame[] = [];
  const pairs: number[] = [];
  let multiplied = 0;

  for (let spellIndex = 0; spellIndex < spells.length; spellIndex++) {
    const spell = spells[spellIndex];
    pairs.push(0);

    for (let potionIndex = 0; potionIndex < potions.length; potionIndex++) {
      const potion = potions[potionIndex];
      const product = spell * potion;
      let message = `每個咒語都和每瓶藥水乘一次：咒語 ${spell} × 藥水 ${potion} = ${product}，不到 ${success}，不成功。`;
      multiplied++;

      if (product >= success) {
        pairs[spellIndex]++;
        message = `每個咒語都和每瓶藥水乘一次：咒語 ${spell} × 藥水 ${potion} = ${product}，大於等於 ${success}，成功，這個咒語累計 ${pairs[spellIndex]} 瓶。`;
      }

      frames.push({
        rows: [
          row("咒語", spells, { pointers: { 目前: spellIndex }, rangeStart: spellIndex }),
          row("藥水", potions, { pointers: { 目前: potionIndex }, rangeStart: potionIndex }),
          row("答案", pairs, { indexed: false }),
        ],
        message,
      });
    }
  }

  frames.push({
    rows: [
      row("咒語", spells, { rangeEnd: -1 }),
      row("藥水", potions, { rangeEnd: -1 }),
      row("答案", pairs, { answer: pairs.map((pair, index) => index), indexed: false }),
    ],
    message: `答案是 ${pairs.join("、")}。每個咒語都把 ${potions.length} 瓶藥水乘過一遍，一共算了 ${multiplied} 次乘法。`,
  });
  return frames;
}

export function pairsBinary(spells: number[], potions: number[], success: number) {
  const frames: Frame[] = [];
  const sorted = [...potions].sort((a, b) => a - b);
  const count = sorted.length;
  const pairs: number[] = [];
  let multiplied = 0;

  frames.push({
    rows: [row("咒語", spells), row("藥水", potions, { ends: true }), row("答案", pairs, { indexed: false })],
    message: `先把藥水由小到大排序。排序之後，對同一個咒語來說，越右邊的藥水乘積越大，成功的藥水會集中在右邊。`,
  });
  frames.push({
    rows: [row("咒語", spells), row("藥水", sorted, { ends: true }), row("答案", pairs, { indexed: false })],
    message: `排序好了。每個咒語都用二分搜尋找第一瓶成功的藥水：左邊界從位置 -1、右邊界從位置 ${count} 開始，都在陣列外面。`,
  });

  for (let spellIndex = 0; spellIndex < spells.length; spellIndex++) {
    const spell = spells[spellIndex];
    const spellRow = row("咒語", spells, { pointers: { 目前: spellIndex }, rangeStart: spellIndex });
    let left = -1;
    let right = count;

    while (left + 1 < right) {
      const middle = Math.floor((left + right) / 2);
      const potion = sorted[middle];
      const product = spell * potion;
      const potionRow = between("藥水", sorted, left, right);
      potionRow.pointers.中 = middle;
      multiplied++;

      if (product >= success) {
        frames.push({
          rows: [spellRow, potionRow, row("答案", pairs, { indexed: false })],
          message: `咒語 ${spell}：中間的藥水 ${potion}，${spell} × ${potion} = ${product}，大於等於 ${success}，成功，第一瓶成功的在它這裡或左邊，把右邊界移到位置 ${middle}。`,
        });
        right = middle;
      } else {
        frames.push({
          rows: [spellRow, potionRow, row("答案", pairs, { indexed: false })],
          message: `咒語 ${spell}：中間的藥水 ${potion}，${spell} × ${potion} = ${product}，不到 ${success}，不成功，它和左邊的都不行，把左邊界移到位置 ${middle}。`,
        });
        left = middle;
      }
    }

    const successful = count - right;
    let message = `咒語 ${spell}：左右邊界相鄰，右邊界停在位置 ${right}，它和右邊的藥水都成功，共 ${count} - ${right} = ${successful} 瓶，記進答案。`;
    if (right === count) {
      message = `咒語 ${spell}：左右邊界相鄰，右邊界還停在位置 ${count}（陣列外面），沒有任何一瓶成功，答案記 0。`;
    }
    pairs.push(successful);

    const potionRow = between("藥水", sorted, left, right);
    potionRow.rangeEnd = count - 1;
    frames.push({
      rows: [spellRow, potionRow, row("答案", pairs, { indexed: false })],
      message,
    });
  }

  frames.push({
    rows: [
      row("咒語", spells, { rangeEnd: -1 }),
      row("藥水", sorted, { rangeEnd: -1, ends: true }),
      row("答案", pairs, { answer: pairs.map((pair, index) => index), indexed: false }),
    ],
    message: `答案是 ${pairs.join("、")}。藥水排序一次之後，每個咒語都用二分搜尋找，一共只算了 ${multiplied} 次乘法。`,
  });
  return frames;
}
