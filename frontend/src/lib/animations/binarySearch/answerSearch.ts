import { between } from "./searchSteps";
import { Frame, row } from "../types";

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

export function hIndexCount(citations: number[]) {
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

export function hIndexBinary(citations: number[]) {
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

export function badVersionScan(count: number, bad: number) {
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

export function badVersionBinary(count: number, bad: number) {
  const frames: Frame[] = [];
  const versions = oneTo(count);
  const results = versions.map(() => "？");
  let left = 0;
  let right = count;
  let checked = 0;

  frames.push({
    rows: [numberLine("版本", versions, left, right), row("檢查結果", results, { indexed: false, ends: true })],
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
        rows: [line, row("檢查結果", results, { indexed: false, ends: true })],
        message: `檢查中間的第 ${middle} 版：是壞的，第一個壞版本在它這裡或它前面，把右邊界移到第 ${middle} 版。`,
      });
      right = middle;
    } else {
      results[middle - 1] = "好";
      frames.push({
        rows: [line, row("檢查結果", results, { indexed: false, ends: true })],
        message: `檢查中間的第 ${middle} 版：是好的，它和它前面的版本都是好的，把左邊界移到第 ${middle} 版。`,
      });
      left = middle;
    }
  }

  const line = numberLine("版本", versions, left, right);
  line.answer = [right - 1];
  frames.push({
    rows: [line, row("檢查結果", results, { indexed: false, ends: true })],
    message: `左右邊界相鄰，中間沒有版本了。左邊界是好的、右邊界是壞的，所以第一個壞版本是 ${right}。一共只檢查了 ${checked} 個版本。`,
  });
  return frames;
}

export function guessScan(count: number, pick: number) {
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

export function guessBinary(count: number, pick: number) {
  const frames: Frame[] = [];
  const numbers = oneTo(count);
  const replies = numbers.map(() => "？");
  let left = 0;
  let right = count;
  let guessed = 0;

  frames.push({
    rows: [numberLine("數字", numbers, left, right), row("回應", replies, { indexed: false, ends: true })],
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
        rows: [line, row("回應", replies, { indexed: false, ends: true })],
        message: `猜中間的 ${middle}：系統說太小了，答案一定比 ${middle} 大，把左邊界移到 ${middle}。`,
      });
      left = middle;
    } else if (middle > pick) {
      replies[middle - 1] = "太大";
      frames.push({
        rows: [line, row("回應", replies, { indexed: false, ends: true })],
        message: `猜中間的 ${middle}：系統說太大了，答案一定比 ${middle} 小，但這個寫法只把右邊界移到 ${middle}，保持右邊界不小於答案。`,
      });
      right = middle;
    } else {
      replies[middle - 1] = "猜中";
      frames.push({
        rows: [line, row("回應", replies, { indexed: false, ends: true })],
        message: `猜中間的 ${middle}：系統說猜中了。這個寫法不會在這裡停下來，一樣把右邊界移到 ${middle}，等中間沒有數字時，右邊界就是答案。`,
      });
      right = middle;
    }
  }

  const line = numberLine("數字", numbers, left, right);
  line.answer = [right - 1];
  frames.push({
    rows: [line, row("回應", replies, { indexed: false, ends: true })],
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

export function speedScan(piles: number[], limit: number) {
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

export function speedBinary(piles: number[], limit: number) {
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
