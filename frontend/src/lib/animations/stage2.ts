import { Cell, Frame, ProblemAnimation, Row, row } from "./types";

function linearSearch(numbers: number[], target: number) {
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

function binarySearch(numbers: number[], target: number) {
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

function between(label: string, cells: Cell[], left: number, right: number) {
  const pointers: Record<string, number> = {};
  if (left >= 0) {
    pointers.左 = left;
  }
  if (right < cells.length) {
    pointers.右 = right;
  }
  return row(label, cells, { pointers, rangeStart: left + 1, rangeEnd: right - 1 });
}

function oneTo(count: number) {
  const numbers: number[] = [];
  for (let number = 1; number <= count; number++) {
    numbers.push(number);
  }
  return numbers;
}

function numberLine(label: string, numbers: number[], left: number, right: number) {
  const line = between(label, numbers, left - 1, right - 1);
  line.indexed = false;
  return line;
}

function lowerBoundSteps(frames: Frame[], numbers: number[], left: number, right: number, target: number) {
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

function minIndexSteps(frames: Frame[], numbers: number[]) {
  const last = numbers[numbers.length - 1];
  let left = -1;
  let right = numbers.length - 1;
  let compared = 0;

  while (left + 1 < right) {
    const middle = Math.floor((left + right) / 2);
    const value = numbers[middle];
    const cells = between("陣列", numbers, left, right);
    cells.pointers.中 = middle;
    compared++;

    if (value < last) {
      frames.push({
        rows: [cells],
        message: `中間的 ${value} 比最後一個數 ${last} 小，它在後段，最小值在它這裡或左邊，把右邊界移到位置 ${middle}。`,
      });
      right = middle;
    } else {
      frames.push({
        rows: [cells],
        message: `中間的 ${value} 比最後一個數 ${last} 大，它在前段，最小值一定在它右邊，把左邊界移到位置 ${middle}。`,
      });
      left = middle;
    }
  }

  return { index: right, compared };
}

function rotatedSearch(numbers: number[], target: number) {
  const frames: Frame[] = [];
  const count = numbers.length;
  const last = numbers[count - 1];

  frames.push({
    rows: [between("陣列", numbers, -1, count - 1)],
    message: `要找 ${target}。先找最小值的位置，它把陣列切成兩段各自遞增。左邊界放在位置 -1（陣列外面），右邊界放在最後一個位置。`,
  });
  const smallest = minIndexSteps(frames, numbers);
  const minIndex = smallest.index;

  let left = minIndex - 1;
  let right = count;
  let message = `最小值在位置 ${minIndex}。${target} 沒有比最後一個數 ${last} 大，只可能在後段，改在後段二分：左邊界放位置 ${left}，右邊界放位置 ${right}（陣列外面）。`;
  if (target > last) {
    left = -1;
    right = minIndex;
    message = `最小值在位置 ${minIndex}。${target} 比最後一個數 ${last} 大，只可能在前段，改在前段二分：左邊界放位置 -1（陣列外面），右邊界放位置 ${right}。`;
  }
  frames.push({ rows: [between("陣列", numbers, left, right)], message });

  const found = lowerBoundSteps(frames, numbers, left, right, target);
  const index = found.index;
  let compared = smallest.compared + 1 + found.compared;

  if (index === count) {
    frames.push({
      rows: [row("陣列", numbers, { rangeEnd: -1 })],
      message: `右邊界還停在位置 ${count}（陣列外面），這一段沒有數大於等於 ${target}，所以 ${target} 不在陣列中。一共只比較了 ${compared} 次。`,
    });
    return frames;
  }

  compared++;
  if (numbers[index] !== target) {
    frames.push({
      rows: [row("陣列", numbers, { rangeEnd: -1 })],
      message: `右邊界停在位置 ${index}，那裡是 ${numbers[index]}，不是 ${target}，所以 ${target} 不在陣列中。一共只比較了 ${compared} 次。`,
    });
    return frames;
  }

  const cells = between("陣列", numbers, index - 1, index);
  cells.answer = [index];
  frames.push({
    rows: [cells],
    message: `右邊界停在位置 ${index}，那裡正好是 ${target}，找到了。找最小值和找 ${target} 兩次二分，一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function rangeScan(numbers: number[], target: number) {
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

function rangeBinary(numbers: number[], target: number) {
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
      rows: [row("陣列", numbers, { rangeEnd: -1 })],
      message: `右邊界還停在位置 ${count}（陣列外面），沒有數大於等於 ${target}，所以 ${target} 不在陣列中，答案是 -1 和 -1。一共只比較了 ${compared} 次。`,
    });
    return frames;
  }

  compared++;
  if (numbers[start] !== target) {
    frames.push({
      rows: [row("陣列", numbers, { rangeEnd: -1 })],
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

function insertScan(numbers: number[], target: number) {
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

function insertBinary(numbers: number[], target: number) {
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

function matrixScan(matrix: number[][], target: number) {
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

function matrixBinary(matrix: number[][], target: number) {
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

function minScan(numbers: number[]) {
  const frames: Frame[] = [];
  let smallest = 0;
  let compared = 0;

  frames.push({
    rows: [row("陣列", numbers, { pointers: { 最小: smallest } })],
    message: `要找最小值。最直接的做法是每個數都看一遍：先把第一個數 ${numbers[0]} 當成目前最小的。`,
  });

  for (let index = 1; index < numbers.length; index++) {
    const value = numbers[index];
    const smallestValue = numbers[smallest];
    let message = `${value} 沒有比目前最小的 ${smallestValue} 小，最小值不變，看下一個。`;
    compared++;

    if (value < smallestValue) {
      smallest = index;
      message = `${value} 比目前最小的 ${smallestValue} 小，目前最小的改成 ${value}，繼續看下一個。`;
    }

    frames.push({
      rows: [row("陣列", numbers, { pointers: { 目前: index, 最小: smallest }, rangeStart: index })],
      message,
    });
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1, answer: [smallest] })],
    message: `全部看完了，最小值是 ${numbers[smallest]}。一共比較了 ${compared} 次。`,
  });
  return frames;
}

function minBinary(numbers: number[]) {
  const frames: Frame[] = [];
  const count = numbers.length;
  const last = numbers[count - 1];

  frames.push({
    rows: [between("陣列", numbers, -1, count - 1)],
    message: `陣列分成兩段：前段的數都比最後一個數 ${last} 大，後段從最小值開始。左邊界放在位置 -1（陣列外面），右邊界放在最後一個位置。`,
  });
  const smallest = minIndexSteps(frames, numbers);
  const index = smallest.index;

  const cells = between("陣列", numbers, index - 1, index);
  cells.answer = [index];
  frames.push({
    rows: [cells],
    message: `左右邊界相鄰，中間沒有位置了。右邊界停在後段的第一個數，最小值就是 ${numbers[index]}。一共只比較了 ${smallest.compared} 次。`,
  });
  return frames;
}

function peakScan(numbers: number[]) {
  const frames: Frame[] = [];
  const lastIndex = numbers.length - 1;

  for (let index = 0; index < lastIndex; index++) {
    const value = numbers[index];
    const next = numbers[index + 1];
    const cells = row("陣列", numbers, { pointers: { 目前: index }, rangeStart: index });

    if (value > next) {
      frames.push({
        rows: [{ ...cells, answer: [index] }],
        message: `前面一路上坡，${value} 又比右邊的 ${next} 大，它比左右都大，是峰值，位置是 ${index}。從頭找到這裡，一共比較了 ${index + 1} 次。`,
      });
      return frames;
    }

    frames.push({
      rows: [cells],
      message: `要找峰值。從頭一個一個和右邊的數比：${value} 比右邊的 ${next} 小，還在上坡，看下一個。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeStart: lastIndex, answer: [lastIndex] })],
    message: `一路上坡到最後一個數，陣列外面當成負無限大，所以 ${numbers[lastIndex]} 是峰值，位置是 ${lastIndex}。一共比較了 ${lastIndex} 次。`,
  });
  return frames;
}

