import { Cell, Frame, row } from "../types";
import { allPositions, tableCells } from "./rows";

const alphabet = "abcdefghijklmnopqrstuvwxyz";

export function twoSumBrute(numbers: number[], target: number) {
  const frames: Frame[] = [];
  let compared = 0;

  for (let first = 0; first < numbers.length; first++) {
    for (let second = first + 1; second < numbers.length; second++) {
      const sum = numbers[first] + numbers[second];
      const cells = row("陣列", numbers, { pointers: { 甲: first, 乙: second }, rangeStart: first });
      compared++;

      if (sum === target) {
        frames.push({
          rows: [{ ...cells, answer: [first, second] }],
          message: `${numbers[first]} + ${numbers[second]} = ${sum}，等於 ${target}，找到了，答案是位置 ${first} 和 ${second}。一共比較了 ${compared} 次。`,
        });
        return frames;
      }

      frames.push({
        rows: [cells],
        message: `要找兩個數加起來等於 ${target}。每一組都試：${numbers[first]} + ${numbers[second]} = ${sum}，不是，換下一組。`,
      });
    }
  }
  return frames;
}

export function twoSumHashMap(numbers: number[], target: number) {
  const frames: Frame[] = [];
  const indexOf = new Map<number, number>();
  let looked = 0;

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    const need = target - num;
    const found = indexOf.get(need);
    looked++;

    if (found !== undefined) {
      const entry = [...indexOf.keys()].indexOf(need);
      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 目前: i }, answer: [found, i] }),
          row("雜湊表", tableCells(indexOf), { indexed: false, answer: [entry] }),
        ],
        message: `看到 ${num}，還缺 ${target} - ${num} = ${need}。雜湊表裡有 ${need}，它在位置 ${found}，答案是位置 ${found} 和 ${i}。一共只查了 ${looked} 次。`,
      });
      return frames;
    }

    indexOf.set(num, i);
    frames.push({
      rows: [
        row("陣列", numbers, { pointers: { 目前: i } }),
        row("雜湊表", tableCells(indexOf), { indexed: false }),
      ],
      message: `看到 ${num}，還缺 ${target} - ${num} = ${need}。雜湊表裡沒有 ${need}，先把 ${num} 和它的位置 ${i} 存進雜湊表。`,
    });
  }
  return frames;
}

