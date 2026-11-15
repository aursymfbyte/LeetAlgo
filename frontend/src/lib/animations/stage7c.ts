import { Cell, Frame, ProblemAnimation, row } from "./types";

type Change = { id: number; value: number };
type CheckIn = { station: string; time: number };
type Trip = { route: string; spent: number };
type RouteTotal = { total: number; count: number };

function stackRow(label: string, cells: Cell[]) {
  if (cells.length === 0) {
    return row(label, cells, { indexed: false });
  }
  return row(label, cells, { indexed: false, pointers: { 頂: cells.length - 1 } });
}

function oneTo(count: number) {
  const numbers: number[] = [];
  for (let number = 1; number <= count; number++) {
    numbers.push(number);
  }
  return numbers;
}

function toTen(value: number) {
  return ((value - 1) % 10) + 1;
}

function rand10Discard(rolls: number[], count: number) {
  const frames: Frame[] = [];
  const results: number[] = [];
  let used = 0;

  frames.push({
    rows: [row("骰出的數", rolls, { indexed: false }), row("結果", results, { indexed: false })],
    message: `rand7 每次骰出 1 到 7。「骰出的數」是固定的一串（特地挑了常超過 40 的），兩個版本照順序取用，比較湊出 ${count} 個結果各要骰幾次。`,
  });

  while (results.length < count) {
    const first = rolls[used];
    const second = rolls[used + 1];
    const value = (first - 1) * 7 + second;
    const rollRow = row("骰出的數", rolls, { indexed: false, pointers: { 甲: used, 乙: used + 1 }, rangeStart: used });
    const formula = `骰出 ${first} 和 ${second}：(${first} - 1) × 7 + ${second} = ${value}，是 1 到 49 裡均勻的一個數。`;
    used += 2;

    if (value > 40) {
      frames.push({
        rows: [rollRow, row("結果", results, { indexed: false })],
        message: `${formula}只有 1 到 40 能平分成 10 種結果，超過 40 就整個丟掉，重骰兩次。`,
      });
      continue;
    }

    const result = toTen(value);
    results.push(result);
    frames.push({
      rows: [rollRow, row("結果", results, { indexed: false })],
      message: `${formula}沒超過 40，(${value} - 1) 除以 10 的餘數加 1，結果是 ${result}。`,
    });
  }

  frames.push({
    rows: [row("骰出的數", rolls, { indexed: false, rangeStart: used }), row("結果", results, { indexed: false })],
    message: `湊出 ${count} 個結果：${results.join("、")}。超過 40 就整個丟掉重骰，一共呼叫了 ${used} 次 rand7。`,
  });
  return frames;
}

function rand10Reuse(rolls: number[], count: number) {
  const frames: Frame[] = [];
  const results: number[] = [];
  let used = 0;

  frames.push({
    rows: [row("骰出的數", rolls, { indexed: false }), row("結果", results, { indexed: false })],
    message: "前兩次骰的算法一樣。差別在超過 40 時不整個丟掉：多出來的部分還是均勻的亂數，留著再配一次 rand7，就能少骰一次。",
  });

  while (results.length < count) {
    const first = rolls[used];
    const second = rolls[used + 1];
    const value49 = (first - 1) * 7 + second;
    const pairRow = row("骰出的數", rolls, { indexed: false, pointers: { 甲: used, 乙: used + 1 }, rangeStart: used });
    const formula49 = `骰出 ${first} 和 ${second}：(${first} - 1) × 7 + ${second} = ${value49}，`;
    used += 2;

    if (value49 <= 40) {
      const result = toTen(value49);
      results.push(result);
      frames.push({
        rows: [pairRow, row("結果", results, { indexed: false })],
        message: `${formula49}沒超過 40，(${value49} - 1) 除以 10 的餘數加 1，結果是 ${result}。`,
      });
      continue;
    }

    const rest9 = value49 - 40;
    frames.push({
      rows: [pairRow, row("結果", results, { indexed: false })],
      message: `${formula49}超過 40。但 ${value49} - 40 = ${rest9} 是 1 到 9 裡均勻的一個數，留著不丟。`,
    });

    const third = rolls[used];
    const value63 = (rest9 - 1) * 7 + third;
    const thirdRow = row("骰出的數", rolls, { indexed: false, pointers: { 丙: used }, rangeStart: used });
    const formula63 = `只再骰一次得到 ${third}：(${rest9} - 1) × 7 + ${third} = ${value63}，是 1 到 63 裡均勻的數。`;
    used++;

    if (value63 <= 60) {
      const result = toTen(value63);
      results.push(result);
      frames.push({
        rows: [thirdRow, row("結果", results, { indexed: false })],
        message: `${formula63}沒超過 60，(${value63} - 1) 除以 10 的餘數加 1，結果是 ${result}。`,
      });
      continue;
    }

    const rest3 = value63 - 60;
    frames.push({
      rows: [thirdRow, row("結果", results, { indexed: false })],
      message: `${formula63}超過 60，但 ${value63} - 60 = ${rest3} 是 1 到 3 裡均勻的數，一樣留著。`,
    });

    const fourth = rolls[used];
    const value21 = (rest3 - 1) * 7 + fourth;
    const fourthRow = row("骰出的數", rolls, { indexed: false, pointers: { 丁: used }, rangeStart: used });
    const formula21 = `再骰一次得到 ${fourth}：(${rest3} - 1) × 7 + ${fourth} = ${value21}，是 1 到 21 裡均勻的數。`;
    used++;

    if (value21 <= 20) {
      const result = toTen(value21);
      results.push(result);
      frames.push({
        rows: [fourthRow, row("結果", results, { indexed: false })],
        message: `${formula21}沒超過 20，(${value21} - 1) 除以 10 的餘數加 1，結果是 ${result}。`,
      });
      continue;
    }

    frames.push({
      rows: [fourthRow, row("結果", results, { indexed: false })],
      message: `${formula21}超過 20，剩下的不夠再利用，整輪重來。`,
    });
  }

  frames.push({
    rows: [row("骰出的數", rolls, { indexed: false, rangeStart: used }), row("結果", results, { indexed: false })],
    message: `湊出 ${count} 個結果：${results.join("、")}，和暴力解不同沒關係，兩邊都均勻。剩下的亂數不丟掉，一共只呼叫了 ${used} 次 rand7。`,
  });
  return frames;
}

function countMatches(first: string, second: string) {
  let matches = 0;
  for (let i = 0; i < 6; i++) {
    if (first[i] === second[i]) {
      matches++;
    }
  }
  return matches;
}

