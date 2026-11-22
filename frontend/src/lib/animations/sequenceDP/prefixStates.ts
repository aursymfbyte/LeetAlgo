import { Cell, Frame, row } from "../types";

type TrieNode = {
  children: Record<string, TrieNode>;
  isEnd: boolean;
};

function buildTrie(words: string[]) {
  const root: TrieNode = { children: {}, isEnd: false };

  for (const word of words) {
    let node = root;
    for (const letter of word) {
      if (!node.children[letter]) {
        node.children[letter] = { children: {}, isEnd: false };
      }
      node = node.children[letter];
    }
    node.isEnd = true;
  }

  return root;
}

function yesNo(flags: boolean[]) {
  const cells: string[] = [];
  for (const flag of flags) {
    if (flag) {
      cells.push("是");
    } else {
      cells.push("否");
    }
  }
  return cells;
}

export function wordBreakBrute(text: string, words: string[]) {
  const frames: Frame[] = [];
  const letters = [...text];
  const count = letters.length;
  const times = letters.map(() => 0);
  const pieces: string[] = [];
  let tried = 0;

  frames.push({
    rows: [
      row("字串", letters),
      row("字典", words, { indexed: false }),
      row("切法", pieces, { indexed: false }),
      row("拆過幾次", times),
    ],
    message: "從開頭試字典裡的每個單字，對得上就切下來，剩下的再用同樣的方法拆。不記結果，同一個位置可能被重複拆很多次。",
  });

  function canBreak(start: number): boolean {
    if (start === count) {
      frames.push({
        rows: [
          row("字串", letters),
          row("字典", words, { indexed: false }),
          row("切法", pieces, { indexed: false }),
          row("拆過幾次", times),
        ],
        message: `切到字串結尾了，切法是 ${pieces.join("、")}，每一段都是字典裡的單字。`,
      });
      return true;
    }

    times[start]++;
    tried++;
    const fits: string[] = [];

    for (const word of words) {
      if (text.startsWith(word, start)) {
        fits.push(word);
        pieces.push(word);
        const done = canBreak(start + word.length);
        if (done) {
          return true;
        }
        pieces.pop();
      }
    }

    let reason = `剩下的 ${text.slice(start)} 沒有任何單字對得上`;
    if (fits.length > 0) {
      reason = `${fits.join("、")} 對得上，可是切掉之後剩下的都拆不完`;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 起點: start }, rangeStart: start }),
        row("字典", words, { indexed: false }),
        row("切法", pieces, { indexed: false }),
        row("拆過幾次", times, { pointers: { 起點: start } }),
      ],
      message: `從位置 ${start} 開始：${reason}，這條路不通。這是第 ${times[start]} 次從位置 ${start} 開始拆。`,
    });
    return false;
  }

  const answer = canBreak(0);
  let result = `每一種切法都試過了，${text} 拆不完，答案是 false。`;
  if (answer) {
    result = `${text} 可以拆成 ${pieces.join("、")}，答案是 true。`;
  }

  frames.push({
    rows: [
      row("字串", letters),
      row("字典", words, { indexed: false }),
      row("切法", pieces, { indexed: false }),
      row("拆過幾次", times),
    ],
    message: `${result}不記結果，同一個起點會重複試，一共試了 ${tried} 次起點。`,
  });
  return frames;
}

export function wordBreakTrie(text: string, words: string[]) {
  const frames: Frame[] = [];
  const letters = [...text];
  const count = letters.length;
  const root = buildTrie(words);
  const reachable = [true];
  for (let index = 0; index < count; index++) {
    reachable.push(false);
  }
  let starts = 0;

  frames.push({
    rows: [row("字串", letters), row("字典", words, { indexed: false }), row("能拆到", yesNo(reachable))],
    message: "先把字典的單字放進字典樹：開頭一樣的單字共用同一條路，從某個位置沿著樹往後走一趟，就同時比對了所有單字。",
  });
  frames.push({
    rows: [
      row("字串", letters),
      row("字典", words, { indexed: false }),
      row("能拆到", yesNo(reachable), { pointers: { 起點: 0 } }),
    ],
    message: "「能拆到」的位置 i 記錄前 i 個字元能不能剛好拆成單字。位置 0 是什麼都還沒拆，先記「是」。記「是」的位置才能當下一個單字的起點。",
  });

  for (let start = 0; start < count; start++) {
    if (!reachable[start]) {
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 起點: start }, rangeStart: start }),
          row("字典", words, { indexed: false }),
          row("能拆到", yesNo(reachable), { pointers: { 起點: start } }),
        ],
        message: `「能拆到」的位置 ${start} 是「否」，前面沒辦法剛好拆到這裡，不能當起點，跳過。`,
      });
      continue;
    }

    starts++;
    const found: string[] = [];
    const ends: number[] = [];
    let node = root;

    for (let index = start; index < count; index++) {
      const letter = letters[index];
      if (!node.children[letter]) {
        break;
      }
      node = node.children[letter];
      if (node.isEnd) {
        reachable[index + 1] = true;
        found.push(text.slice(start, index + 1));
        ends.push(index + 1);
      }
    }

    let message = `從位置 ${start} 沿字典樹往後走，還沒走到任何單字的結尾就沒有路了，從這裡拆不下去。`;
    if (found.length > 0) {
      message = `從位置 ${start} 沿字典樹往後走，途中走出的 ${found.join("、")} 是字典裡的單字，所以能拆到位置 ${ends.join("、")}，記成「是」。`;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 起點: start }, rangeStart: start }),
        row("字典", words, { indexed: false }),
        row("能拆到", yesNo(reachable), { pointers: { 起點: start } }),
      ],
      message,
    });
  }

  let result = `「能拆到」的位置 ${count} 是「否」，${text} 拆不完，答案是 false。`;
  if (reachable[count]) {
    result = `「能拆到」的位置 ${count} 是「是」，${text} 可以拆完，答案是 true。`;
  }

  frames.push({
    rows: [
      row("字串", letters),
      row("字典", words, { indexed: false }),
      row("能拆到", yesNo(reachable), { answer: [count] }),
    ],
    message: `${result}每個位置最多只當一次起點，一共只試了 ${starts} 次起點。`,
  });
  return frames;
}

