import { Frame, row } from "../types";
import { between, lowerBoundSteps } from "./searchSteps";

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

export function rotatedSearch(numbers: number[], target: number) {
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
      rows: [row("陣列", numbers, { rangeEnd: -1, ends: true })],
      message: `右邊界還停在位置 ${count}（陣列外面），這一段沒有數大於等於 ${target}，所以 ${target} 不在陣列中。一共只比較了 ${compared} 次。`,
    });
    return frames;
  }

  compared++;
  if (numbers[index] !== target) {
    frames.push({
      rows: [row("陣列", numbers, { rangeEnd: -1, ends: true })],
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

export function minScan(numbers: number[]) {
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

export function minBinary(numbers: number[]) {
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

export function peakScan(numbers: number[]) {
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

export function peakBinary(numbers: number[]) {
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