function groupSizes(word: string, candidates: string[]) {
  const sizes = [0, 0, 0, 0, 0, 0, 0];
  for (const other of candidates) {
    const matches = countMatches(word, other);
    sizes[matches]++;
  }
  return sizes;
}

function pickGuess(words: string[], candidates: string[]) {
  let bestWord = candidates[0];
  let bestWorst = candidates.length + 1;
  for (const word of candidates.concat(words)) {
    const sizes = groupSizes(word, candidates);
    const worst = Math.max(...sizes);
    if (worst < bestWorst) {
      bestWorst = worst;
      bestWord = word;
    }
  }
  return bestWord;
}

function guessInOrder(words: string[], secret: string) {
  const frames: Frame[] = [];
  const secretRow = row("秘密單字", [secret], { indexed: false });
  const replies: Cell[] = words.map(() => "？");
  let guessed = 0;

  frames.push({
    rows: [secretRow, row("單字", words, { indexed: false }), row("回傳", replies, { indexed: false })],
    message: "程式看不到「秘密單字」這一列，只能呼叫 guess 猜一個字，它會回傳有幾個位置的字母相同，6 就是猜中。暴力解照清單順序一個一個猜。",
  });

  for (let index = 0; index < words.length; index++) {
    const word = words[index];
    const matches = countMatches(word, secret);
    const wordRow = row("單字", words, { indexed: false, pointers: { 目前: index }, rangeStart: index });
    replies[index] = matches;
    guessed++;

    if (matches === 6) {
      frames.push({
        rows: [secretRow, { ...wordRow, answer: [index] }, row("回傳", replies, { indexed: false, answer: [index] })],
        message: `猜 ${word}，回傳 6，六個位置都相同，猜中了。照清單順序猜到第 ${guessed} 個字才中，一共呼叫了 ${guessed} 次 guess。`,
      });
      return frames;
    }

    frames.push({
      rows: [secretRow, wordRow, row("回傳", replies, { indexed: false })],
      message: `猜 ${word}（guess），回傳 ${matches}：有 ${matches} 個位置的字母和秘密單字相同。不是 6，這個提示沒拿來用，直接猜下一個字。`,
    });
  }

  return frames;
}

function guessMinimax(words: string[], secret: string) {
  const frames: Frame[] = [];
  const secretRow = row("秘密單字", [secret], { indexed: false });
  let candidates = [...words];
  let guessed = 0;

  frames.push({
    rows: [
      secretRow,
      row("單字", words, { indexed: false }),
      row("分組", ["？", "？", "？", "？", "？", "？", "？"]),
      row("候選字", candidates, { indexed: false }),
    ],
    message: "程式看不到秘密單字，只能呼叫 guess 問有幾個位置相同。「候選字」是還可能是答案的字。「分組」的位置是吻合數，格子是那一組有幾個候選字。",
  });

  while (candidates.length > 0) {
    const guess = pickGuess(words, candidates);
    const position = words.indexOf(guess);
    const sizes = groupSizes(guess, candidates);
    const worst = Math.max(...sizes);
    const wordRow = row("單字", words, { indexed: false, pointers: { 猜: position } });
    frames.push({
      rows: [secretRow, wordRow, row("分組", sizes), row("候選字", candidates, { indexed: false })],
      message: `每個字都試算：猜它的話，${candidates.length} 個候選字照吻合數分組，最大那組有幾個。${guess} 的最大一組只有 ${worst} 個，是最小的，就猜它。`,
    });

    const matches = countMatches(guess, secret);
    guessed++;

    if (matches === 6) {
      frames.push({
        rows: [
          secretRow,
          { ...wordRow, answer: [position] },
          row("分組", sizes, { answer: [matches] }),
          row("候選字", candidates, { indexed: false }),
        ],
        message: `猜 ${guess}（guess），回傳 6，猜中了。每次都挑最壞情況剩最少的字，再用回傳值篩掉候選字，一共只呼叫了 ${guessed} 次 guess。`,
      });
      return frames;
    }

    candidates = candidates.filter((word) => countMatches(word, guess) === matches);
    frames.push({
      rows: [secretRow, wordRow, row("分組", sizes, { answer: [matches] }), row("候選字", candidates, { indexed: false })],
      message: `猜 ${guess}（guess），回傳 ${matches}。秘密單字一定在吻合數是 ${matches} 的那一組，候選字只留這一組：${candidates.join("、")}。`,
    });
  }

  return frames;
}

