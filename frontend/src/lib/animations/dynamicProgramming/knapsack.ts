import { Cell, Frame, Row, row } from "../types";

function coinCells(f: number[], impossible: number) {
  const cells: Cell[] = [];
  for (const value of f) {
    if (value === impossible) {
      cells.push("∞");
    } else {
      cells.push(value);
    }
  }
  return cells;
}

export function coinBrute(coins: number[], amount: number) {
  const frames: Frame[] = [];
  const most = coins.map((coin) => Math.floor(amount / coin));
  let fewest = Infinity;
  let fewestCell: Cell = "∞";
  let bestCounts: number[] = [];
  let tried = 0;

  for (let first = 0; first <= most[0]; first++) {
    for (let second = 0; second <= most[1]; second++) {
      for (let third = 0; third <= most[2]; third++) {
        const counts = [first, second, third];
        const sum = first * coins[0] + second * coins[1] + third * coins[2];
        const used = first + second + third;
        const countRow = row("枚數", counts, { indexed: false });
        let result = `不是 ${amount}，不算。`;
        tried++;

        if (sum === amount) {
          if (used < fewest) {
            fewest = used;
            fewestCell = used;
            bestCounts = counts;
          }
          countRow.answer = [0, 1, 2];
          result = `湊到了，用了 ${used} 枚，目前最少是 ${fewest} 枚。`;
        }

        frames.push({
          rows: [row("硬幣", coins, { indexed: false }), countRow, row("最少", [fewestCell], { indexed: false })],
          message: `每種枚數都配一遍：${coins[0]} 用 ${first} 枚、${coins[1]} 用 ${second} 枚、${coins[2]} 用 ${third} 枚，總和是 ${sum}，${result}`,
        });
      }
    }
  }

  frames.push({
    rows: [
      row("硬幣", coins, { indexed: false }),
      row("枚數", bestCounts, { answer: [0, 1, 2], indexed: false }),
      row("最少", [fewestCell], { answer: [0], indexed: false }),
    ],
    message: `湊出金額 ${amount} 最少要 ${fewest} 枚硬幣。三層迴圈把每種枚數都配一遍，一共試了 ${tried} 種組合。`,
  });
  return frames;
}

export function coinTable(coins: number[], amount: number) {
  const frames: Frame[] = [];
  const impossible = amount + 1;
  const f: number[] = [];
  for (let c = 0; c <= amount; c++) {
    f.push(impossible);
  }
  f[0] = 0;
  let updates = 0;

  frames.push({
    rows: [row("硬幣", coins, { indexed: false }), row("最少硬幣", coinCells(f, impossible))],
    message: "位置 c 記錄湊出金額 c 最少要幾枚。金額 0 不用硬幣，是 0；其他先當成湊不出來，記成 ∞。接著硬幣一種一種加進來。",
  });

  for (let index = 0; index < coins.length; index++) {
    const coin = coins[index];

    for (let c = coin; c <= amount; c++) {
      const before = f[c];
      const source = f[c - coin];
      const candidate = source + 1;
      let result = `沒有比原本的 ${before} 枚少，不變。`;

      if (before === impossible) {
        result = `原本湊不出來，記成 ${candidate}。`;
      } else if (candidate < before) {
        result = `比原本的 ${before} 枚少，改成 ${candidate}。`;
      }
      f[c] = Math.min(before, candidate);
      updates++;

      frames.push({
        rows: [
          row("硬幣", coins, { pointers: { 目前: index }, indexed: false }),
          row("最少硬幣", coinCells(f, impossible), { pointers: { 來源: c - coin, 目前: c } }),
        ],
        message: `加進面額 ${coin}：金額 ${c} 可以從金額 ${c - coin} 的 ${source} 枚再加一枚 ${coin}，共 ${candidate} 枚，${result}`,
      });
    }
  }

  frames.push({
    rows: [
      row("硬幣", coins, { indexed: false }),
      row("最少硬幣", coinCells(f, impossible), { answer: [amount] }),
    ],
    message: `湊出金額 ${amount} 最少要 ${f[amount]} 枚硬幣。每種硬幣只把金額掃一遍，一共只更新了 ${updates} 格。`,
  });
  return frames;
}

function totalOf(numbers: number[]) {
  let total = 0;
  for (const number of numbers) {
    total += number;
  }
  return total;
}

function reachCells(f: boolean[]) {
  const cells: string[] = [];
  for (const reachable of f) {
    if (reachable) {
      cells.push("可以");
    } else {
      cells.push("不行");
    }
  }
  return cells;
}

