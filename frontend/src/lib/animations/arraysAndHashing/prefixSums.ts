import { Cell, Frame, row } from "../types";
import { allPositions, tableCells } from "./rows";

export function rangeSumAddAgain(numbers: number[], queries: number[][]) {
  const frames: Frame[] = [];
  const answers: Cell[] = queries.map(() => "");
  let added = 0;

  for (let q = 0; q < queries.length; q++) {
    const [left, right] = queries[q];
    let sum = 0;

    for (let i = left; i <= right; i++) {
      sum += numbers[i];
      added++;
      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 目前: i }, rangeStart: left, rangeEnd: right }),
          row("答案", answers, { indexed: false }),
        ],
        message: `第 ${q + 1} 次查詢，要算位置 ${left} 到 ${right} 的總和：把範圍裡的數一個一個加，加上 ${numbers[i]}，總和是 ${sum}。`,
      });
    }

    answers[q] = sum;
    frames.push({
      rows: [
        row("陣列", numbers, { rangeStart: left, rangeEnd: right }),
        row("答案", answers, { indexed: false, answer: [q] }),
      ],
      message: `第 ${q + 1} 次查詢加完了，位置 ${left} 到 ${right} 的總和是 ${sum}。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers), row("答案", answers, { indexed: false, answer: allPositions(answers) })],
    message: `${queries.length} 次查詢的答案是 ${answers.join("、")}。每次查詢都重新加一遍，一共做了 ${added} 次加法。`,
  });
  return frames;
}

export function rangeSumPrefix(numbers: number[], queries: number[][]) {
  const frames: Frame[] = [];
  const prefix = [0];
  const shown: Cell[] = [0, ...numbers.map(() => "")];
  const answers: Cell[] = queries.map(() => "");
  let calculated = 0;

  for (let i = 0; i < numbers.length; i++) {
    prefix.push(prefix[i] + numbers[i]);
    calculated++;
    shown[i + 1] = prefix[i + 1];
    frames.push({
      rows: [
        row("陣列", numbers, { pointers: { 目前: i } }),
        row("前綴和", shown, { pointers: { 目前: i + 1 } }),
        row("答案", answers, { indexed: false }),
      ],
      message: `先建前綴和：前一格的 ${prefix[i]} 加上 ${numbers[i]}，得到 ${prefix[i + 1]}，代表陣列前 ${i + 1} 個數的總和。`,
    });
  }

  for (let q = 0; q < queries.length; q++) {
    const [left, right] = queries[q];
    const sum = prefix[right + 1] - prefix[left];
    calculated++;
    answers[q] = sum;
    frames.push({
      rows: [
        row("陣列", numbers, { rangeStart: left, rangeEnd: right }),
        row("前綴和", shown, { pointers: { 左: left, 右: right + 1 } }),
        row("答案", answers, { indexed: false, answer: [q] }),
      ],
      message: `第 ${q + 1} 次查詢，位置 ${left} 到 ${right}：前綴和位置 ${right + 1} 的 ${prefix[right + 1]} 減掉位置 ${left} 的 ${prefix[left]}，答案是 ${sum}，不用重新加。`,
    });
  }

  frames.push({
    rows: [
      row("陣列", numbers),
      row("前綴和", shown),
      row("答案", answers, { indexed: false, answer: allPositions(answers) }),
    ],
    message: `${queries.length} 次查詢的答案是 ${answers.join("、")}。前綴和只建一次，之後每次查詢只要減一次，一共只算了 ${calculated} 次。`,
  });
  return frames;
}

export function subarraySumBrute(numbers: number[], k: number) {
  const frames: Frame[] = [];
  let found = 0;
  let added = 0;

  for (let start = 0; start < numbers.length; start++) {
    let sum = 0;
    const inside: number[] = [];

    for (let end = start; end < numbers.length; end++) {
      sum += numbers[end];
      added++;
      inside.push(end);
      const cells = row("陣列", numbers, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end });

      if (sum === k) {
        found++;
        frames.push({
          rows: [{ ...cells, answer: [...inside] }],
          message: `從位置 ${start} 開始往右加：加到 ${numbers[end]}，總和是 ${sum}，剛好等於 ${k}，這是第 ${found} 個。`,
        });
      } else {
        frames.push({
          rows: [cells],
          message: `從位置 ${start} 開始往右加：加到 ${numbers[end]}，總和是 ${sum}，不是 ${k}。`,
        });
      }
    }
  }

  frames.push({
    rows: [row("陣列", numbers)],
    message: `總和等於 ${k} 的子陣列一共有 ${found} 個。每個起點都重新加一次，一共做了 ${added} 次加法。`,
  });
  return frames;
}

export function subarraySumPrefix(numbers: number[], k: number) {
  const frames: Frame[] = [];
  const prefixCount = new Map<number, number>();
  prefixCount.set(0, 1);
  let prefix = 0;
  let answer = 0;
  let looked = 0;

  frames.push({
    rows: [row("陣列", numbers), row("雜湊表", tableCells(prefixCount), { indexed: false })],
    message: "子陣列的總和等於兩個前綴和相減。雜湊表記錄每個前綴和出現過幾次，一開始先放 0→1，代表還沒加任何數時總和是 0。",
  });

  for (let i = 0; i < numbers.length; i++) {
    prefix += numbers[i];
    const need = prefix - k;
    const times = prefixCount.get(need) ?? 0;
    answer += times;
    looked++;
    const seen = prefixCount.get(prefix) ?? 0;
    prefixCount.set(prefix, seen + 1);

    frames.push({
      rows: [
        row("陣列", numbers, { pointers: { 目前: i }, rangeEnd: i }),
        row("雜湊表", tableCells(prefixCount), { indexed: false }),
      ],
      message: `加上 ${numbers[i]}，前綴和是 ${prefix}。查 ${prefix} - ${k} = ${need} 之前出現過幾次：${times} 次，答案變成 ${answer}。再把 ${prefix} 記進雜湊表。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers), row("雜湊表", tableCells(prefixCount), { indexed: false })],
    message: `總和等於 ${k} 的子陣列一共有 ${answer} 個。陣列只走一遍，不用重新加，一共只查了 ${looked} 次雜湊表。`,
  });
  return frames;
}