function timeMapScan(ops: string[]) {
  const frames: Frame[] = [];
  const times: number[] = [];
  const values: string[] = [];
  const results: string[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("時間戳", times), row("值", values)],
    message: "所有操作都用同一個鍵 foo。「存 1:a」是在時間 1 存入 a，「查 11」是問時間 11 當下的值。時間戳和值兩個陣列的位置互相對應。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "存") {
      const [time, value] = text.split(":");
      times.push(Number(time));
      values.push(value);
      frames.push({
        rows: [opRow, row("時間戳", times), row("值", values)],
        message: `存 ${text}（set）：在時間 ${time} 把 foo 的值存成 ${value}，時間戳和值各自接在陣列尾端。`,
      });
      continue;
    }

    const target = Number(text);
    const before = looked;
    let found = -1;

    for (let i = 0; i < times.length; i++) {
      const rows = [opRow, row("時間戳", times, { pointers: { 目前: i }, rangeStart: i }), row("值", values, { rangeStart: i })];
      looked++;

      if (times[i] > target) {
        frames.push({
          rows,
          message: `查 ${target}（get）：從頭一筆一筆看。時間 ${times[i]} 超過 ${target} 了，後面只會更大，不用再看。`,
        });
        break;
      }

      found = i;
      frames.push({
        rows,
        message: `查 ${target}（get）：從頭一筆一筆看。時間 ${times[i]} 沒超過 ${target}，先記住這一筆，再看下一筆。`,
      });
    }

    const count = looked - before;
    if (found === -1) {
      results.push("空字串");
      frames.push({
        rows: [opRow, row("時間戳", times), row("值", values)],
        message: `查 ${target}（get）：沒有任何一筆的時間不超過 ${target}，回傳空字串。這次看了 ${count} 格。`,
      });
    } else {
      results.push(values[found]);
      frames.push({
        rows: [opRow, row("時間戳", times, { answer: [found] }), row("值", values, { answer: [found] })],
        message: `查 ${target}（get）：最後記住的是時間 ${times[found]} 那一筆，回傳它的值 ${values[found]}。這次看了 ${count} 格。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("時間戳", times), row("值", values)],
    message: `${results.length} 次查詢依序回傳 ${results.join("、")}。每次都從頭一筆一筆看，一共看了 ${looked} 格。`,
  });
  return frames;
}

function timeMapBinary(ops: string[]) {
  const frames: Frame[] = [];
  const times: number[] = [];
  const values: string[] = [];
  const results: string[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("時間戳", times), row("值", values)],
    message: "雜湊表替每個鍵各存時間戳和值兩個陣列，這裡只用到鍵 foo，所以只畫一組。題目保證時間戳越存越大，陣列本來就排好序，查詢可以二分。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "存") {
      const [time, value] = text.split(":");
      times.push(Number(time));
      values.push(value);
      frames.push({
        rows: [opRow, row("時間戳", times), row("值", values)],
        message: `存 ${text}（set）：在時間 ${time} 把 foo 的值存成 ${value}，時間戳和值各自接在陣列尾端。`,
      });
      continue;
    }

    const target = Number(text);
    let left = 0;
    let right = times.length;

    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const rows = [
        opRow,
        row("時間戳", times, { pointers: { 中: mid }, rangeStart: left, rangeEnd: right - 1 }),
        row("值", values, { rangeStart: left, rangeEnd: right - 1 }),
      ];
      looked++;

      if (times[mid] <= target) {
        frames.push({
          rows,
          message: `查 ${target}（get）：二分找第一個超過 ${target} 的位置。中間的 ${times[mid]} 沒超過，要找的在它右邊，左邊界移到位置 ${mid + 1}。`,
        });
        left = mid + 1;
      } else {
        frames.push({
          rows,
          message: `查 ${target}（get）：二分找第一個超過 ${target} 的位置。中間的 ${times[mid]} 超過了，要找的在它這裡或左邊，右邊界移到位置 ${mid}。`,
        });
        right = mid;
      }
    }

    if (left === 0) {
      results.push("空字串");
      frames.push({
        rows: [opRow, row("時間戳", times), row("值", values)],
        message: `查 ${target}（get）：左右邊界在位置 0 碰面，連第一筆都超過 ${target}，前面沒有資料，回傳空字串。`,
      });
    } else {
      const value = values[left - 1];
      results.push(value);
      frames.push({
        rows: [opRow, row("時間戳", times, { answer: [left - 1] }), row("值", values, { answer: [left - 1] })],
        message: `查 ${target}（get）：左右邊界在位置 ${left} 碰面，它前面的時間都沒超過 ${target}。前一格是時間 ${times[left - 1]}，回傳它的值 ${value}。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("時間戳", times), row("值", values)],
    message: `${results.length} 次查詢依序回傳 ${results.join("、")}。每次都用二分搜尋，一次砍掉一半，一共只看了 ${looked} 格。`,
  });
  return frames;
}

function mountainScan(heights: number[], target: number) {
  const frames: Frame[] = [];
  const known: Cell[] = heights.map(() => "？");
  let calls = 0;

  for (let index = 0; index < heights.length; index++) {
    const value = heights[index];
    known[index] = value;
    calls++;
    const knownRow = row("問到的值", known, { pointers: { 目前: index }, rangeStart: index });

    if (value === target) {
      frames.push({
        rows: [row("山脈陣列", heights, { answer: [index] }), { ...knownRow, answer: [index] }],
        message: `get(${index}) 回傳 ${value}，等於 ${target}，找到了，位置是 ${index}。從頭問到這裡，一共呼叫了 ${calls} 次 get；題目最多只准 100 次，陣列一長就不夠。`,
      });
      return frames;
    }

    frames.push({
      rows: [row("山脈陣列", heights), knownRow],
      message: `程式看不到「山脈陣列」，只能呼叫 get 問。要找 ${target} 的最小位置，從頭一格一格問：get(${index}) 回傳 ${value}，不是，問下一格。`,
    });
  }

  frames.push({
    rows: [row("山脈陣列", heights), row("問到的值", known, { rangeEnd: -1 })],
    message: `每一格都問過了，${target} 不在陣列中，回傳 -1。一共呼叫了 ${calls} 次 get。`,
  });
  return frames;
}

function mountainSearch(
  frames: Frame[],
  heights: number[],
  known: Cell[],
  target: number,
  left: number,
  right: number,
  ascending: boolean,
) {
  let calls = 0;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const value = heights[mid];
    known[mid] = value;
    calls++;
    const rows = [
      row("山脈陣列", heights),
      row("問到的值", known, { pointers: { 左: left, 右: right, 中: mid }, rangeStart: left, rangeEnd: right }),
    ];

    if (value === target) {
      return { index: mid, calls };
    }

    if (ascending) {
      if (value < target) {
        frames.push({
          rows,
          message: `上坡段越往右越大：get(${mid}) 回傳 ${value}，比 ${target} 小，${target} 只可能在右邊，左邊界移到位置 ${mid + 1}。`,
        });
        left = mid + 1;
      } else {
        frames.push({
          rows,
          message: `上坡段越往右越大：get(${mid}) 回傳 ${value}，比 ${target} 大，${target} 只可能在左邊，右邊界移到位置 ${mid - 1}。`,
        });
        right = mid - 1;
      }
    } else {
      if (value > target) {
        frames.push({
          rows,
          message: `下坡段越往右越小：get(${mid}) 回傳 ${value}，比 ${target} 大，${target} 只可能在右邊，左邊界移到位置 ${mid + 1}。`,
        });
        left = mid + 1;
      } else {
        frames.push({
          rows,
          message: `下坡段越往右越小：get(${mid}) 回傳 ${value}，比 ${target} 小，${target} 只可能在左邊，右邊界移到位置 ${mid - 1}。`,
        });
        right = mid - 1;
      }
    }
  }

  return { index: -1, calls };
}