export function partitionBrute(numbers: number[]) {
  const frames: Frame[] = [];
  const half = totalOf(numbers) / 2;
  const picks: string[] = numbers.map(() => "不選");
  let hitRows: Row[] = [];
  let tried = 0;
  let found = 0;

  function choose(index: number, sum: number) {
    if (index < numbers.length) {
      picks[index] = "不選";
      choose(index + 1, sum);
      picks[index] = "選";
      choose(index + 1, sum + numbers[index]);
      return;
    }

    const chosen: number[] = [];
    for (let position = 0; position < numbers.length; position++) {
      if (picks[position] === "選") {
        chosen.push(position);
      }
    }
    tried++;

    if (sum === half) {
      const rows = [row("陣列", numbers, { answer: chosen }), row("選法", picks, { answer: chosen, indexed: false })];
      found++;
      hitRows = rows;
      frames.push({
        rows,
        message: `第 ${tried} 種選法：選出的數總和是 ${sum}，剛好是一半，剩下的也是 ${half}，分得開。目前找到 ${found} 種。`,
      });
    } else {
      frames.push({
        rows: [row("陣列", numbers), row("選法", picks, { indexed: false })],
        message: `每個數都有選和不選兩種，全部列出來。第 ${tried} 種選法：選出的數總和是 ${sum}，不是一半的 ${half}。`,
      });
    }
  }

  choose(0, 0);

  frames.push({
    rows: hitRows,
    message: `有 ${found} 種選法的總和剛好是一半，所以可以分成兩組。${numbers.length} 個數每個都有選和不選，一共試了 ${tried} 種選法。`,
  });
  return frames;
}

export function partitionTable(numbers: number[]) {
  const frames: Frame[] = [];
  const total = totalOf(numbers);
  const half = total / 2;
  const f: boolean[] = [];
  for (let c = 0; c <= half; c++) {
    f.push(false);
  }
  f[0] = true;
  let updates = 0;

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 }), row("湊得出", reachCells(f))],
    message: `全部總和是 ${total}，一半是 ${half}。問題變成：能不能選出一些數，總和剛好是 ${half}。位置 c 記錄湊不湊得出總和 c，一開始只有 0 可以。`,
  });

  for (let index = 0; index < numbers.length; index++) {
    const number = numbers[index];

    for (let c = half; c >= number; c--) {
      const rest = c - number;
      let result = `原本就湊得出 ${c}，不用改。`;

      if (!f[c] && f[rest]) {
        result = `原本湊不出 ${c}，但 ${rest} 湊得出來，再加上這個 ${number} 就是 ${c}，改成可以。`;
      } else if (!f[c]) {
        result = `原本湊不出 ${c}，去掉這個 ${number} 剩下的 ${rest} 也湊不出來，還是不行。`;
      }
      f[c] = f[c] || f[rest];
      updates++;

      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 目前: index }, rangeEnd: index }),
          row("湊得出", reachCells(f), { pointers: { 來源: rest, 目前: c } }),
        ],
        message: `輪到位置 ${index} 的 ${number}，總和從大到小看，才不會把它選兩次。總和 ${c}：${result}`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers), row("湊得出", reachCells(f), { answer: [half] })],
    message: `總和 ${half} 湊得出來，所以可以分成總和相等的兩組。每個數只把總和掃一遍，一共只更新了 ${updates} 格。`,
  });
  return frames;
}

export function targetBrute(numbers: number[], target: number) {
  const frames: Frame[] = [];
  const signs: string[] = numbers.map(() => "+");
  let hitRows: Row[] = [];
  let tried = 0;
  let found = 0;

  function place(index: number, sum: number) {
    if (index < numbers.length) {
      signs[index] = "+";
      place(index + 1, sum + numbers[index]);
      signs[index] = "-";
      place(index + 1, sum - numbers[index]);
      return;
    }

    let expression = "";
    for (let position = 0; position < numbers.length; position++) {
      expression += signs[position] + numbers[position];
    }
    const rows = [row("陣列", numbers), row("符號", signs, { indexed: false })];
    tried++;

    if (sum === target) {
      found++;
      hitRows = rows;
      frames.push({
        rows,
        message: `第 ${tried} 種放法：${expression} = ${sum}，等於目標 ${target}，算一種，目前有 ${found} 種。`,
      });
    } else {
      frames.push({
        rows,
        message: `每個數前面放 + 或 -，全部列出來。第 ${tried} 種放法：${expression} = ${sum}，不是 ${target}。`,
      });
    }
  }

  place(0, 0);

  frames.push({
    rows: hitRows,
    message: `結果等於 ${target} 的放法有 ${found} 種。${numbers.length} 個數每個都有正負兩種符號，一共試了 ${tried} 種放法。`,
  });
  return frames;
}

