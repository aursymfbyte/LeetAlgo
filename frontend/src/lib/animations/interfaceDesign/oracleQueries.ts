import { Cell, Frame, row } from "../types";

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

export function rand10Discard(rolls: number[], count: number) {
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

export function rand10Reuse(rolls: number[], count: number) {
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

export function guessInOrder(words: string[], secret: string) {
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

export function guessMinimax(words: string[], secret: string) {
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

export function mountainScan(heights: number[], target: number) {
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

export function mountainBinary(heights: number[], target: number) {
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

function hiddenFormula(x: number, y: number) {
  return x * y;
}

export function solutionsAllPairs(limit: number, z: number) {
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

export function solutionsTwoPointers(limit: number, z: number) {
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