function mountainBinary(heights: number[], target: number) {
  const frames: Frame[] = [];
  const known: Cell[] = heights.map(() => "？");
  const last = heights.length - 1;
  let left = 0;
  let right = last;
  let calls = 0;

  frames.push({
    rows: [row("山脈陣列", heights), row("問到的值", known, { pointers: { 左: left, 右: right } })],
    message: `程式看不到「山脈陣列」，只能呼叫 get 問，問到的記在下面。要找 ${target} 的最小位置。先二分找山頂：每次問中間和它右邊一格。`,
  });

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const value = heights[mid];
    const next = heights[mid + 1];
    known[mid] = value;
    known[mid + 1] = next;
    calls += 2;
    const rows = [
      row("山脈陣列", heights),
      row("問到的值", known, { pointers: { 左: left, 右: right, 中: mid }, rangeStart: left, rangeEnd: right }),
    ];

    if (value < next) {
      frames.push({
        rows,
        message: `找山頂：get(${mid}) 是 ${value}，get(${mid + 1}) 是 ${next}，還在上坡，山頂在右邊，左邊界移到位置 ${mid + 1}。問了 2 次。`,
      });
      left = mid + 1;
    } else {
      frames.push({
        rows,
        message: `找山頂：get(${mid}) 是 ${value}，get(${mid + 1}) 是 ${next}，已經下坡，山頂在這裡或左邊，右邊界移到位置 ${mid}。問了 2 次。`,
      });
      right = mid;
    }
  }

  const peak = left;
  frames.push({
    rows: [row("山脈陣列", heights), row("問到的值", known, { pointers: { 山頂: peak }, rangeEnd: peak })],
    message: `左右邊界在位置 ${peak} 碰面，這裡就是山頂。先在山頂左邊的上坡段（位置 0 到 ${peak}）二分找 ${target}，這一段找到的位置一定最小。`,
  });

  const up = mountainSearch(frames, heights, known, target, 0, peak, true);
  calls += up.calls;
  let index = up.index;

  if (index === -1) {
    frames.push({
      rows: [row("山脈陣列", heights), row("問到的值", known, { pointers: { 山頂: peak }, rangeStart: peak + 1 })],
      message: `上坡段沒有 ${target}。再到山頂右邊的下坡段（位置 ${peak + 1} 到 ${last}）找，這一段越往右越小，二分的方向要反過來。`,
    });
    const down = mountainSearch(frames, heights, known, target, peak + 1, last, false);
    calls += down.calls;
    index = down.index;
  }

  if (index === -1) {
    frames.push({
      rows: [row("山脈陣列", heights), row("問到的值", known, { rangeEnd: -1 })],
      message: `下坡段也沒有 ${target}，回傳 -1。三次二分一共呼叫了 ${calls} 次 get。`,
    });
    return frames;
  }

  frames.push({
    rows: [row("山脈陣列", heights, { answer: [index] }), row("問到的值", known, { answer: [index] })],
    message: `get(${index}) 回傳 ${target}，找到了。三次二分一共呼叫了 ${calls} 次 get。陣列短看不出差距；長度一萬時從頭問最多一萬次，二分最多約 56 次。`,
  });
  return frames;
}

function copyRows(copies: number[][]) {
  return copies.map((copy, id) => row(`快照 ${id}`, copy));
}