export function groupAnagramsPairs(words: string[]) {
  const frames: Frame[] = [];
  const groups: Cell[] = words.map(() => "");
  let groupCount = 0;
  let compared = 0;

  for (let first = 0; first < words.length; first++) {
    if (groups[first] !== "") {
      continue;
    }
    groupCount++;
    groups[first] = groupCount;

    for (let second = first + 1; second < words.length; second++) {
      if (groups[second] !== "") {
        continue;
      }
      const firstSorted = [...words[first]].sort().join("");
      const secondSorted = [...words[second]].sort().join("");
      let verdict = "不一樣，不同組";
      if (firstSorted === secondSorted) {
        groups[second] = groupCount;
        verdict = `一樣，是字母異位詞，放進第 ${groupCount} 組`;
      }
      compared++;

      frames.push({
        rows: [row("陣列", words, { pointers: { 甲: first, 乙: second } }), row("組別", groups)],
        message: `把 ${words[first]} 和 ${words[second]} 的字母各自排序再比較：${firstSorted} 和 ${secondSorted} ${verdict}。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", words), row("組別", groups)],
    message: `每個字串都分好了，一共 ${groupCount} 組，組別相同的互為字母異位詞。字串要兩兩拿來比，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function groupAnagramsCount(words: string[]) {
  const frames: Frame[] = [];
  const groups: Cell[] = words.map(() => "");
  const groupOf = new Map<string, number>();
  let looked = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const counts = new Array<number>(26).fill(0);
    for (const letter of word) {
      counts[alphabet.indexOf(letter)]++;
    }

    let key = "";
    for (let code = 0; code < 26; code++) {
      if (counts[code] > 0) {
        key += alphabet[code] + counts[code];
      }
    }

    let group = groupOf.get(key);
    let note = "雜湊表裡已經有這個鍵，直接放進同一組";
    if (group === undefined) {
      group = groupOf.size + 1;
      groupOf.set(key, group);
      note = "雜湊表裡還沒有這個鍵，開新的一組";
    }
    groups[i] = group;
    looked++;

    frames.push({
      rows: [
        row("陣列", words, { pointers: { 目前: i } }),
        row("組別", groups),
        row("雜湊表", tableCells(groupOf), { indexed: false }),
      ],
      message: `數 ${word} 裡每個字母出現幾次，把這組次數當成鍵：${key}。${note}，是第 ${group} 組。`,
    });
  }

  frames.push({
    rows: [row("陣列", words), row("組別", groups), row("雜湊表", tableCells(groupOf), { indexed: false })],
    message: `每個字串都分好了，一共 ${groupOf.size} 組。每個字串只數一次字母、查一次雜湊表，一共只查了 ${looked} 次。`,
  });
  return frames;
}

function runPositions(cells: number[], first: number, length: number) {
  const positions: number[] = [];
  for (let value = first; value < first + length; value++) {
    positions.push(cells.indexOf(value));
  }
  return positions;
}

export function longestRunScan(numbers: number[]) {
  const frames: Frame[] = [];
  let longest = 0;
  let bestStart = 0;
  let compared = 0;

  for (let start = 0; start < numbers.length; start++) {
    let length = 1;
    let wanted = numbers[start] + 1;
    let position = numbers.indexOf(wanted);

    while (position !== -1) {
      compared += position + 1;
      length++;
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 起點: start, 目前: position } })],
        message: `從 ${numbers[start]} 開始往上數：把陣列從頭看一遍找 ${wanted}，在位置 ${position} 找到，長度變成 ${length}。`,
      });
      wanted++;
      position = numbers.indexOf(wanted);
    }

    compared += numbers.length;
    if (length > longest) {
      longest = length;
      bestStart = numbers[start];
    }
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 起點: start } })],
      message: `從 ${numbers[start]} 開始往上數：把陣列從頭看到尾都沒有 ${wanted}，這一段長度是 ${length}，目前最長是 ${longest}。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers, { answer: runPositions(numbers, bestStart, longest) })],
    message: `最長的連續序列是 ${bestStart} 到 ${bestStart + longest - 1}，長度是 ${longest}。每找一個數都要把陣列看一遍，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function longestRunSet(numbers: number[]) {
  const frames: Frame[] = [];
  const numSet = new Set(numbers);
  const cells = [...numSet];
  let longest = 0;
  let bestStart = 0;
  let looked = 0;

  frames.push({
    rows: [row("集合", cells, { indexed: false })],
    message: "先把陣列的數字全部放進集合，重複的只留一個。要知道某個數在不在集合裡，查一次就好，不用從頭找。",
  });

  for (let start = 0; start < cells.length; start++) {
    const num = cells[start];
    looked++;

    if (numSet.has(num - 1)) {
      frames.push({
        rows: [row("集合", cells, { indexed: false, pointers: { 目前: start } })],
        message: `看 ${num}：${num - 1} 在集合裡，所以 ${num} 不是一段連續序列的起點，跳過。`,
      });
      continue;
    }

    frames.push({
      rows: [row("集合", cells, { indexed: false, pointers: { 起點: start } })],
      message: `看 ${num}：${num - 1} 不在集合裡，所以 ${num} 是一段連續序列的起點，從它開始往上數。`,
    });

    let current = num;
    let length = 1;
    while (numSet.has(current + 1)) {
      current++;
      length++;
      looked++;
      frames.push({
        rows: [row("集合", cells, { indexed: false, pointers: { 起點: start, 目前: cells.indexOf(current) } })],
        message: `${current} 在集合裡，接得上，長度變成 ${length}。`,
      });
    }

    looked++;
    if (length > longest) {
      longest = length;
      bestStart = num;
    }
    frames.push({
      rows: [row("集合", cells, { indexed: false, pointers: { 起點: start } })],
      message: `${current + 1} 不在集合裡，這一段到這裡結束，長度是 ${length}，目前最長是 ${longest}。`,
    });
  }

  frames.push({
    rows: [row("集合", cells, { indexed: false, answer: runPositions(cells, bestStart, longest) })],
    message: `最長的連續序列是 ${bestStart} 到 ${bestStart + longest - 1}，長度是 ${longest}。只有起點才往上數，一共只查了集合 ${looked} 次。`,
  });
  return frames;
}