export function lisCompareAll(nums: number[]) {
  const frames: Frame[] = [];
  const lengths = nums.map(() => 1);
  const shown: Cell[] = nums.map(() => "?");
  let compared = 0;

  shown[0] = 1;
  frames.push({
    rows: [row("陣列", nums, { pointers: { 目前: 0 }, rangeEnd: 0 }), row("結尾長度", shown, { pointers: { 目前: 0 } })],
    message: `「結尾長度」記錄以每個數結尾的最長遞增子序列有多長。位置 0 的 ${nums[0]} 前面沒有數，長度是 1。接著每個數都和前面所有的數比。`,
  });

  for (let current = 1; current < nums.length; current++) {
    const num = nums[current];
    shown[current] = 1;

    for (let before = 0; before < current; before++) {
      const earlier = nums[before];
      const longest = lengths[current];
      let result = `沒有比它小，不能接在後面，長度維持 ${longest}。`;
      compared++;

      if (earlier < num) {
        const longer = lengths[before] + 1;
        result = `比它小，可以接，長度 ${lengths[before]} + 1 = ${longer}，沒有比目前的 ${longest} 長，不更新。`;
        if (longer > longest) {
          lengths[current] = longer;
          shown[current] = longer;
          result = `比它小，可以接，長度 ${lengths[before]} + 1 = ${longer}，比目前的 ${longest} 長，更新。`;
        }
      }

      frames.push({
        rows: [
          row("陣列", nums, { pointers: { 前面: before, 目前: current }, rangeEnd: current }),
          row("結尾長度", shown, { pointers: { 前面: before, 目前: current } }),
        ],
        message: `算位置 ${current} 的 ${num}：位置 ${before} 的 ${earlier} ${result}`,
      });
    }
  }

  let best = 0;
  let bestEnd = 0;
  for (let index = 0; index < lengths.length; index++) {
    if (lengths[index] > best) {
      best = lengths[index];
      bestEnd = index;
    }
  }

  frames.push({
    rows: [row("陣列", nums), row("結尾長度", shown, { answer: [bestEnd] })],
    message: `「結尾長度」裡最大的是 ${best}，所以最長遞增子序列的長度是 ${best}。每個數都和前面所有的數比，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function lisBinarySearch(nums: number[]) {
  const frames: Frame[] = [];
  const tails: number[] = [];
  let compared = 0;

  frames.push({
    rows: [row("陣列", nums), row("最小結尾", tails)],
    message: "「最小結尾」的位置 0 放長度 1 的遞增子序列最小能用什麼數結尾，位置 1 放長度 2 的，依此類推。它一定由小到大，可以二分搜尋。",
  });

  for (let current = 0; current < nums.length; current++) {
    const num = nums[current];
    const numbers = row("陣列", nums, { pointers: { 目前: current }, rangeStart: current });
    let left = 0;
    let right = tails.length;

    while (left < right) {
      const middle = Math.floor((left + right) / 2);
      const tail = tails[middle];
      const candidates = row("最小結尾", tails, { pointers: { 中: middle }, rangeStart: left, rangeEnd: right - 1 });
      compared++;

      if (tail < num) {
        frames.push({
          rows: [numbers, candidates],
          message: `替 ${num} 找第一個不比它小的結尾：中間的 ${tail} 比 ${num} 小，要找的在它右邊。`,
        });
        left = middle + 1;
      } else {
        frames.push({
          rows: [numbers, candidates],
          message: `替 ${num} 找第一個不比它小的結尾：中間的 ${tail} 沒有比 ${num} 小，要找的在它這裡或左邊。`,
        });
        right = middle;
      }
    }

    let message = `「最小結尾」裡沒有不比 ${num} 小的數，把 ${num} 放到最後一格，最長的遞增子序列變成長度 ${left + 1}。`;
    if (left < tails.length) {
      message = `第一個不比 ${num} 小的是位置 ${left} 的 ${tails[left]}，用 ${num} 換掉它：長度 ${left + 1} 的遞增子序列，結尾越小越容易往後接。`;
    }
    tails[left] = num;

    frames.push({
      rows: [numbers, row("最小結尾", tails, { pointers: { 放入: left } })],
      message,
    });
  }

  const all = tails.map((tail, index) => index);
  frames.push({
    rows: [row("陣列", nums), row("最小結尾", tails, { answer: all })],
    message: `「最小結尾」有 ${tails.length} 格，所以最長遞增子序列的長度是 ${tails.length}。每個數只做一次二分搜尋，一共只比較了 ${compared} 次。`,
  });
  return frames;
}