function snapshotCopy(length: number, ops: string[]) {
  const frames: Frame[] = [];
  const current = new Array<number>(length).fill(0);
  const copies: number[][] = [];
  const results: number[] = [];
  let taken = 0;
  let stored = 0;

  for (const op of ops) {
    if (op === "快照") {
      copies.push([]);
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("陣列", current), ...copyRows(copies)],
    message: `陣列長度 ${length}，一開始都是 0。「設 1,5」是把位置 1 改成 5，「查 1,2」是問快照 2 裡位置 1 的值。下面幾列放每次快照複製的那一份。`,
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "設") {
      const [index, value] = text.split(",").map(Number);
      current[index] = value;
      frames.push({
        rows: [opRow, row("陣列", current, { pointers: { 目前: index } }), ...copyRows(copies)],
        message: `設 ${text}（set）：把陣列位置 ${index} 改成 ${value}。`,
      });
    } else if (name === "快照") {
      copies[taken] = [...current];
      stored += length;
      frames.push({
        rows: [opRow, row("陣列", current), ...copyRows(copies)],
        message: `快照（snap）：把整個陣列 ${length} 格複製一份存成快照 ${taken}，回傳編號 ${taken}。不管改了幾格都整份複製，累計多存了 ${stored} 格。`,
      });
      taken++;
    } else {
      const [index, id] = text.split(",").map(Number);
      const value = copies[id][index];
      const rows = copyRows(copies);
      rows[id].answer = [index];
      results.push(value);
      frames.push({
        rows: [opRow, row("陣列", current), ...rows],
        message: `查 ${text}（get）：直接看快照 ${id} 那一份的位置 ${index}，回傳 ${value}。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("陣列", current), ...copyRows(copies)],
    message: `${results.length} 次查詢依序回傳 ${results.join("、")}。每次快照都整份複製，${taken} 次快照一共多存了 ${stored} 格。`,
  });
  return frames;
}

function historyRows(history: Change[][]) {
  return history.map((records, index) => {
    const cells = records.map((record) => `${record.id}→${record.value}`);
    return row(`第 ${index} 格`, cells);
  });
}

function snapshotHistory(length: number, ops: string[]) {
  const frames: Frame[] = [];
  const history: Change[][] = [];
  const results: number[] = [];
  let snapId = 0;
  let stored = 0;
  let compared = 0;

  for (let index = 0; index < length; index++) {
    history.push([]);
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), ...historyRows(history)],
    message: "不複製陣列，改成每一格各記一串修改紀錄。格子「編號→值」的意思是：從這個快照編號開始，這一格的值是多少。目前的編號從 0 開始。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "設") {
      const [index, value] = text.split(",").map(Number);
      const records = history[index];
      const lastIndex = records.length - 1;

      if (records.length > 0 && records[lastIndex].id === snapId) {
        records[lastIndex].value = value;
        frames.push({
          rows: [opRow, ...historyRows(history)],
          message: `設 ${text}（set）：第 ${index} 格最後一筆的編號就是目前的 ${snapId}，同一次快照之內只留最新的值，直接改成 ${snapId}→${value}。`,
        });
      } else {
        records.push({ id: snapId, value });
        stored++;
        frames.push({
          rows: [opRow, ...historyRows(history)],
          message: `設 ${text}（set）：在第 ${index} 格的紀錄尾端加一筆 ${snapId}→${value}，目前的編號是 ${snapId}。累計多存了 ${stored} 格。`,
        });
      }
    } else if (name === "快照") {
      snapId++;
      frames.push({
        rows: [opRow, ...historyRows(history)],
        message: `快照（snap）：什麼都不複製，只把目前的編號從 ${snapId - 1} 加到 ${snapId}，回傳 ${snapId - 1}。`,
      });
    } else {
      const [index, id] = text.split(",").map(Number);
      const records = history[index];
      let left = 0;
      let right = records.length;

      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        const midId = records[mid].id;
        const rows = historyRows(history);
        rows[index].pointers = { 中: mid };
        rows[index].rangeStart = left;
        rows[index].rangeEnd = right - 1;
        compared++;

        if (midId <= id) {
          frames.push({
            rows: [opRow, ...rows],
            message: `查 ${text}（get）：在第 ${index} 格的紀錄裡二分。中間那筆的編號 ${midId} 沒超過 ${id}，再往右看有沒有更晚的，左邊界移到位置 ${mid + 1}。`,
          });
          left = mid + 1;
        } else {
          frames.push({
            rows: [opRow, ...rows],
            message: `查 ${text}（get）：在第 ${index} 格的紀錄裡二分。中間那筆的編號 ${midId} 超過 ${id}，是那次快照之後才改的，右邊界移到位置 ${mid}。`,
          });
          right = mid;
        }
      }

      const rows = historyRows(history);
      if (left === 0) {
        results.push(0);
        frames.push({
          rows: [opRow, ...rows],
          message: `查 ${text}（get）：第 ${index} 格沒有編號不超過 ${id} 的紀錄，代表拍快照 ${id} 時這一格還沒改過，回傳 0。`,
        });
      } else {
        const value = records[left - 1].value;
        rows[index].answer = [left - 1];
        results.push(value);
        frames.push({
          rows: [opRow, ...rows],
          message: `查 ${text}（get）：左右邊界在位置 ${left} 碰面，前一格是編號不超過 ${id} 的最後一筆，拍快照 ${id} 時的值就是它，回傳 ${value}。`,
        });
      }
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), ...historyRows(history)],
    message: `${results.length} 次查詢依序回傳 ${results.join("、")}。只在有改動時記一筆，一共只多存了 ${stored} 格；代價是查詢要二分，比較了 ${compared} 次。`,
  });
  return frames;
}

function hiddenFormula(x: number, y: number) {
  return x * y;
}

function solutionsAllPairs(limit: number, z: number) {
  const frames: Frame[] = [];
  const formulaRow = row("公式", ["x × y"], { indexed: false });
  const numbers = oneTo(limit);
  const answers: string[] = [];
  let calls = 0;

  frames.push({
    rows: [
      formulaRow,
      row("x", numbers, { indexed: false }),
      row("y", numbers, { indexed: false }),
      row("答案", answers, { indexed: false }),
    ],
    message: `程式看不到「公式」這一列，只能呼叫 f(x, y) 問結果。要找 f(x, y) = ${z} 的所有解。為了示範把範圍縮小成 1 到 ${limit}，題目原本是 1 到 1000。`,
  });

  for (let x = 1; x <= limit; x++) {
    for (let y = 1; y <= limit; y++) {
      const value = hiddenFormula(x, y);
      calls++;

      let result = `不是 ${z}，試下一組。`;
      if (value === z) {
        answers.push(`${x},${y}`);
        result = `等於 ${z}，把 ${x},${y} 記進答案。`;
      }

      frames.push({
        rows: [
          formulaRow,
          row("x", numbers, { indexed: false, pointers: { 目前: x - 1 } }),
          row("y", numbers, { indexed: false, pointers: { 目前: y - 1 } }),
          row("答案", answers, { indexed: false }),
        ],
        message: `每一組 x、y 都問一次：f(${x}, ${y}) 回傳 ${value}，${result}`,
      });
    }
  }

  frames.push({
    rows: [
      formulaRow,
      row("x", numbers, { indexed: false }),
      row("y", numbers, { indexed: false }),
      row("答案", answers, { indexed: false, answer: answers.map((answer, index) => index) }),
    ],
    message: `找到 ${answers.length} 組解：${answers.join("、")}。${limit} × ${limit} 組全部問過，一共呼叫了 ${calls} 次 f。範圍是 1 到 1000 的話要問一百萬次。`,
  });
  return frames;
}

function solutionsTwoPointers(limit: number, z: number) {
  const frames: Frame[] = [];
  const formulaRow = row("公式", ["x × y"], { indexed: false });
  const numbers = oneTo(limit);
  const answers: string[] = [];
  let x = 1;
  let y = limit;
  let calls = 0;

  frames.push({
    rows: [
      formulaRow,
      row("x", numbers, { indexed: false, pointers: { 目前: x - 1 } }),
      row("y", numbers, { indexed: false, pointers: { 目前: y - 1 } }),
      row("答案", answers, { indexed: false }),
    ],
    message: `程式看不到公式，只知道 x、y 越大結果越大。x 從最小的 1、y 從最大的 ${limit} 開始（範圍同樣縮小），每問一次就能排除一個 x 或一個 y。`,
  });

  while (x <= limit && y >= 1) {
    const value = hiddenFormula(x, y);
    const xRow = row("x", numbers, { indexed: false, pointers: { 目前: x - 1 }, rangeStart: x - 1 });
    const yRow = row("y", numbers, { indexed: false, pointers: { 目前: y - 1 }, rangeEnd: y - 1 });
    calls++;

    if (value < z) {
      frames.push({
        rows: [formulaRow, xRow, yRow, row("答案", answers, { indexed: false })],
        message: `f(${x}, ${y}) 回傳 ${value}，比 ${z} 小。y = ${y} 已經是剩下最大的，x = ${x} 配誰都不夠大，x 加一。`,
      });
      x++;
    } else if (value > z) {
      frames.push({
        rows: [formulaRow, xRow, yRow, row("答案", answers, { indexed: false })],
        message: `f(${x}, ${y}) 回傳 ${value}，比 ${z} 大。x = ${x} 已經是剩下最小的，y = ${y} 配誰都太大，y 減一。`,
      });
      y--;
    } else {
      answers.push(`${x},${y}`);
      frames.push({
        rows: [formulaRow, xRow, yRow, row("答案", answers, { indexed: false })],
        message: `f(${x}, ${y}) 回傳 ${value}，等於 ${z}，把 ${x},${y} 記進答案。同一個 x 只會配到一個 y，所以 x 加一、y 減一。`,
      });
      x++;
      y--;
    }
  }

  frames.push({
    rows: [
      formulaRow,
      row("x", numbers, { indexed: false }),
      row("y", numbers, { indexed: false }),
      row("答案", answers, { indexed: false, answer: answers.map((answer, index) => index) }),
    ],
    message: `找到 ${answers.length} 組解：${answers.join("、")}。兩個指針相向移動，一共只呼叫了 ${calls} 次 f。範圍是 1 到 1000 時最多也只要 2000 次。`,
  });
  return frames;
}

function riderCells(checkIns: Record<string, CheckIn>) {
  const cells: string[] = [];
  for (const id of Object.keys(checkIns)) {
    const rider = checkIns[id];
    cells.push(`${id}→${rider.station},${rider.time}`);
  }
  return cells;
}

function tripCells(trips: Trip[]) {
  return trips.map((trip) => `${trip.route}:${trip.spent}`);
}

function routeCells(routes: Record<string, RouteTotal>) {
  const cells: string[] = [];
  for (const route of Object.keys(routes)) {
    const sum = routes[route];
    cells.push(`${route}→${sum.total}/${sum.count}`);
  }
  return cells;
}

function subwayTripList(ops: string[]) {
  const frames: Frame[] = [];
  const checkIns: Record<string, CheckIn> = {};
  const trips: Trip[] = [];
  const results: number[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("車上", [], { indexed: false }), row("行程", [], { indexed: false })],
    message: "「進 1,A」是乘客 1 從 A 站進站，「平均 A,B」是問 A 到 B 平均花多久，第幾個操作就當作時間幾。「車上」記還沒出站的人，「行程」記每一趟。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    const time = step + 1;

    if (name === "進") {
      const [id, station] = text.split(",");
      checkIns[id] = { station, time };
      frames.push({
        rows: [opRow, row("車上", riderCells(checkIns), { indexed: false }), row("行程", tripCells(trips), { indexed: false })],
        message: `進 ${text}（checkIn）：乘客 ${id} 在時間 ${time} 從 ${station} 站進站，記進「車上」。`,
      });
    } else if (name === "出") {
      const [id, station] = text.split(",");
      const entry = checkIns[id];
      const spent = time - entry.time;
      const route = entry.station + station;
      delete checkIns[id];
      trips.push({ route, spent });
      frames.push({
        rows: [opRow, row("車上", riderCells(checkIns), { indexed: false }), row("行程", tripCells(trips), { indexed: false })],
        message: `出 ${text}（checkOut）：現在是時間 ${time}，乘客 ${id} 是時間 ${entry.time} 從 ${entry.station} 站進來的，花了 ${time} - ${entry.time} = ${spent}。把這一趟 ${route}:${spent} 接在行程後面。`,
      });
    } else {
      const [start, end] = text.split(",");
      const route = start + end;
      let total = 0;
      let count = 0;

      for (let i = 0; i < trips.length; i++) {
        const trip = trips[i];
        looked++;

        let result = `不是 ${route}，跳過。`;
        if (trip.route === route) {
          total += trip.spent;
          count++;
          result = `是 ${route}，總時間加到 ${total}，趟數加到 ${count}。`;
        }

        frames.push({
          rows: [
            opRow,
            row("車上", riderCells(checkIns), { indexed: false }),
            row("行程", tripCells(trips), { indexed: false, pointers: { 目前: i }, rangeStart: i }),
          ],
          message: `平均 ${text}（getAverageTime）：把所有行程從頭翻一遍。這一筆 ${trip.route}:${trip.spent} ${result}`,
        });
      }

      const average = total / count;
      results.push(average);
      frames.push({
        rows: [opRow, row("車上", riderCells(checkIns), { indexed: false }), row("行程", tripCells(trips), { indexed: false })],
        message: `平均 ${text}（getAverageTime）：${trips.length} 筆都看完了，${start} 到 ${end} 的平均是 ${total} ÷ ${count} = ${average}，回傳 ${average}。`,
      });
    }
  }

  frames.push({
    rows: [
      row("操作", ops, { indexed: false }),
      row("車上", riderCells(checkIns), { indexed: false }),
      row("行程", tripCells(trips), { indexed: false }),
    ],
    message: `${results.length} 次查平均依序回傳 ${results.join("、")}。每次都把所有行程翻一遍，一共看了 ${looked} 格。`,
  });
  return frames;
}

function subwayRouteTotals(ops: string[]) {
  const frames: Frame[] = [];
  const checkIns: Record<string, CheckIn> = {};
  const routes: Record<string, RouteTotal> = {};
  const results: number[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("車上", [], { indexed: false }), row("路線", [], { indexed: false })],
    message: "第幾個操作就當作時間幾，「車上」一樣記還沒出站的人。差別是不存每一趟，改用雜湊表「路線」，每條路線只記「總時間/趟數」，例如 AB→8/2。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    const time = step + 1;

    if (name === "進") {
      const [id, station] = text.split(",");
      checkIns[id] = { station, time };
      frames.push({
        rows: [opRow, row("車上", riderCells(checkIns), { indexed: false }), row("路線", routeCells(routes), { indexed: false })],
        message: `進 ${text}（checkIn）：乘客 ${id} 在時間 ${time} 從 ${station} 站進站，記進「車上」。`,
      });
    } else if (name === "出") {
      const [id, station] = text.split(",");
      const entry = checkIns[id];
      const spent = time - entry.time;
      const route = entry.station + station;
      delete checkIns[id];
      if (routes[route] === undefined) {
        routes[route] = { total: 0, count: 0 };
      }
      routes[route].total += spent;
      routes[route].count++;
      frames.push({
        rows: [opRow, row("車上", riderCells(checkIns), { indexed: false }), row("路線", routeCells(routes), { indexed: false })],
        message: `出 ${text}（checkOut）：現在是時間 ${time}，乘客 ${id} 花了 ${time} - ${entry.time} = ${spent}。不存這一趟，只把路線 ${route} 的總時間加 ${spent}、趟數加 1。`,
      });
    } else {
      const [start, end] = text.split(",");
      const route = start + end;
      const sum = routes[route];
      const average = sum.total / sum.count;
      const position = Object.keys(routes).indexOf(route);
      results.push(average);
      looked++;
      frames.push({
        rows: [
          opRow,
          row("車上", riderCells(checkIns), { indexed: false }),
          row("路線", routeCells(routes), { indexed: false, answer: [position] }),
        ],
        message: `平均 ${text}（getAverageTime）：直接查路線 ${route} 那一格，總時間 ${sum.total} ÷ 趟數 ${sum.count} = ${average}，回傳 ${average}。`,
      });
    }
  }

  frames.push({
    rows: [
      row("操作", ops, { indexed: false }),
      row("車上", riderCells(checkIns), { indexed: false }),
      row("路線", routeCells(routes), { indexed: false }),
    ],
    message: `${results.length} 次查平均依序回傳 ${results.join("、")}。總時間和趟數出站時就加好了，查詢只看路線那一格，一共只看了 ${looked} 格。`,
  });
  return frames;
}

function browserStepByStep(homepage: string, ops: string[]) {
  const frames: Frame[] = [];
  const history = [homepage];
  const results: string[] = [];
  let current = 0;
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("紀錄", history, { pointers: { 目前: current } })],
    message: `一開始停在首頁 ${homepage}。「去 a」是前往網頁 a，「退 3」是往回走 3 步，「進 2」是往前走 2 步。「紀錄」依序放瀏覽過的網頁。`,
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "去") {
      const removed = history.length - 1 - current;
      while (history.length > current + 1) {
        history.pop();
        moved++;
      }
      history.push(text);
      current++;

      let message = `去 ${text}（visit）：把 ${text} 接在紀錄後面，並走到這一頁。`;
      if (removed > 0) {
        message = `去 ${text}（visit）：先把目前頁面後面的 ${removed} 頁一格一格刪掉，再把 ${text} 接在後面並走過去。刪了 ${removed} 次。`;
      }
      frames.push({
        rows: [opRow, row("紀錄", history, { pointers: { 目前: current } })],
        message,
      });
      continue;
    }

    let steps = Number(text);
    let walked = 0;

    if (name === "退") {
      while (steps > 0 && current > 0) {
        current--;
        steps--;
        walked++;
        moved++;
        frames.push({
          rows: [opRow, row("紀錄", history, { pointers: { 目前: current } })],
          message: `退 ${text}（back）：一步一步往回走，第 ${walked} 步走到 ${history[current]}。`,
        });
      }
    } else {
      while (steps > 0 && current < history.length - 1) {
        current++;
        steps--;
        walked++;
        moved++;
        frames.push({
          rows: [opRow, row("紀錄", history, { pointers: { 目前: current } })],
          message: `進 ${text}（forward）：一步一步往前走，第 ${walked} 步走到 ${history[current]}。`,
        });
      }
    }

    let note = "";
    if (steps > 0) {
      note = `已經到底了，剩下的 ${steps} 步不走。`;
    }
    const page = history[current];
    results.push(page);
    frames.push({
      rows: [opRow, row("紀錄", history, { pointers: { 目前: current }, answer: [current] })],
      message: `${name} ${text}：走了 ${walked} 步。${note}停在 ${page}，回傳 ${page}。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("紀錄", history, { pointers: { 目前: current } })],
    message: `回傳值依序是 ${results.join("、")}。往回往前都一步一步走，前往新網頁還要一格一格刪，一共動了 ${moved} 次。`,
  });
  return frames;
}

