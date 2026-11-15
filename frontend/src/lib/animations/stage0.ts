import { Cell, Frame, ProblemAnimation, row } from "./types";

const alphabet = "abcdefghijklmnopqrstuvwxyz";

function tableCells(table: Map<Cell, number>) {
  const cells: string[] = [];
  for (const [key, value] of table) {
    cells.push(`${key}→${value}`);
  }
  return cells;
}

function allPositions(cells: Cell[]) {
  return cells.map((cell, index) => index);
}

function twoSumBrute(numbers: number[], target: number) {
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

function twoSumHashMap(numbers: number[], target: number) {
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

function groupAnagramsPairs(words: string[]) {
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

function groupAnagramsCount(words: string[]) {
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

function longestRunScan(numbers: number[]) {
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

function longestRunSet(numbers: number[]) {
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

function duplicatePairs(numbers: number[]) {
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

function duplicateSet(numbers: number[]) {
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

function productBrute(numbers: number[]) {
  const frames: Frame[] = [];
  const answer: Cell[] = numbers.map(() => "");
  let multiplied = 0;

  for (let i = 0; i < numbers.length; i++) {
    let product = 1;
    for (let other = 0; other < numbers.length; other++) {
      if (other === i) {
        continue;
      }
      product *= numbers[other];
      multiplied++;
      answer[i] = product;
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 目前: other } }), row("答案", answer, { pointers: { 目前: i } })],
        message: `算位置 ${i} 的答案：跳過自己，把其他的數一個一個乘起來。乘上 ${numbers[other]}，目前是 ${product}。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers), row("答案", answer, { answer: allPositions(answer) })],
    message: `答案是 ${answer.join("、")}。每個位置都把其他的數重新乘一遍，一共做了 ${multiplied} 次乘法。`,
  });
  return frames;
}

function productTwoPasses(numbers: number[]) {
  const frames: Frame[] = [];
  const answer = numbers.map(() => 1);
  const shown: Cell[] = numbers.map(() => "");
  let multiplied = 0;

  let left = 1;
  for (let i = 0; i < numbers.length; i++) {
    answer[i] = left;
    left *= numbers[i];
    multiplied++;
    shown[i] = answer[i];
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 目前: i } }), row("答案", shown, { pointers: { 目前: i } })],
      message: `第一趟由左往右：位置 ${i} 左邊所有數的乘積是 ${answer[i]}，先寫進答案。再把 ${numbers[i]} 乘進左邊乘積，變成 ${left}。`,
    });
  }

  let right = 1;
  for (let i = numbers.length - 1; i >= 0; i--) {
    const rightSide = right;
    answer[i] *= right;
    right *= numbers[i];
    multiplied += 2;
    shown[i] = answer[i];
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 目前: i } }), row("答案", shown, { pointers: { 目前: i } })],
      message: `第二趟由右往左：位置 ${i} 右邊所有數的乘積是 ${rightSide}，乘進答案變成 ${answer[i]}。再把 ${numbers[i]} 乘進右邊乘積，變成 ${right}。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers), row("答案", shown, { answer: allPositions(shown) })],
    message: `答案是 ${answer.join("、")}。左邊和右邊的乘積都是邊走邊累乘，陣列只走兩趟，一共只做了 ${multiplied} 次乘法。`,
  });
  return frames;
}

function anagramCrossOut(first: string, second: string) {
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

function anagramCount(first: string, second: string) {
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

function moveZeroesSwap(numbers: number[]) {
  const frames: Frame[] = [];
  const cells = [...numbers];
  let compared = 0;
  let written = 0;

  for (let pass = 0; pass < cells.length - 1; pass++) {
    const last = cells.length - 1 - pass;
    for (let left = 0; left < last; left++) {
      const right = left + 1;
      compared++;

      if (cells[left] === 0 && cells[right] !== 0) {
        cells[left] = cells[right];
        cells[right] = 0;
        written += 2;
        frames.push({
          rows: [row("陣列", cells, { pointers: { 左: left, 右: right }, rangeEnd: last })],
          message: `相鄰兩格比較：原本左邊是 0、右邊是 ${cells[left]}，兩格交換，讓 0 往後退一格。`,
        });
      } else {
        frames.push({
          rows: [row("陣列", cells, { pointers: { 左: left, 右: right }, rangeEnd: last })],
          message: `相鄰兩格比較：只有左邊是 0、右邊不是 0 才交換。${cells[left]} 和 ${cells[right]} 不用換，看下一組。`,
        });
      }
    }
  }

  frames.push({
    rows: [row("陣列", cells, { answer: allPositions(cells) })],
    message: `0 都換到最後了，結果是 ${cells.join("、")}。一共比較了 ${compared} 次，交換時寫入了 ${written} 次。`,
  });
  return frames;
}

function moveZeroesWrite(numbers: number[]) {
  const frames: Frame[] = [];
  const cells = [...numbers];
  let write = 0;
  let written = 0;

  for (let read = 0; read < cells.length; read++) {
    const num = cells[read];
    if (num === 0) {
      frames.push({
        rows: [row("陣列", cells, { pointers: { 快: read, 慢: write } })],
        message: `快指針看到 0，跳過。慢指針留在位置 ${write}，等下一個不是 0 的數。`,
      });
      continue;
    }

    cells[write] = num;
    written++;
    frames.push({
      rows: [row("陣列", cells, { pointers: { 快: read, 慢: write } })],
      message: `快指針看到 ${num}，不是 0，寫到慢指針的位置 ${write}，慢指針再往右一格。`,
    });
    write++;
  }

  for (let i = write; i < cells.length; i++) {
    cells[i] = 0;
    written++;
    frames.push({
      rows: [row("陣列", cells, { pointers: { 目前: i } })],
      message: `不是 0 的數都照原本的順序搬到前面了，剩下的位置補 0：把位置 ${i} 寫成 0。`,
    });
  }

  frames.push({
    rows: [row("陣列", cells, { answer: allPositions(cells) })],
    message: `結果是 ${cells.join("、")}。陣列只走一遍，每一格最多寫一次，一共只寫入了 ${written} 次。`,
  });
  return frames;
}

function rangeSumAddAgain(numbers: number[], queries: number[][]) {
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

function rangeSumPrefix(numbers: number[], queries: number[][]) {
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

function topKCountEach(numbers: number[], k: number) {
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

function topKBuckets(numbers: number[], k: number) {
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

function subarraySumBrute(numbers: number[], k: number) {
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

function subarraySumPrefix(numbers: number[], k: number) {
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

function pivotAddAgain(numbers: number[]) {
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

function pivotTotal(numbers: number[]) {
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

function mergeRows(first: string, second: string, index: number, source: number, letters: string[]) {
  const answer = [...letters];
  while (answer.length < first.length + second.length) {
    answer.push("");
  }

  const rows = [
    row("字串一", [...first], { rangeStart: index }),
    row("字串二", [...second], { rangeStart: index }),
    row("答案", answer, { indexed: false }),
  ];
  rows[source].pointers = { 目前: index };
  return rows;
}

function mergedFrame(first: string, second: string, merged: string, summary: string) {
  const letters = [...merged];
  return {
    rows: [
      row("字串一", [...first], { rangeEnd: -1 }),
      row("字串二", [...second], { rangeEnd: -1 }),
      row("答案", letters, { indexed: false, answer: allPositions(letters) }),
    ],
    message: `兩個字串都取完了，答案是 ${merged}。${summary}`,
  };
}

function mergeByConcat(first: string, second: string) {
  const frames: Frame[] = [];
  const words = [first, second];
  const names = ["字串一", "字串二"];
  let result = "";
  let written = 0;
  let i = 0;

  while (i < first.length || i < second.length) {
    for (let source = 0; source < words.length; source++) {
      if (i >= words[source].length) {
        continue;
      }
      const letter = words[source][i];
      let copy = "";

      for (const old of result) {
        copy += old;
        written++;
        frames.push({
          rows: mergeRows(first, second, i, source, [...copy]),
          message: `要接上${names[source]}的 ${letter}，但字串不能直接加長，得建一個新字串：先把舊的 ${old} 抄過去。`,
        });
      }

      copy += letter;
      written++;
      result = copy;
      frames.push({
        rows: mergeRows(first, second, i, source, [...result]),
        message: `把${names[source]}的 ${letter} 放到新字串的最後，答案變成 ${result}。`,
      });
    }
    i++;
  }

  frames.push(mergedFrame(first, second, result, `每接一個字元就把舊的全部重抄，一共寫了 ${written} 個字元。`));
  return frames;
}

function mergeByAppend(first: string, second: string) {
  const frames: Frame[] = [];
  const result: string[] = [];
  let written = 0;
  let i = 0;

  while (i < first.length || i < second.length) {
    if (i < first.length) {
      result.push(first[i]);
      written++;
      frames.push({
        rows: mergeRows(first, second, i, 0, result),
        message: `第 ${i + 1} 輪：字串一還沒用完，把它的 ${first[i]} 附加到答案尾端，前面的字元不用動。`,
      });
    }
    if (i < second.length) {
      result.push(second[i]);
      written++;
      frames.push({
        rows: mergeRows(first, second, i, 1, result),
        message: `第 ${i + 1} 輪：字串二還沒用完，把它的 ${second[i]} 附加到答案尾端，前面的字元不用動。`,
      });
    }
    i++;
  }

  const merged = result.join("");
  written += result.length;
  frames.push(mergedFrame(first, second, merged, `每個字元只附加一次，最後再一次接成字串，連這次在內一共只寫了 ${written} 個字元。`));
  return frames;
}

const sumNumbers = [11, 15, 2, 6, 4, 7];
const anagramWords = ["bat", "tan", "eat", "nat", "tea", "ate"];
const runNumbers = [100, 4, 200, 1, 3, 2];
const duplicateNumbers = [2, 7, 5, 1, 8, 3, 5];
const productNumbers = [2, 3, 4, 5, 6];
const zeroNumbers = [0, 1, 0, 3, 12];
const rangeNumbers = [-2, 0, 3, -5, 2, -1];
const rangeQueries = [
  [0, 2],
  [2, 5],
  [0, 5],
];
const frequentNumbers = [1, 1, 1, 2, 2, 3];
const subarrayNumbers = [1, 2, 1, -1, 3];
const pivotNumbers = [1, 7, 3, 6, 5, 6];

export const stage0: ProblemAnimation[] = [
  {
    problemId: 1,
    brute: twoSumBrute(sumNumbers, 9),
    efficient: twoSumHashMap(sumNumbers, 9),
  },
  {
    problemId: 49,
    brute: groupAnagramsPairs(anagramWords),
    efficient: groupAnagramsCount(anagramWords),
  },
  {
    problemId: 128,
    brute: longestRunScan(runNumbers),
    efficient: longestRunSet(runNumbers),
  },
  {
    problemId: 217,
    brute: duplicatePairs(duplicateNumbers),
    efficient: duplicateSet(duplicateNumbers),
  },
  {
    problemId: 238,
    brute: productBrute(productNumbers),
    efficient: productTwoPasses(productNumbers),
  },
  {
    problemId: 242,
    brute: anagramCrossOut("diaper", "repaid"),
    efficient: anagramCount("diaper", "repaid"),
  },
  {
    problemId: 283,
    brute: moveZeroesSwap(zeroNumbers),
    efficient: moveZeroesWrite(zeroNumbers),
  },
  {
    problemId: 303,
    brute: rangeSumAddAgain(rangeNumbers, rangeQueries),
    efficient: rangeSumPrefix(rangeNumbers, rangeQueries),
  },
  {
    problemId: 347,
    brute: topKCountEach(frequentNumbers, 2),
    efficient: topKBuckets(frequentNumbers, 2),
  },
  {
    problemId: 560,
    brute: subarraySumBrute(subarrayNumbers, 3),
    efficient: subarraySumPrefix(subarrayNumbers, 3),
  },
  {
    problemId: 724,
    brute: pivotAddAgain(pivotNumbers),
    efficient: pivotTotal(pivotNumbers),
  },
  {
    problemId: 1768,
    brute: mergeByConcat("abcd", "pq"),
    efficient: mergeByAppend("abcd", "pq"),
  },
];