export function pivotAddAgain(numbers: number[]) {
  const frames: Frame[] = [];
  let added = 0;

  for (let middle = 0; middle < numbers.length; middle++) {
    let leftSum = 0;
    for (let i = 0; i < middle; i++) {
      leftSum += numbers[i];
      added++;
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 中: middle, 目前: i }, rangeEnd: middle - 1 })],
        message: `檢查位置 ${middle}：把它左邊的數一個一個加起來，加上 ${numbers[i]}，左邊總和是 ${leftSum}。`,
      });
    }

    let rightSum = 0;
    for (let i = middle + 1; i < numbers.length; i++) {
      rightSum += numbers[i];
      added++;
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 中: middle, 目前: i }, rangeStart: middle + 1 })],
        message: `檢查位置 ${middle}：把它右邊的數一個一個加起來，加上 ${numbers[i]}，右邊總和是 ${rightSum}。`,
      });
    }

    if (leftSum === rightSum) {
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 中: middle }, answer: [middle] })],
        message: `位置 ${middle}：左邊總和 ${leftSum}，右邊總和 ${rightSum}，相等，答案是 ${middle}。每個位置都重新加一遍，一共做了 ${added} 次加法。`,
      });
      return frames;
    }

    frames.push({
      rows: [row("陣列", numbers, { pointers: { 中: middle } })],
      message: `位置 ${middle}：左邊總和 ${leftSum}，右邊總和 ${rightSum}，不相等。換下一個位置，兩邊都要重新加。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 })],
    message: `每個位置都檢查過了，沒有左右總和相等的位置，答案是 -1。一共做了 ${added} 次加法。`,
  });
  return frames;
}

export function pivotTotal(numbers: number[]) {
  const frames: Frame[] = [];
  let total = 0;
  let added = 0;

  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
    added++;
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 目前: i }, rangeEnd: i })],
      message: `先把整個陣列加一遍，算出總和：加上 ${numbers[i]}，總和是 ${total}。`,
    });
  }

  let leftSum = 0;
  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    const rightSum = total - leftSum - num;
    const cells = row("陣列", numbers, { pointers: { 中: i } });

    if (leftSum === rightSum) {
      frames.push({
        rows: [{ ...cells, answer: [i] }],
        message: `位置 ${i}：左邊總和 ${leftSum}，右邊總和是 ${total} - ${leftSum} - ${num} = ${rightSum}，相等，答案是 ${i}。右邊用減的就知道，一共只做了 ${added} 次加法。`,
      });
      return frames;
    }

    frames.push({
      rows: [cells],
      message: `位置 ${i}：左邊總和 ${leftSum}，右邊總和是 ${total} - ${leftSum} - ${num} = ${rightSum}，不相等。把 ${num} 加進左邊總和，看下一個位置。`,
    });
    leftSum += num;
    added++;
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 })],
    message: `每個位置都檢查過了，沒有左右總和相等的位置，答案是 -1。一共只做了 ${added} 次加法。`,
  });
  return frames;
}