function browserJump(homepage: string, ops: string[]) {
  const frames: Frame[] = [];
  const history = [homepage];
  const results: string[] = [];
  let current = 0;
  let last = 0;
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("紀錄", history, { pointers: { 目前: current, 最後: last } })],
    message: `一開始停在首頁 ${homepage}。除了「目前」的位置，再多記一個「最後」：還能往前走到的最後一頁。超過「最後」的舊紀錄會變灰，留著但走不到。`,
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "去") {
      current++;
      let message = `去 ${text}（visit）：把 ${text} 寫在目前的下一格，「目前」和「最後」都移到這裡。`;
      if (current === history.length) {
        history.push(text);
      } else {
        message = `去 ${text}（visit）：把 ${text} 寫在目前的下一格，蓋掉舊的 ${history[current]}，「最後」也移到這裡。後面的舊紀錄不用刪，反正走不到。`;
        history[current] = text;
      }
      last = current;
      frames.push({
        rows: [opRow, row("紀錄", history, { pointers: { 目前: current, 最後: last }, rangeEnd: last })],
        message,
      });
      continue;
    }

    const steps = Number(text);
    let message = "";

    if (name === "退") {
      const wanted = current - steps;
      let note = "";
      if (wanted < 0) {
        note = "不能小於 0，取 0，";
      }
      message = `退 ${text}（back）：不用一步一步走，直接算 ${current} - ${steps} = ${wanted}，${note}`;
      current = Math.max(0, wanted);
    } else {
      const wanted = current + steps;
      let note = "";
      if (wanted > last) {
        note = `不能超過「最後」的 ${last}，取 ${last}，`;
      }
      message = `進 ${text}（forward）：不用一步一步走，直接算 ${current} + ${steps} = ${wanted}，${note}`;
      current = Math.min(last, wanted);
    }

    const page = history[current];
    results.push(page);
    moved++;
    frames.push({
      rows: [opRow, row("紀錄", history, { pointers: { 目前: current, 最後: last }, rangeEnd: last, answer: [current] })],
      message: `${message}跳到位置 ${current} 的 ${page}，回傳 ${page}。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("紀錄", history, { pointers: { 目前: current, 最後: last }, rangeEnd: last })],
    message: `回傳值依序是 ${results.join("、")}。每次都直接算出位置跳過去，舊紀錄也不用刪，一共只動了 ${moved} 次。`,
  });
  return frames;
}

function textRow(text: string[], cursor: number) {
  const cells = [...text];
  cells.splice(cursor, 0, "|");
  return row("文字", cells, { indexed: false, pointers: { 游標: cursor } });
}

function beforeCursor(letters: string[]) {
  const shown = letters.slice(-10).join("");
  if (shown === "") {
    return "空字串";
  }
  return shown;
}

function editorOneArray(ops: string[]) {
  const frames: Frame[] = [];
  const text: string[] = [];
  const results: string[] = [];
  let cursor = 0;
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), textRow(text, cursor)],
    message: "所有字元放在同一個陣列，「|」是游標。「打 xy」是在游標處打字，「刪 1」是刪掉游標左邊 1 個字，「左 4」「右 2」是移動游標。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, word] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    const right = text.length - cursor;

    if (name === "打") {
      const letters = [...word];
      text.splice(cursor, 0, ...letters);
      cursor += letters.length;
      moved += right;

      let message = `打 ${word}（addText）：游標在最後面，直接把 ${word} 接上去，不用搬任何字元。`;
      if (right > 0) {
        message = `打 ${word}（addText）：游標右邊的 ${right} 個字元要先往後挪出空位，才能把 ${word} 放進去。搬了 ${right} 個字元。`;
      }
      frames.push({ rows: [opRow, textRow(text, cursor)], message });
      continue;
    }

    const k = Number(word);

    if (name === "刪") {
      const deleted = Math.min(k, cursor);
      text.splice(cursor - deleted, deleted);
      cursor -= deleted;
      moved += right;
      results.push(String(deleted));
      frames.push({
        rows: [opRow, textRow(text, cursor)],
        message: `刪 ${k}（deleteText）：游標左邊最多刪 ${k} 個，實際刪掉 ${deleted} 個，回傳 ${deleted}。右邊的 ${right} 個字元要往前挪補上空位，搬了 ${right} 個字元。`,
      });
    } else if (name === "左") {
      cursor = Math.max(0, cursor - k);
      const shown = beforeCursor(text.slice(0, cursor));
      results.push(shown);
      frames.push({
        rows: [opRow, textRow(text, cursor)],
        message: `左 ${k}（cursorLeft）：只是把游標的位置改成 ${cursor}，不用搬字元。回傳游標左邊的字（最多 10 個）：${shown}。`,
      });
    } else {
      cursor = Math.min(text.length, cursor + k);
      const shown = beforeCursor(text.slice(0, cursor));
      results.push(shown);
      frames.push({
        rows: [opRow, textRow(text, cursor)],
        message: `右 ${k}（cursorRight）：只是把游標的位置改成 ${cursor}，不用搬字元。回傳游標左邊的字（最多 10 個）：${shown}。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), textRow(text, cursor)],
    message: `回傳值依序是 ${results.join("、")}。每次在中間打字或刪除，游標右邊的字元都要整排挪動，一共搬了 ${moved} 個字元。`,
  });
  return frames;
}

