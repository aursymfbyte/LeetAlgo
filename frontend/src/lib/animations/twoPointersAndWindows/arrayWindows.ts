import { Frame, row } from "../types";
import { positions } from "./rows";

function shortestFrame(numbers: number[], target: number, bestStart: number, bestLength: number, summary: string) {
  if (bestLength === 0) {
    return {
      rows: [row("陣列", numbers, { rangeEnd: -1 })],
      message: `整個陣列加起來也不到 ${target}，沒有符合的子陣列。${summary}`,
    };
  }

  const bestEnd = bestStart + bestLength - 1;
  const answer: number[] = [];
  for (let index = bestStart; index <= bestEnd; index++) {
    answer.push(index);
  }
  return {
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer })],
    message: `總和至少是 ${target} 的最短子陣列，長度是 ${bestLength}。${summary}`,
  };
}

export function allSubarrays(numbers: number[], target: number) {
  const frames: Frame[] = [];
  let bestStart = 0;
  let bestLength = 0;
  let added = 0;

  for (let start = 0; start < numbers.length; start++) {
    let sum = 0;
    for (let end = start; end < numbers.length; end++) {
      sum += numbers[end];
      added++;
      const cells = row("陣列", numbers, {
        pointers: { 起點: start, 終點: end },
        rangeStart: start,
        rangeEnd: end,
      });

      if (sum < target) {
        frames.push({
          rows: [cells],
          message: `從位置 ${start} 開始往右加：加到 ${numbers[end]}，總和是 ${sum}，還不到 ${target}。`,
        });
      } else {
        const length = end - start + 1;
        if (bestLength === 0 || length < bestLength) {
          bestLength = length;
          bestStart = start;
        }
        frames.push({
          rows: [cells],
          message: `從位置 ${start} 開始往右加：加到 ${numbers[end]}，總和是 ${sum}，達到 ${target} 了，長度是 ${length}，目前最短是 ${bestLength}。換下一個起點重新加。`,
        });
        break;
      }
    }
  }

  const summary = `每個起點都重新加一次，一共做了 ${added} 次加法。`;
  frames.push(shortestFrame(numbers, target, bestStart, bestLength, summary));
  return frames;
}

export function slidingWindow(numbers: number[], target: number) {
  const frames: Frame[] = [];
  let left = 0;
  let sum = 0;
  let bestStart = 0;
  let bestLength = 0;
  let moves = 0;

  for (let right = 0; right < numbers.length; right++) {
    sum += numbers[right];
    moves++;
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
      message: `右邊界往右移，把 ${numbers[right]} 加進視窗，總和是 ${sum}。`,
    });

    while (sum >= target) {
      const length = right - left + 1;
      if (bestLength === 0 || length < bestLength) {
        bestLength = length;
        bestStart = left;
      }
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
        message: `總和 ${sum} 已經達到 ${target}，視窗長度是 ${length}，目前最短是 ${bestLength}。把左邊的 ${numbers[left]} 移出視窗，看能不能更短。`,
      });
      sum -= numbers[left];
      left++;
      moves++;
    }
  }

  const summary = `總和是邊移動邊更新的，不用重新加，兩個邊界一共只移動了 ${moves} 次。`;
  frames.push(shortestFrame(numbers, target, bestStart, bestLength, summary));
  return frames;
}

export function averageBrute(numbers: number[], size: number) {
  const frames: Frame[] = [];
  let bestStart = 0;
  let bestSum = -Infinity;
  let added = 0;

  for (let start = 0; start + size <= numbers.length; start++) {
    const end = start + size - 1;
    let sum = 0;

    for (let index = start; index <= end; index++) {
      sum += numbers[index];
      added++;
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 起點: start, 目前: index }, rangeStart: start, rangeEnd: end })],
        message: `從位置 ${start} 開始，重新加 ${size} 個數：加到 ${numbers[index]}，總和是 ${sum}。`,
      });
    }

    if (sum > bestSum) {
      bestSum = sum;
      bestStart = start;
    }
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 起點: start }, rangeStart: start, rangeEnd: end })],
      message: `這 ${size} 個數的總和是 ${sum}，目前最大總和是 ${bestSum}。換下一個起點，全部重新加。`,
    });
  }

  const bestEnd = bestStart + size - 1;
  frames.push({
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `最大總和是 ${bestSum}，平均是 ${bestSum} ÷ ${size} = ${bestSum / size}。每個起點都重新加 ${size} 個數，一共做了 ${added} 次加法。`,
  });
  return frames;
}

export function averageWindow(numbers: number[], size: number) {
  const frames: Frame[] = [];
  let sum = 0;
  let bestStart = 0;
  let bestSum = -Infinity;
  let changes = 0;

  for (let right = 0; right < numbers.length; right++) {
    sum += numbers[right];
    changes++;
    const left = right - size + 1;

    if (left < 0) {
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 右: right }, rangeEnd: right })],
        message: `把 ${numbers[right]} 加進視窗，總和是 ${sum}。視窗長度還不到 ${size}，繼續往右。`,
      });
      continue;
    }

    if (sum > bestSum) {
      bestSum = sum;
      bestStart = left;
    }
    const out = numbers[left];
    const rest = sum - out;
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
      message: `把 ${numbers[right]} 加進視窗，總和是 ${sum}，目前最大總和是 ${bestSum}。再把最左邊的 ${out} 減掉，總和剩 ${rest}。`,
    });
    sum = rest;
    changes++;
  }

  const bestEnd = bestStart + size - 1;
  frames.push({
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `最大總和是 ${bestSum}，平均是 ${bestSum} ÷ ${size} = ${bestSum / size}。視窗每滑一格只加一個數、減一個數，一共只做了 ${changes} 次加減。`,
  });
  return frames;
}

