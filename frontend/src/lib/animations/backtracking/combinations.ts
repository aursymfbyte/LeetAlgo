import { Cell, Frame, row } from "../types";
import { orEmpty, positions } from "./rows";

export function combinationSumBrute(candidates: number[], target: number) {
  const frames: Frame[] = [];
  const path: number[] = [];
  const answers: string[] = [];
  let picked = 0;

  frames.push({
    rows: [row("候選", candidates), row("路徑", path, { indexed: false }), row("答案", answers, { indexed: false })],
    message: `要湊出 ${target}，同一個數可以重複選；下一個數只能選自己或右邊的數，才不會重複。暴力解不管大小先選再說，選完才看總和。`,
  });

  function pick(start: number, sum: number) {
    for (let index = start; index < candidates.length; index++) {
      const number = candidates[index];
      const total = sum + number;
      path.push(number);
      picked++;

      let result = `總和是 ${total}，還不到 ${target}，繼續往下選。`;
      if (total === target) {
        answers.push(path.join(","));
        result = `總和剛好是 ${target}，把 ${path.join(",")} 記進答案。`;
      }
      if (total > target) {
        result = `總和變成 ${total}，超過 ${target} 了，選完才發現走不通，退回去。`;
      }
      frames.push({
        rows: [
          row("候選", candidates, { pointers: { 目前: index }, rangeStart: start }),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `選 ${number}，${result}`,
      });

      if (total < target) {
        pick(index, total);
      }
      path.pop();
    }
  }

  pick(0, 0);
  frames.push({
    rows: [
      row("候選", candidates),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `總和是 ${target} 的組合有 ${answers.length} 組。不管會不會超過都先選再說，一共選了 ${picked} 次數。`,
  });
  return frames;
}

export function combinationSumPruned(candidates: number[], target: number) {
  const frames: Frame[] = [];
  const sorted = [...candidates];
  sorted.sort((a, b) => a - b);
  const path: number[] = [];
  const answers: string[] = [];
  let picked = 0;

  frames.push({
    rows: [row("候選", sorted), row("路徑", path, { indexed: false }), row("答案", answers, { indexed: false })],
    message: `要湊出 ${target}。先把候選數由小到大排序，並記住還要湊多少。選之前先比大小，比剩下的還大就不選，後面更大的也不用試。`,
  });

  function pick(start: number, remaining: number) {
    if (remaining === 0) {
      const last = path[path.length - 1];
      answers.push(path.join(","));
      frames.push({
        rows: [
          row("候選", sorted, { pointers: { 目前: start }, rangeStart: start }),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `選 ${last}，剛好湊滿 ${target}，把 ${path.join(",")} 記進答案。`,
      });
      return;
    }

    for (let index = start; index < sorted.length; index++) {
      const number = sorted[index];
      if (number > remaining) {
        frames.push({
          rows: [
            row("候選", sorted, { pointers: { 目前: index }, rangeStart: start }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `還要湊 ${remaining}，但 ${number} 比它大。候選排過序，後面的數只會更大，不用再試，退回去。`,
        });
        break;
      }

      path.push(number);
      picked++;
      const left = remaining - number;
      if (left > 0) {
        frames.push({
          rows: [
            row("候選", sorted, { pointers: { 目前: index }, rangeStart: start }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `還要湊 ${remaining}，${number} 沒有比它大，選 ${number}，還剩 ${left} 要湊。`,
        });
      }
      pick(index, left);
      path.pop();
    }
  }

  pick(0, target);
  frames.push({
    rows: [
      row("候選", sorted),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `總和是 ${target} 的組合有 ${answers.length} 組。太大的數在選之前就擋掉，一共只選了 ${picked} 次數。`,
  });
  return frames;
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

export function permuteBrute(numbers: number[]) {
  const frames: Frame[] = [];
  const size = numbers.length;
  const path: Cell[] = numbers.map(() => "");
  const answers: string[] = [];
  let filled = 0;
  let listed = 0;

  function fill(position: number) {
    if (position === size) {
      const text = path.join("、");
      const kinds = new Set(path).size;
      listed++;

      let result = "裡面有重複的數，不是排列，丟掉。";
      if (kinds === size) {
        answers.push(path.join(","));
        result = `${size} 個數都不一樣，記進答案。`;
      }
      frames.push({
        rows: [row("陣列", numbers), row("路徑", path), row("答案", answers, { indexed: false })],
        message: `每個位置都可以放任何一個數，列出第 ${listed} 種：${text}，${result}`,
      });
      return;
    }

    for (const number of numbers) {
      path[position] = number;
      filled++;
      fill(position + 1);
    }
  }

  fill(0);
  frames.push({
    rows: [
      row("陣列", numbers),
      row("路徑", path, { rangeEnd: -1 }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `排列有 ${answers.length} 種。每個位置都把 ${size} 個數試一遍，一共填了 ${filled} 次數，列出 ${listed} 種才挑出來。`,
  });
  return frames;
}

export function permuteBacktrack(numbers: number[]) {
  const frames: Frame[] = [];
  const size = numbers.length;
  const path: Cell[] = numbers.map(() => "");
  const used = numbers.map(() => false);
  const answers: string[] = [];
  let filled = 0;

  function fill(position: number, action: string) {
    if (position === size) {
      answers.push(path.join(","));
      frames.push({
        rows: [
          row("陣列", numbers),
          row("用過", yesNo(used)),
          row("路徑", path),
          row("答案", answers, { indexed: false }),
        ],
        message: `${action}${size} 個位置都放滿了，把 ${path.join(",")} 記進答案。`,
      });
      return;
    }

    frames.push({
      rows: [
        row("陣列", numbers),
        row("用過", yesNo(used)),
        row("路徑", path, { pointers: { 目前: position }, rangeEnd: position - 1 }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${action}接著從還沒用過的數裡，挑一個放進路徑的位置 ${position}。`,
    });

    for (let index = 0; index < size; index++) {
      if (!used[index]) {
        used[index] = true;
        path[position] = numbers[index];
        filled++;
        fill(position + 1, `位置 ${position} 放 ${numbers[index]}，把它標成用過。`);
        used[index] = false;
      }
    }
  }

  fill(0, "用過的數不能再選，退回來時再把標記改回「否」。灰色的格子還沒輪到，舊內容會被蓋掉。");
  frames.push({
    rows: [
      row("陣列", numbers),
      row("用過", yesNo(used)),
      row("路徑", path, { rangeEnd: -1 }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `排列有 ${answers.length} 種。用過的數不再選，排出來的一定沒有重複，一共只填了 ${filled} 次數。`,
  });
  return frames;
}

export function combineBrute(top: number, size: number) {
  const frames: Frame[] = [];
  const numbers = positions(1, top);
  const path: number[] = [];
  const answers: string[] = [];
  let decided = 0;
  let listed = 0;

  function choose(number: number) {
    if (number > top) {
      const text = orEmpty(path.join(","));
      listed++;

      let result = `有 ${path.length} 個數，不是 ${size} 個，丟掉。`;
      if (path.length === size) {
        answers.push(text);
        result = `剛好有 ${size} 個數，記進答案。`;
      }
      frames.push({
        rows: [
          row("數字", numbers, { indexed: false }),
          row("子集", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `每個數都決定選或不選，列出第 ${listed} 個子集 ${text}：${result}`,
      });
      return;
    }

    path.push(number);
    decided++;
    choose(number + 1);
    path.pop();
    decided++;
    choose(number + 1);
  }

  choose(1);
  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("子集", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `從 1 到 ${top} 選 ${size} 個，一共 ${answers.length} 種。${listed} 個子集全部列出來才挑，選或不選一共決定了 ${decided} 次。`,
  });
  return frames;
}

export function combineBacktrack(top: number, size: number) {
  const frames: Frame[] = [];
  const numbers = positions(1, top);
  const path: number[] = [];
  const answers: string[] = [];
  let decided = 0;

  function choose(start: number, action: string) {
    const need = size - path.length;
    if (need === 0) {
      const chosen = path[path.length - 1];
      answers.push(path.join(","));
      frames.push({
        rows: [
          row("數字", numbers, { pointers: { 目前: chosen - 1 }, indexed: false }),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `${action}湊滿 ${size} 個了，把 ${path.join(",")} 記進答案。`,
      });
      return;
    }

    const last = top - need + 1;
    frames.push({
      rows: [
        row("數字", numbers, { rangeStart: start - 1, rangeEnd: last - 1, indexed: false }),
        row("路徑", path, { indexed: false }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${action}還要選 ${need} 個，下一個數從 ${start} 開始，最多到 ${last}，再往後剩下的數就不夠了。`,
    });

    for (let number = start; number <= last; number++) {
      path.push(number);
      decided++;
      choose(number + 1, `選 ${number}。`);
      path.pop();
    }
  }

  choose(1, "只往後選，同一組數就只會出現一次。");
  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `從 1 到 ${top} 選 ${size} 個，一共 ${answers.length} 種。只走湊得滿的路，每一條都通到答案，選哪個數一共只決定了 ${decided} 次。`,
  });
  return frames;
}

export function subsetsByCopy(numbers: number[]) {
  const frames: Frame[] = [];
  const subsets: number[][] = [[]];
  let added = 0;

  function subsetCells() {
    return subsets.map((subset) => orEmpty(subset.join(",")));
  }

  frames.push({
    rows: [row("陣列", numbers), row("答案", subsetCells(), { indexed: false })],
    message: "答案裡先放一個空的子集。之後每看到一個數，就把答案裡現有的子集各複製一份，在複製品裡放進這個數。",
  });

  for (let index = 0; index < numbers.length; index++) {
    const number = numbers[index];
    const count = subsets.length;

    for (let source = 0; source < count; source++) {
      const copy = [...subsets[source], number];
      const before = orEmpty(subsets[source].join(","));
      subsets.push(copy);
      added++;
      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 目前: index } }),
          row("答案", subsetCells(), { pointers: { 來源: source, 新的: subsets.length - 1 }, indexed: false }),
        ],
        message: `輪到 ${number}：複製答案裡的 ${before}，再放進 ${number}，得到新的子集 ${copy.join(",")}。`,
      });
    }
  }

  frames.push({
    rows: [
      row("陣列", numbers),
      row("答案", subsetCells(), { indexed: false, answer: positions(0, subsets.length - 1) }),
    ],
    message: `一共 ${subsets.length} 個子集。每多一個數，子集的數量就變兩倍，一共放了 ${added} 次數。`,
  });
  return frames;
}

export function subsetsBacktrack(numbers: number[]) {
  const frames: Frame[] = [];
  const path: number[] = [];
  const answers: string[] = [];
  let added = 0;

  function choose(index: number, action: string) {
    if (index === numbers.length) {
      const text = orEmpty(path.join(","));
      answers.push(text);
      frames.push({
        rows: [
          row("陣列", numbers),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `${action}每個數都決定完了，把 ${text} 記進答案。`,
      });
      return;
    }

    const number = numbers[index];
    frames.push({
      rows: [
        row("陣列", numbers, { pointers: { 目前: index } }),
        row("路徑", path, { indexed: false }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${action}接著決定 ${number} 要不要選，先走不選的路。`,
    });

    choose(index + 1, `不選 ${number}。`);
    path.push(number);
    added++;
    choose(index + 1, `退回來，改成選 ${number}，放進路徑。`);
    path.pop();
  }

  choose(0, "每個數只有選或不選兩條路，一個一個決定，全部決定完就是一個子集。");
  frames.push({
    rows: [
      row("陣列", numbers),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `一共 ${answers.length} 個子集。一共放了 ${added} 次數，次數和一份一份複製的寫法一樣；子集本來就有這麼多個，省不了。`,
  });
  return frames;
}

export function sumThreeBrute(size: number, target: number) {
  const frames: Frame[] = [];
  const numbers = positions(1, 9);
  const path: number[] = [];
  const answers: string[] = [];
  let picked = 0;
  let tried = 0;

  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false }),
    ],
    message: `從 1 到 9 選 ${size} 個不同的數，總和要是 ${target}。暴力解不管數字大小，每一種選法都選滿 ${size} 個，最後才算總和。`,
  });

  function pickRest(start: number) {
    if (path.length === size) {
      let sum = 0;
      for (const number of path) {
        sum += number;
      }
      tried++;
      if (sum === target) {
        answers.push(path.join(","));
      }
      return;
    }
    for (let number = start; number <= 9; number++) {
      path.push(number);
      picked++;
      pickRest(number + 1);
      path.pop();
    }
  }

  for (let first = 1; first <= 9; first++) {
    const triedBefore = tried;
    const foundBefore = answers.length;
    path.push(first);
    picked++;
    pickRest(first + 1);

    const count = tried - triedBefore;
    const found = answers.length - foundBefore;
    let result = `後面沒有數可以選了，湊不滿 ${size} 個。`;
    if (count > 0) {
      result = `後面的數全部配一遍，${count} 種選法都選滿才算總和，沒有一種等於 ${target}。`;
    }
    if (found > 0) {
      result = `後面的數全部配一遍，${count} 種選法都選滿才算總和，等於 ${target} 的有 ${found} 種，記進答案。`;
    }
    frames.push({
      rows: [
        row("數字", numbers, { pointers: { 目前: first - 1 }, rangeStart: first - 1, indexed: false }),
        row("路徑", path, { indexed: false }),
        row("答案", answers, { indexed: false }),
      ],
      message: `第一個數選 ${first}：${result}`,
    });
    path.pop();
  }

  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `${size} 個數加起來是 ${target} 的組合有 ${answers.length} 組。${tried} 種選法全部選滿才算總和，一共選了 ${picked} 次數。`,
  });
  return frames;
}

export function sumThreeBacktrack(size: number, target: number) {
  const frames: Frame[] = [];
  const numbers = positions(1, 9);
  const path: number[] = [];
  const answers: string[] = [];
  let picked = 0;

  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false }),
    ],
    message: `從 1 到 9 選 ${size} 個不同的數，總和要是 ${target}。記住還要湊多少：比它大的數不選，後面更大的也不試；剩下的數不夠選也不走。`,
  });

  function pick(start: number, remaining: number) {
    const need = size - path.length;
    if (need === 0) {
      const chosen = path[path.length - 1];
      let result = `但還差 ${remaining} 才到 ${target}，不是答案，退回去。`;
      if (remaining === 0) {
        answers.push(path.join(","));
        result = `總和剛好是 ${target}，把 ${path.join(",")} 記進答案。`;
      }
      frames.push({
        rows: [
          row("數字", numbers, { pointers: { 目前: chosen - 1 }, rangeStart: chosen - 1, indexed: false }),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `選 ${chosen}，選滿 ${size} 個了，${result}`,
      });
      return;
    }

    const last = 9 - need + 1;
    for (let number = start; number <= last; number++) {
      if (number > remaining) {
        frames.push({
          rows: [
            row("數字", numbers, { pointers: { 目前: number - 1 }, rangeStart: start - 1, rangeEnd: last - 1, indexed: false }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `還要湊 ${remaining}，但 ${number} 比它大，後面的數只會更大，不用再試，退回去。`,
        });
        break;
      }

      path.push(number);
      picked++;
      const left = remaining - number;
      if (need > 1) {
        frames.push({
          rows: [
            row("數字", numbers, { pointers: { 目前: number - 1 }, rangeStart: start - 1, rangeEnd: last - 1, indexed: false }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `還要湊 ${remaining}，${number} 沒有比它大，選 ${number}。還要再選 ${need - 1} 個數，湊出 ${left}。`,
        });
      }
      pick(number + 1, left);
      path.pop();
    }
  }

  pick(1, target);
  frames.push({
    rows: [
      row("數字", numbers, { indexed: false }),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `${size} 個數加起來是 ${target} 的組合有 ${answers.length} 組。太大的數在選之前就擋掉，一共只選了 ${picked} 次數。`,
  });
  return frames;
}