function peakBinary(numbers: number[]) {
  const frames: Frame[] = [];
  let left = -1;
  let right = numbers.length - 1;
  let compared = 0;

  frames.push({
    rows: [between("陣列", numbers, left, right)],
    message: `每次拿中間的數和它右邊的數比，看那裡是上坡還是下坡。左邊界放在位置 -1（陣列外面），右邊界放在最後一個位置。`,
  });

  while (left + 1 < right) {
    const middle = Math.floor((left + right) / 2);
    const value = numbers[middle];
    const next = numbers[middle + 1];
    const cells = between("陣列", numbers, left, right);
    cells.pointers.中 = middle;
    compared++;

    if (value > next) {
      frames.push({
        rows: [cells],
        message: `中間的 ${value} 比右邊的 ${next} 大，這裡是下坡，峰值在它這裡或左邊，把右邊界移到位置 ${middle}。`,
      });
      right = middle;
    } else {
      frames.push({
        rows: [cells],
        message: `中間的 ${value} 比右邊的 ${next} 小，這裡是上坡，往右走一定會遇到峰值，把左邊界移到位置 ${middle}。`,
      });
      left = middle;
    }
  }

  const cells = between("陣列", numbers, left, right);
  cells.answer = [right];
  frames.push({
    rows: [cells],
    message: `左右邊界相鄰，中間沒有位置了。右邊界的左邊是上坡、自己是下坡，所以 ${numbers[right]} 是峰值，位置是 ${right}。一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function hIndexCount(citations: number[]) {
  const frames: Frame[] = [];
  const count = citations.length;
  const candidates = [0, ...oneTo(count)];
  let compared = 0;

  for (let h = count; h > 0; h--) {
    let enough = 0;
    for (const citation of citations) {
      compared++;
      if (citation >= h) {
        enough++;
      }
    }
    const papers = row("引用次數", citations, { rangeStart: count - enough });
    const line = row("候選 h", candidates, { pointers: { 目前: h }, rangeEnd: h, indexed: false });

    if (enough >= h) {
      line.answer = [h];
      frames.push({
        rows: [papers, line],
        message: `h = ${h}：引用至少 ${h} 次的有 ${enough} 篇，夠 ${h} 篇，成立。從大往小試，第一個成立的就是答案，h 指數是 ${h}。一共比較了 ${compared} 次。`,
      });
      return frames;
    }

    frames.push({
      rows: [papers, line],
      message: `h 從最大的 ${count} 往下試，每次把整個陣列數一遍。h = ${h}：引用至少 ${h} 次的只有 ${enough} 篇，不到 ${h} 篇，不成立。`,
    });
  }

  frames.push({
    rows: [
      row("引用次數", citations, { rangeEnd: -1 }),
      row("候選 h", candidates, { rangeEnd: 0, answer: [0], indexed: false }),
    ],
    message: `從 ${count} 到 1 都不成立，所以 h 指數是 0。一共比較了 ${compared} 次。`,
  });
  return frames;
}

function hIndexBinary(citations: number[]) {
  const frames: Frame[] = [];
  const count = citations.length;
  const candidates = [0, ...oneTo(count)];
  let left = 0;
  let right = count + 1;
  let compared = 0;

  const startLine = between("候選 h", candidates, left, right);
  startLine.indexed = false;
  frames.push({
    rows: [row("引用次數", citations), startLine],
    message: `陣列已經排序，檢查 h 只要看倒數第 h 篇有沒有至少 h 次。左邊界放在 h = 0（一定成立），右邊界放在 h = ${right}（格子外面，一定不成立）。`,
  });

  while (left + 1 < right) {
    const middle = Math.floor((left + right) / 2);
    const paper = count - middle;
    const citation = citations[paper];
    const papers = row("引用次數", citations, { pointers: { 目前: paper }, rangeStart: paper });
    const line = between("候選 h", candidates, left, right);
    line.indexed = false;
    line.pointers.中 = middle;
    compared++;

    if (citation >= middle) {
      frames.push({
        rows: [papers, line],
        message: `試 h = ${middle}：倒數第 ${middle} 篇在位置 ${paper}，被引用 ${citation} 次，至少 ${middle} 次，它右邊的只會更多，成立，把左邊界移到 ${middle}。`,
      });
      left = middle;
    } else {
      frames.push({
        rows: [papers, line],
        message: `試 h = ${middle}：倒數第 ${middle} 篇在位置 ${paper}，只被引用 ${citation} 次，不到 ${middle} 次，不成立，把右邊界移到 ${middle}。`,
      });
      right = middle;
    }
  }

  const line = between("候選 h", candidates, left, right);
  line.indexed = false;
  line.answer = [left];
  frames.push({
    rows: [row("引用次數", citations, { rangeStart: count - left }), line],
    message: `左右邊界相鄰，中間沒有候選了。左邊界是最後一個成立的 h，所以 h 指數是 ${left}。一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function badVersionScan(count: number, bad: number) {
  const frames: Frame[] = [];
  const versions = oneTo(count);
  const results = versions.map(() => "？");
  let version = 1;

  while (version < bad) {
    const position = version - 1;
    results[position] = "好";
    frames.push({
      rows: [
        row("版本", versions, { pointers: { 目前: position }, rangeStart: position, indexed: false }),
        row("檢查結果", results, { indexed: false }),
      ],
      message: `要找第一個壞版本。從第 1 版開始一版一版檢查：第 ${version} 版是好的，看下一版。`,
    });
    version++;
  }

  const position = version - 1;
  results[position] = "壞";
  frames.push({
    rows: [
      row("版本", versions, { pointers: { 目前: position }, rangeStart: position, answer: [position], indexed: false }),
      row("檢查結果", results, { indexed: false }),
    ],
    message: `第 ${version} 版是壞的，前面的都是好的，所以第一個壞版本是 ${version}。從第 1 版查到這裡，一共檢查了 ${version} 個版本。`,
  });
  return frames;
}

function badVersionBinary(count: number, bad: number) {
  const frames: Frame[] = [];
  const versions = oneTo(count);
  const results = versions.map(() => "？");
  let left = 0;
  let right = count;
  let checked = 0;

  frames.push({
    rows: [numberLine("版本", versions, left, right), row("檢查結果", results, { indexed: false })],
    message: `要找第一個壞版本。左邊界放在第 0 版（不存在，當成好的），右邊界放在第 ${count} 版（題目保證最新版是壞的），每次檢查正中間的版本。`,
  });

  while (left + 1 < right) {
    const middle = Math.floor((left + right) / 2);
    const line = numberLine("版本", versions, left, right);
    line.pointers.中 = middle - 1;
    checked++;

    if (middle >= bad) {
      results[middle - 1] = "壞";
      frames.push({
        rows: [line, row("檢查結果", results, { indexed: false })],
        message: `檢查中間的第 ${middle} 版：是壞的，第一個壞版本在它這裡或它前面，把右邊界移到第 ${middle} 版。`,
      });
      right = middle;
    } else {
      results[middle - 1] = "好";
      frames.push({
        rows: [line, row("檢查結果", results, { indexed: false })],
        message: `檢查中間的第 ${middle} 版：是好的，它和它前面的版本都是好的，把左邊界移到第 ${middle} 版。`,
      });
      left = middle;
    }
  }

  const line = numberLine("版本", versions, left, right);
  line.answer = [right - 1];
  frames.push({
    rows: [line, row("檢查結果", results, { indexed: false })],
    message: `左右邊界相鄰，中間沒有版本了。左邊界是好的、右邊界是壞的，所以第一個壞版本是 ${right}。一共只檢查了 ${checked} 個版本。`,
  });
  return frames;
}

function guessScan(count: number, pick: number) {
  const frames: Frame[] = [];
  const numbers = oneTo(count);
  const replies = numbers.map(() => "？");
  let guess = 1;

  while (guess < pick) {
    const position = guess - 1;
    replies[position] = "太小";
    frames.push({
      rows: [
        row("數字", numbers, { pointers: { 目前: position }, rangeStart: position, indexed: false }),
        row("回應", replies, { indexed: false }),
      ],
      message: `要猜出系統選的數字。從 1 開始一個一個猜：猜 ${guess}，系統說太小了，猜下一個。`,
    });
    guess++;
  }

  const position = guess - 1;
  replies[position] = "猜中";
  frames.push({
    rows: [
      row("數字", numbers, { pointers: { 目前: position }, rangeStart: position, answer: [position], indexed: false }),
      row("回應", replies, { indexed: false }),
    ],
    message: `猜 ${guess}，系統說猜中了，系統選的數字就是 ${guess}。從 1 猜到這裡，一共猜了 ${guess} 次。`,
  });
  return frames;
}

function guessBinary(count: number, pick: number) {
  const frames: Frame[] = [];
  const numbers = oneTo(count);
  const replies = numbers.map(() => "？");
  let left = 0;
  let right = count;
  let guessed = 0;

  frames.push({
    rows: [numberLine("數字", numbers, left, right), row("回應", replies, { indexed: false })],
    message: `要猜出系統選的數字。左邊界放在 0（不在範圍裡，一定太小），右邊界放在 ${count}（答案最大就是它），每次猜正中間的數字。`,
  });

  while (left + 1 < right) {
    const middle = Math.floor((left + right) / 2);
    const line = numberLine("數字", numbers, left, right);
    line.pointers.中 = middle - 1;
    guessed++;

    if (middle < pick) {
      replies[middle - 1] = "太小";
      frames.push({
        rows: [line, row("回應", replies, { indexed: false })],
        message: `猜中間的 ${middle}：系統說太小了，答案一定比 ${middle} 大，把左邊界移到 ${middle}。`,
      });
      left = middle;
    } else if (middle > pick) {
      replies[middle - 1] = "太大";
      frames.push({
        rows: [line, row("回應", replies, { indexed: false })],
        message: `猜中間的 ${middle}：系統說太大了，答案一定比 ${middle} 小，但這個寫法只把右邊界移到 ${middle}，保持右邊界不小於答案。`,
      });
      right = middle;
    } else {
      replies[middle - 1] = "猜中";
      frames.push({
        rows: [line, row("回應", replies, { indexed: false })],
        message: `猜中間的 ${middle}：系統說猜中了。這個寫法不會在這裡停下來，一樣把右邊界移到 ${middle}，等中間沒有數字時，右邊界就是答案。`,
      });
      right = middle;
    }
  }

  const line = numberLine("數字", numbers, left, right);
  line.answer = [right - 1];
  frames.push({
    rows: [line, row("回應", replies, { indexed: false })],
    message: `左右邊界相鄰，中間沒有數字了，右邊界 ${right} 就是系統選的數字。一共只猜了 ${guessed} 次。`,
  });
  return frames;
}

function eatingHours(piles: number[], speed: number) {
  const hours: number[] = [];
  for (const pile of piles) {
    hours.push(Math.floor((pile - 1) / speed) + 1);
  }
  return hours;
}

function totalOf(numbers: number[]) {
  let total = 0;
  for (const number of numbers) {
    total += number;
  }
  return total;
}

function speedScan(piles: number[], limit: number) {
  const frames: Frame[] = [];
  const speeds = oneTo(Math.max(...piles));
  let speed = 1;
  let hours = eatingHours(piles, speed);
  let total = totalOf(hours);

  while (total > limit) {
    const position = speed - 1;
    frames.push({
      rows: [
        row("香蕉", piles),
        row("小時", hours),
        row("速度", speeds, { pointers: { 目前: position }, rangeStart: position, indexed: false }),
      ],
      message: `從速度 1 開始一個一個試。速度 ${speed}：各堆要 ${hours.join("、")} 小時，共 ${total} 小時，超過 ${limit} 小時，吃不完，速度加 1。`,
    });
    speed++;
    hours = eatingHours(piles, speed);
    total = totalOf(hours);
  }

  const position = speed - 1;
  frames.push({
    rows: [
      row("香蕉", piles),
      row("小時", hours),
      row("速度", speeds, { pointers: { 目前: position }, rangeStart: position, answer: [position], indexed: false }),
    ],
    message: `速度 ${speed}：各堆要 ${hours.join("、")} 小時，共 ${total} 小時，${limit} 小時內吃得完，最慢的速度就是 ${speed}。從 1 試到這裡，一共試了 ${speed} 種速度。`,
  });
  return frames;
}

function speedBinary(piles: number[], limit: number) {
  const frames: Frame[] = [];
  const fastest = Math.max(...piles);
  const speeds = oneTo(fastest);
  const unknown = piles.map(() => "？");
  let left = 0;
  let right = fastest;
  let tried = 0;

  frames.push({
    rows: [row("香蕉", piles), row("小時", unknown), numberLine("速度", speeds, left, right)],
    message: `速度越快越吃得完，所以對速度二分。左邊界放在速度 0（不存在，一定吃不完），右邊界放在最大那堆的 ${fastest}（每堆一小時，一定吃得完）。`,
  });

  while (left + 1 < right) {
    const middle = Math.floor((left + right) / 2);
    const hours = eatingHours(piles, middle);
    const total = totalOf(hours);
    const line = numberLine("速度", speeds, left, right);
    line.pointers.中 = middle - 1;
    tried++;

    if (total <= limit) {
      frames.push({
        rows: [row("香蕉", piles), row("小時", hours), line],
        message: `試中間的速度 ${middle}：各堆要 ${hours.join("、")} 小時，共 ${total} 小時，${limit} 小時內吃得完，答案在它這裡或更慢，把右邊界移到 ${middle}。`,
      });
      right = middle;
    } else {
      frames.push({
        rows: [row("香蕉", piles), row("小時", hours), line],
        message: `試中間的速度 ${middle}：各堆要 ${hours.join("、")} 小時，共 ${total} 小時，超過 ${limit} 小時，吃不完，要更快，把左邊界移到 ${middle}。`,
      });
      left = middle;
    }
  }

  const line = numberLine("速度", speeds, left, right);
  line.answer = [right - 1];
  frames.push({
    rows: [row("香蕉", piles), row("小時", eatingHours(piles, right)), line],
    message: `左右邊界相鄰，中間沒有速度了。左邊界吃不完、右邊界吃得完，所以最慢的速度是 ${right}。一共只試了 ${tried} 種速度。`,
  });
  return frames;
}

function pairsAll(spells: number[], potions: number[], success: number) {
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

function pairsBinary(spells: number[], potions: number[], success: number) {
  const frames: Frame[] = [];
  const sorted = [...potions].sort((a, b) => a - b);
  const count = sorted.length;
  const pairs: number[] = [];
  let multiplied = 0;

  frames.push({
    rows: [row("咒語", spells), row("藥水", potions), row("答案", pairs, { indexed: false })],
    message: `先把藥水由小到大排序。排序之後，對同一個咒語來說，越右邊的藥水乘積越大，成功的藥水會集中在右邊。`,
  });
  frames.push({
    rows: [row("咒語", spells), row("藥水", sorted), row("答案", pairs, { indexed: false })],
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
      row("藥水", sorted, { rangeEnd: -1 }),
      row("答案", pairs, { answer: pairs.map((pair, index) => index), indexed: false }),
    ],
    message: `答案是 ${pairs.join("、")}。藥水排序一次之後，每個咒語都用二分搜尋找，一共只算了 ${multiplied} 次乘法。`,
  });
  return frames;
}

const searchNumbers = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
const rotatedNumbers = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];
const repeatedNumbers = [1, 2, 3, 4, 6, 8, 8, 8, 9, 10];
const sortedMatrix = [
  [1, 3, 5, 7],
  [10, 11, 16, 20],
  [23, 30, 34, 60],
];
const rotatedForMin = [11, 13, 15, 17, 19, 21, 23, 2, 5, 8];
const hillNumbers = [1, 3, 4, 6, 7, 9, 10, 12, 8, 5];
const citationCounts = [0, 1, 1, 2, 3, 3, 5, 8, 9];
const bananaPiles = [3, 7, 10, 5];
const spellPowers = [5, 1, 3];
const potionPowers = [4, 1, 6, 2, 7, 3, 5];

export const stage2: ProblemAnimation[] = [
  {
    problemId: 33,
    brute: linearSearch(rotatedNumbers, 2),
    efficient: rotatedSearch(rotatedNumbers, 2),
  },
  {
    problemId: 34,
    brute: rangeScan(repeatedNumbers, 8),
    efficient: rangeBinary(repeatedNumbers, 8),
  },
  {
    problemId: 35,
    brute: insertScan(searchNumbers, 14),
    efficient: insertBinary(searchNumbers, 14),
  },
  {
    problemId: 74,
    brute: matrixScan(sortedMatrix, 34),
    efficient: matrixBinary(sortedMatrix, 34),
  },
  {
    problemId: 153,
    brute: minScan(rotatedForMin),
    efficient: minBinary(rotatedForMin),
  },
  {
    problemId: 162,
    brute: peakScan(hillNumbers),
    efficient: peakBinary(hillNumbers),
  },
  {
    problemId: 275,
    brute: hIndexCount(citationCounts),
    efficient: hIndexBinary(citationCounts),
  },
  {
    problemId: 278,
    brute: badVersionScan(10, 7),
    efficient: badVersionBinary(10, 7),
  },
  {
    problemId: 374,
    brute: guessScan(10, 8),
    efficient: guessBinary(10, 8),
  },
  {
    problemId: 704,
    brute: linearSearch(searchNumbers, 13),
    efficient: binarySearch(searchNumbers, 13),
  },
  {
    problemId: 875,
    brute: speedScan(bananaPiles, 5),
    efficient: speedBinary(bananaPiles, 5),
  },
  {
    problemId: 2300,
    brute: pairsAll(spellPowers, potionPowers, 12),
    efficient: pairsBinary(spellPowers, potionPowers, 12),
  },
];