function editorTwoStacks(ops: string[]) {
  const frames: Frame[] = [];
  const left: string[] = [];
  const right: string[] = [];
  const results: string[] = [];
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), stackRow("左堆疊", left), stackRow("右堆疊", right)],
    message: "以游標為界分成兩個堆疊：左堆疊放游標左邊的字，右堆疊倒著放游標右邊的字，所以兩邊的頂端都緊貼著游標。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, word] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "打") {
      const letters = [...word];
      left.push(...letters);
      frames.push({
        rows: [opRow, stackRow("左堆疊", left), stackRow("右堆疊", right)],
        message: `打 ${word}（addText）：把 ${word} 一個一個推進左堆疊，頂端就是游標的位置。右堆疊完全不用動。`,
      });
      continue;
    }

    let k = Number(word);

    if (name === "刪") {
      const deleted = Math.min(k, left.length);
      for (let i = 0; i < deleted; i++) {
        left.pop();
      }
      results.push(String(deleted));
      frames.push({
        rows: [opRow, stackRow("左堆疊", left), stackRow("右堆疊", right)],
        message: `刪 ${k}（deleteText）：從左堆疊頂端最多彈出 ${k} 個，實際彈出 ${deleted} 個，回傳 ${deleted}。右堆疊完全不用動。`,
      });
    } else if (name === "左") {
      let carried = 0;
      while (k > 0 && left.length > 0) {
        right.push(left.pop() as string);
        k--;
        carried++;
      }
      moved += carried;
      const shown = beforeCursor(left);
      results.push(shown);
      frames.push({
        rows: [opRow, stackRow("左堆疊", left), stackRow("右堆疊", right)],
        message: `左 ${word}（cursorLeft）：把左堆疊頂端的字元一個一個搬到右堆疊，最多 ${word} 個，實際搬了 ${carried} 個。回傳左堆疊頂端最多 10 個字：${shown}。`,
      });
    } else {
      let carried = 0;
      while (k > 0 && right.length > 0) {
        left.push(right.pop() as string);
        k--;
        carried++;
      }
      moved += carried;
      const shown = beforeCursor(left);
      results.push(shown);
      frames.push({
        rows: [opRow, stackRow("左堆疊", left), stackRow("右堆疊", right)],
        message: `右 ${word}（cursorRight）：把右堆疊頂端的字元一個一個搬回左堆疊，最多 ${word} 個，實際搬了 ${carried} 個。回傳左堆疊頂端最多 10 個字：${shown}。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), stackRow("左堆疊", left), stackRow("右堆疊", right)],
    message: `回傳值依序是 ${results.join("、")}。打字和刪除只動左堆疊的頂端，只有移動游標才要搬，一共只搬了 ${moved} 個字元。`,
  });
  return frames;
}

const rand7Rolls = [7, 7, 5, 3, 6, 6, 7, 2, 4, 1, 3, 5];
const guessWords = ["garden", "golden", "gentle", "kettle", "settle", "little", "middle", "paddle"];
const timeMapOps = ["存 1:a", "存 3:b", "存 5:c", "存 8:d", "存 10:e", "存 12:f", "查 11", "查 0", "查 20"];
const mountainHeights = [1, 2, 4, 6, 9, 12, 15, 18, 20, 13, 7, 3];
const snapshotOps = ["設 1,5", "快照", "設 1,6", "設 1,8", "快照", "設 0,3", "快照", "設 1,9", "查 1,2", "查 3,1"];
const subwayOps = ["進 1,A", "進 2,A", "進 3,B", "出 3,C", "出 1,B", "出 2,B", "平均 A,B", "進 4,A", "出 4,B", "平均 A,B"];
const browserOps = ["去 a", "去 b", "去 c", "去 d", "退 3", "進 2", "退 5", "去 e", "進 2", "退 1"];
const editorOps = ["打 abcdef", "左 4", "打 xy", "刪 1", "打 z", "右 2", "刪 9", "左 3"];

export const stage7c: ProblemAnimation[] = [
  {
    problemId: 470,
    brute: rand10Discard(rand7Rolls, 3),
    efficient: rand10Reuse(rand7Rolls, 3),
  },
  {
    problemId: 843,
    brute: guessInOrder(guessWords, "paddle"),
    efficient: guessMinimax(guessWords, "paddle"),
  },
  {
    problemId: 981,
    brute: timeMapScan(timeMapOps),
    efficient: timeMapBinary(timeMapOps),
  },
  {
    problemId: 1095,
    brute: mountainScan(mountainHeights, 3),
    efficient: mountainBinary(mountainHeights, 3),
  },
  {
    problemId: 1146,
    brute: snapshotCopy(4, snapshotOps),
    efficient: snapshotHistory(4, snapshotOps),
  },
  {
    problemId: 1237,
    brute: solutionsAllPairs(4, 4),
    efficient: solutionsTwoPointers(4, 4),
  },
  {
    problemId: 1396,
    brute: subwayTripList(subwayOps),
    efficient: subwayRouteTotals(subwayOps),
  },
  {
    problemId: 1472,
    brute: browserStepByStep("home", browserOps),
    efficient: browserJump("home", browserOps),
  },
  {
    problemId: 2296,
    brute: editorOneArray(editorOps),
    efficient: editorTwoStacks(editorOps),
  },
];