export function duplicatePairs(numbers: number[]) {
  const frames: Frame[] = [];
  let compared = 0;

  for (let first = 0; first < numbers.length; first++) {
    for (let second = first + 1; second < numbers.length; second++) {
      const cells = row("陣列", numbers, { pointers: { 甲: first, 乙: second }, rangeStart: first });
      compared++;

      if (numbers[first] === numbers[second]) {
        frames.push({
          rows: [{ ...cells, answer: [first, second] }],
          message: `${numbers[first]} 和 ${numbers[second]} 一樣，有重複，答案是 true。一共比較了 ${compared} 次。`,
        });
        return frames;
      }

      frames.push({
        rows: [cells],
        message: `每個數都和它後面的數一個一個比：${numbers[first]} 和 ${numbers[second]} 不一樣，換下一組。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 })],
    message: `每一組都比過了，沒有重複，答案是 false。一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function duplicateSet(numbers: number[]) {
  const frames: Frame[] = [];
  const seen = new Set<number>();
  let looked = 0;

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    looked++;

    if (seen.has(num)) {
      const same = [...seen].indexOf(num);
      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 目前: i }, answer: [i] }),
          row("集合", [...seen], { indexed: false, answer: [same] }),
        ],
        message: `看到 ${num}，集合裡已經有 ${num}，有重複，答案是 true。一共只查了 ${looked} 次。`,
      });
      return frames;
    }

    seen.add(num);
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 目前: i } }), row("集合", [...seen], { indexed: false })],
      message: `用集合記住看過的數。看到 ${num}，集合裡還沒有 ${num}，把它放進集合。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 }), row("集合", [...seen], { indexed: false })],
    message: `全部看完了，沒有重複，答案是 false。一共只查了 ${looked} 次。`,
  });
  return frames;
}

export function anagramCrossOut(first: string, second: string) {
  const frames: Frame[] = [];
  const rest = [...second];
  let compared = 0;

  for (let i = 0; i < first.length; i++) {
    const letter = first[i];
    const letters = row("字串一", [...first], { pointers: { 甲: i }, rangeStart: i });
    let found = -1;

    for (let j = 0; j < rest.length; j++) {
      compared++;
      if (rest[j] === letter) {
        found = j;
        break;
      }
      frames.push({
        rows: [letters, row("字串二剩下的字母", rest, { indexed: false, pointers: { 乙: j } })],
        message: `在字串二剩下的字母裡，從頭找字串一的 ${letter}：${rest[j]} 不是，看下一個。`,
      });
    }

    if (found === -1) {
      frames.push({
        rows: [letters, row("字串二剩下的字母", rest, { indexed: false })],
        message: `字串二剩下的字母裡沒有 ${letter}，不是字母異位詞，答案是 false。一共比較了 ${compared} 次。`,
      });
      return frames;
    }

    frames.push({
      rows: [letters, row("字串二剩下的字母", rest, { indexed: false, pointers: { 乙: found } })],
      message: `在字串二剩下的字母裡，從頭找字串一的 ${letter}：找到了，把它劃掉，換字串一的下一個字母。`,
    });
    rest.splice(found, 1);
  }

  let verdict = "字串二也剛好用完，是字母異位詞，答案是 true";
  if (rest.length > 0) {
    verdict = "但字串二還有剩，不是字母異位詞，答案是 false";
  }
  frames.push({
    rows: [row("字串一", [...first], { rangeEnd: -1 }), row("字串二剩下的字母", rest, { indexed: false })],
    message: `字串一的每個字母都找到了，${verdict}。每個字母都要從頭找，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function countCells(letters: string[], count: number[]) {
  const cells: string[] = [];
  for (const letter of letters) {
    cells.push(`${letter}→${count[alphabet.indexOf(letter)]}`);
  }
  return cells;
}

export function anagramCount(first: string, second: string) {
  const frames: Frame[] = [];
  const letters = [...new Set(first + second)];
  const count = new Array<number>(26).fill(0);
  let updated = 0;

  for (let i = 0; i < first.length; i++) {
    count[alphabet.indexOf(first[i])]++;
    updated++;
    frames.push({
      rows: [
        row("字串一", [...first], { pointers: { 目前: i } }),
        row("字串二", [...second]),
        row("計數", countCells(letters, count), { indexed: false }),
      ],
      message: `字串一的 ${first[i]}：它的計數加一。計數陣列固定 26 格，每個字母一格，這裡只畫出用到的字母。`,
    });
  }

  for (let i = 0; i < second.length; i++) {
    count[alphabet.indexOf(second[i])]--;
    updated++;
    frames.push({
      rows: [
        row("字串一", [...first]),
        row("字串二", [...second], { pointers: { 目前: i } }),
        row("計數", countCells(letters, count), { indexed: false }),
      ],
      message: `字串二的 ${second[i]}：它的計數減一。兩個字串的字母如果一樣多，最後會剛好全部抵銷成 0。`,
    });
  }

  let verdict = "全部是 0，是字母異位詞，答案是 true";
  for (const value of count) {
    if (value !== 0) {
      verdict = "有的不是 0，不是字母異位詞，答案是 false";
    }
  }
  frames.push({
    rows: [
      row("字串一", [...first]),
      row("字串二", [...second]),
      row("計數", countCells(letters, count), { indexed: false }),
    ],
    message: `檢查計數：${verdict}。兩個字串各走一遍，不用回頭找，一共只更新了 ${updated} 次計數。`,
  });
  return frames;
}