export function targetTable(numbers: number[], target: number) {
  const frames: Frame[] = [];
  const total = totalOf(numbers);
  const negative = (total - target) / 2;
  const f: number[] = [];
  const unknown: string[] = [];
  for (let c = 0; c <= negative; c++) {
    f.push(0);
    unknown.push("?");
  }
  f[0] = 1;
  let updates = 0;

  frames.push({
    rows: [row("陣列", numbers), row("方法數", unknown)],
    message: `全部總和是 ${total}。設放負號的數總和是 q，結果就是 (${total} - q) - q = ${target}，算出 q = ${negative}。所以只要決定哪些數放負號。`,
  });
  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 }), row("方法數", f)],
    message: `題目變成：選一些數，總和剛好是 ${negative} 的選法有幾種。位置 c 記錄湊出總和 c 的選法數，都不選就是總和 0，算 1 種。總和從大到小更新，同一個數才不會選兩次。`,
  });

  for (let index = 0; index < numbers.length; index++) {
    const number = numbers[index];

    for (let c = negative; c >= number; c--) {
      const before = f[c];
      const rest = c - number;
      const source = f[rest];
      f[c] = before + source;
      updates++;

      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 目前: index }, rangeEnd: index }),
          row("方法數", f, { pointers: { 來源: rest, 目前: c } }),
        ],
        message: `輪到位置 ${index} 的 ${number}，總和 ${c}：不選它有 ${before} 種；選它就要先湊出 ${rest}，有 ${source} 種。合起來 ${f[c]} 種。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers), row("方法數", f, { answer: [negative] })],
    message: `湊出總和 ${negative} 的選法有 ${f[negative]} 種，每一種對應一種符號放法，答案是 ${f[negative]}。一共只更新了 ${updates} 格。`,
  });
  return frames;
}

export function combinationBrute(coins: number[], amount: number) {
  const frames: Frame[] = [];
  const most = coins.map((coin) => Math.floor(amount / coin));
  let hitRow = row("枚數", [], { indexed: false });
  let tried = 0;
  let found = 0;

  for (let first = 0; first <= most[0]; first++) {
    for (let second = 0; second <= most[1]; second++) {
      for (let third = 0; third <= most[2]; third++) {
        const counts = [first, second, third];
        const sum = first * coins[0] + second * coins[1] + third * coins[2];
        const countRow = row("枚數", counts, { indexed: false });
        let result = `不是 ${amount}，不算。`;
        tried++;

        if (sum === amount) {
          found++;
          countRow.answer = [0, 1, 2];
          hitRow = countRow;
          result = `剛好是 ${amount}，算一種組合，目前有 ${found} 種。`;
        }

        frames.push({
          rows: [row("硬幣", coins, { indexed: false }), countRow],
          message: `每種枚數都配一遍：${coins[0]} 用 ${first} 枚、${coins[1]} 用 ${second} 枚、${coins[2]} 用 ${third} 枚，總和是 ${sum}，${result}`,
        });
      }
    }
  }

  frames.push({
    rows: [row("硬幣", coins, { indexed: false }), hitRow],
    message: `湊出金額 ${amount} 的組合有 ${found} 種。三層迴圈把每種枚數都配一遍，一共試了 ${tried} 種組合。`,
  });
  return frames;
}

export function combinationTable(coins: number[], amount: number) {
  const frames: Frame[] = [];
  const f: number[] = [];
  for (let c = 0; c <= amount; c++) {
    f.push(0);
  }
  f[0] = 1;
  let updates = 0;

  frames.push({
    rows: [row("硬幣", coins, { indexed: false }), row("組合數", f)],
    message: "位置 c 記錄湊出金額 c 的組合數。什麼都不拿就是金額 0，算 1 種。硬幣一種一種加進來，所以 1 + 2 和 2 + 1 只會算到一次。",
  });

  for (let index = 0; index < coins.length; index++) {
    const coin = coins[index];

    for (let c = coin; c <= amount; c++) {
      const before = f[c];
      const rest = c - coin;
      const source = f[rest];
      f[c] = before + source;
      updates++;

      frames.push({
        rows: [
          row("硬幣", coins, { pointers: { 目前: index }, indexed: false }),
          row("組合數", f, { pointers: { 來源: rest, 目前: c } }),
        ],
        message: `加進面額 ${coin}：金額 ${c} 不用它有 ${before} 種；用一枚就要先湊出金額 ${rest}，有 ${source} 種。合起來 ${f[c]} 種。`,
      });
    }
  }

  frames.push({
    rows: [row("硬幣", coins, { indexed: false }), row("組合數", f, { answer: [amount] })],
    message: `湊出金額 ${amount} 的組合有 ${f[amount]} 種。每種硬幣只把金額掃一遍，一共只更新了 ${updates} 格。`,
  });
  return frames;
}