export function productBrute(numbers: number[], limit: number) {
  const frames: Frame[] = [];
  let found = 0;
  let multiplied = 0;

  for (let start = 0; start < numbers.length; start++) {
    let product = 1;

    for (let end = start; end < numbers.length; end++) {
      product *= numbers[end];
      multiplied++;
      const cells = row("陣列", numbers, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end });

      if (product >= limit) {
        frames.push({
          rows: [cells],
          message: `從位置 ${start} 開始往右乘：乘到 ${numbers[end]}，乘積是 ${product}，沒有小於 ${limit}，再乘只會更大。換下一個起點重新乘。`,
        });
        break;
      }

      found++;
      frames.push({
        rows: [cells],
        message: `從位置 ${start} 開始往右乘：乘到 ${numbers[end]}，乘積是 ${product}，小於 ${limit}，找到一個，目前有 ${found} 個。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers)],
    message: `乘積小於 ${limit} 的子陣列一共有 ${found} 個。每個起點都重新乘一次，一共做了 ${multiplied} 次乘法。`,
  });
  return frames;
}

export function productWindow(numbers: number[], limit: number) {
  const frames: Frame[] = [];
  let left = 0;
  let product = 1;
  let found = 0;
  let moves = 0;

  for (let right = 0; right < numbers.length; right++) {
    product *= numbers[right];
    moves++;
    let action = `右邊界往右移，把 ${numbers[right]} 乘進視窗，乘積是 ${product}。`;

    while (product >= limit) {
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
        message: `${action}沒有小於 ${limit}，要把左邊的數除掉。`,
      });
      product /= numbers[left];
      action = `把左邊的 ${numbers[left]} 除掉，乘積變成 ${product}。`;
      left++;
      moves++;
    }

    const count = right - left + 1;
    found += count;
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
      message: `${action}小於 ${limit}，以位置 ${right} 結尾的子陣列一次算進 ${count} 個，目前有 ${found} 個。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers)],
    message: `乘積小於 ${limit} 的子陣列一共有 ${found} 個。乘積是邊移動邊更新的，兩個邊界一共只移動了 ${moves} 次。`,
  });
  return frames;
}

export function onesBrute(numbers: number[], flips: number) {
  const frames: Frame[] = [];
  let bestStart = 0;
  let bestLength = 0;
  let checked = 0;

  for (let start = 0; start < numbers.length; start++) {
    let zeros = 0;

    for (let end = start; end < numbers.length; end++) {
      if (numbers[end] === 0) {
        zeros++;
      }
      checked++;
      const cells = row("陣列", numbers, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end });

      if (zeros > flips) {
        frames.push({
          rows: [cells],
          message: `從位置 ${start} 開始往右延伸：加進 ${numbers[end]}，這一段有 ${zeros} 個 0，超過 ${flips} 個，翻不完。換下一個起點重新數。`,
        });
        break;
      }

      const length = end - start + 1;
      if (length > bestLength) {
        bestLength = length;
        bestStart = start;
      }
      frames.push({
        rows: [cells],
        message: `從位置 ${start} 開始往右延伸：加進 ${numbers[end]}，這一段有 ${zeros} 個 0，沒超過 ${flips} 個，長度是 ${length}，目前最長是 ${bestLength}。`,
      });
    }
  }

  const bestEnd = bestStart + bestLength - 1;
  frames.push({
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `最長是 ${bestLength}：把位置 ${bestStart} 到 ${bestEnd} 裡的 0 翻成 1，就是一段連續的 1。每個起點都重新數，一共檢查了 ${checked} 次。`,
  });
  return frames;
}

export function onesWindow(numbers: number[], flips: number) {
  const frames: Frame[] = [];
  let left = 0;
  let zeros = 0;
  let bestStart = 0;
  let bestLength = 0;
  let moves = 0;

  for (let right = 0; right < numbers.length; right++) {
    if (numbers[right] === 0) {
      zeros++;
    }
    moves++;
    let action = `右邊界往右移，${numbers[right]} 進視窗，視窗裡有 ${zeros} 個 0。`;

    while (zeros > flips) {
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
        message: `${action}超過 ${flips} 個，翻不完，要把左邊的數移出視窗。`,
      });
      if (numbers[left] === 0) {
        zeros--;
      }
      action = `把左邊的 ${numbers[left]} 移出視窗，視窗裡剩 ${zeros} 個 0。`;
      left++;
      moves++;
    }

    const length = right - left + 1;
    if (length > bestLength) {
      bestLength = length;
      bestStart = left;
    }
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
      message: `${action}沒超過 ${flips} 個，視窗長度是 ${length}，目前最長是 ${bestLength}。`,
    });
  }

  const bestEnd = bestStart + bestLength - 1;
  frames.push({
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `最長是 ${bestLength}：把位置 ${bestStart} 到 ${bestEnd} 裡的 0 翻成 1，就是一段連續的 1。兩個邊界一共只移動了 ${moves} 次。`,
  });
  return frames;
}