export function topKCountEach(numbers: number[], k: number) {
  const frames: Frame[] = [];
  const count = new Map<number, number>();
  let compared = 0;

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    if (count.has(num)) {
      continue;
    }

    let times = 0;
    for (let j = 0; j < numbers.length; j++) {
      let note = `不是 ${num}，次數還是 ${times}`;
      if (numbers[j] === num) {
        times++;
        note = `是 ${num}，次數變成 ${times}`;
      }
      compared++;
      count.set(num, times);
      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 甲: i, 乙: j } }),
          row("次數", tableCells(count), { indexed: false }),
        ],
        message: `數 ${num} 出現幾次，要把整個陣列從頭看到尾：位置 ${j} 的 ${numbers[j]} ${note}。`,
      });
    }
  }

  const ranked = [...count];
  ranked.sort((one, other) => other[1] - one[1]);
  const sorted = new Map(ranked);
  const result = [...sorted.keys()].slice(0, k);

  frames.push({
    rows: [row("陣列", numbers), row("次數", tableCells(sorted), { indexed: false, answer: allPositions(result) })],
    message: `把次數由大到小排序，取前 ${k} 個，答案是 ${result.join("、")}。光是數次數就比較了 ${compared} 次，之後還要再排序。`,
  });
  return frames;
}

export function topKBuckets(numbers: number[], k: number) {
  const frames: Frame[] = [];
  const count = new Map<number, number>();
  const buckets: number[][] = [];
  for (let size = 0; size <= numbers.length; size++) {
    buckets.push([]);
  }
  const bucketCells = buckets.map(() => "");
  let steps = 0;

  for (let i = 0; i < numbers.length; i++) {
    const num = numbers[i];
    const before = count.get(num) ?? 0;
    count.set(num, before + 1);
    steps++;
    frames.push({
      rows: [
        row("陣列", numbers, { pointers: { 目前: i } }),
        row("雜湊表", tableCells(count), { indexed: false }),
        row("桶子", bucketCells),
      ],
      message: `先用雜湊表數次數：看到 ${num}，它的次數加一，變成 ${before + 1}。`,
    });
  }

  const entries = [...count];
  for (let e = 0; e < entries.length; e++) {
    const [num, frequency] = entries[e];
    buckets[frequency].push(num);
    bucketCells[frequency] = buckets[frequency].join(",");
    steps++;
    frames.push({
      rows: [
        row("陣列", numbers),
        row("雜湊表", tableCells(count), { indexed: false, pointers: { 目前: e } }),
        row("桶子", bucketCells, { pointers: { 目前: frequency } }),
      ],
      message: `${num} 出現 ${frequency} 次，放進位置 ${frequency} 的桶子。桶子的位置就是出現次數，這樣就不用排序。`,
    });
  }

  const result: number[] = [];
  const picked: number[] = [];
  for (let frequency = numbers.length; frequency > 0; frequency--) {
    const bucket = buckets[frequency];
    steps++;

    if (bucket.length === 0) {
      frames.push({
        rows: [
          row("陣列", numbers),
          row("雜湊表", tableCells(count), { indexed: false }),
          row("桶子", bucketCells, { pointers: { 目前: frequency }, answer: [...picked] }),
        ],
        message: `從次數最多的桶子往下收集：位置 ${frequency} 的桶子是空的，看下一個。`,
      });
      continue;
    }

    result.push(...bucket);
    picked.push(frequency);
    const rows = [
      row("陣列", numbers),
      row("雜湊表", tableCells(count), { indexed: false }),
      row("桶子", bucketCells, { pointers: { 目前: frequency }, answer: [...picked] }),
    ];

    if (result.length === k) {
      frames.push({
        rows,
        message: `位置 ${frequency} 的桶子有 ${bucket.join("、")}，收進答案。收滿 ${k} 個了，答案是 ${result.join("、")}。不用排序，一共只做了 ${steps} 步。`,
      });
      return frames;
    }

    frames.push({
      rows,
      message: `位置 ${frequency} 的桶子有 ${bucket.join("、")}，收進答案。目前收了 ${result.length} 個，還不到 ${k} 個，繼續往下。`,
    });
  }
  return frames;
}
