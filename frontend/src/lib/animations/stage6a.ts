import { Cell, Frame, ProblemAnimation, row } from "./types";

function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
}

function positionsOf(cells: Cell[], value: Cell) {
  const list: number[] = [];
  for (let index = 0; index < cells.length; index++) {
    if (cells[index] === value) {
      list.push(index);
    }
  }
  return list;
}

function intervalText(interval: number[]) {
  return `${interval[0]}~${interval[1]}`;
}

function intervalCells(intervals: number[][]) {
  return intervals.map(intervalText);
}

function minJumpsBrute(numbers: number[]) {
  const frames: Frame[] = [];
  const last = numbers.length - 1;
  const least = [0];
  const cells: Cell[] = numbers.map(() => "?");
  cells[0] = 0;
  let checked = 0;

  for (let current = 1; current <= last; current++) {
    let best = Infinity;

    for (let from = 0; from < current; from++) {
      const reach = from + numbers[from];
      const jumps = least[from] + 1;
      let result = "跳不到這裡。";
      checked++;

      if (reach >= current && jumps < best) {
        best = jumps;
        cells[current] = best;
        result = `跳得到，次數是 ${least[from]} + 1 = ${jumps}，目前最少是 ${best}。`;
      } else if (reach >= current) {
        result = `跳得到，次數是 ${least[from]} + 1 = ${jumps}，沒有比目前最少的 ${best} 少。`;
      }

      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 前面: from, 目前: current }, rangeStart: from, rangeEnd: reach }),
          row("最少次數", cells, { pointers: { 前面: from, 目前: current } }),
        ],
        message: `算跳到位置 ${current} 最少要幾次：從位置 ${from} 最遠能跳到位置 ${reach}，${result}`,
      });
    }

    least.push(best);
  }

  frames.push({
    rows: [row("陣列", numbers), row("最少次數", cells, { answer: [last] })],
    message: `跳到最後一個位置最少要 ${least[last]} 次。每個位置都把前面的位置全部檢查一遍，一共檢查了 ${checked} 次。`,
  });
  return frames;
}

function minJumpsBridge(numbers: number[]) {
  const frames: Frame[] = [];
  let jumps = 0;
  let bridgeEnd = 0;
  let farthest = 0;
  let checked = 0;

  frames.push({
    rows: [
      row("陣列", numbers, { pointers: { 橋尾: bridgeEnd }, rangeEnd: bridgeEnd }),
      row("跳躍次數", [jumps], { indexed: false }),
    ],
    message: "把跳同樣次數能到的範圍想成一座橋。走在橋上時，記住下一座橋最遠能蓋到哪裡，走到橋尾才不得不再跳一次。",
  });

  for (let current = 0; current < numbers.length - 1; current++) {
    const reach = current + numbers[current];
    farthest = Math.max(farthest, reach);
    checked++;
    const cells = row("陣列", numbers, {
      pointers: { 目前: current, 橋尾: bridgeEnd, 最遠: farthest },
      rangeEnd: bridgeEnd,
    });
    const text = `從位置 ${current} 最遠能跳到位置 ${reach}，下一座橋最遠蓋到位置 ${farthest}。`;

    if (current === bridgeEnd) {
      jumps++;
      frames.push({
        rows: [cells, row("跳躍次數", [jumps], { indexed: false })],
        message: `${text}已經走到橋尾，一定要再跳一次，跳躍次數變成 ${jumps}，橋尾移到位置 ${farthest}。`,
      });
      bridgeEnd = farthest;
    } else {
      frames.push({
        rows: [cells, row("跳躍次數", [jumps], { indexed: false })],
        message: `${text}還沒走到橋尾的位置 ${bridgeEnd}，先不用跳。`,
      });
    }
  }

  frames.push({
    rows: [
      row("陣列", numbers, { pointers: { 橋尾: bridgeEnd }, rangeEnd: bridgeEnd }),
      row("跳躍次數", [jumps], { answer: [0], indexed: false }),
    ],
    message: `橋已經蓋到最後一個位置，不用再跳，最少要跳 ${jumps} 次。每個位置只看一次，一共只檢查了 ${checked} 次。`,
  });
  return frames;
}

function maxSubarrayBrute(numbers: number[]) {
  const frames: Frame[] = [];
  let best = -Infinity;
  let bestStart = 0;
  let bestEnd = 0;
  let added = 0;

  for (let start = 0; start < numbers.length; start++) {
    let sum = 0;

    for (let end = start; end < numbers.length; end++) {
      sum += numbers[end];
      added++;
      if (sum > best) {
        best = sum;
        bestStart = start;
        bestEnd = end;
      }
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end })],
        message: `從位置 ${start} 開始往右加：加到 ${numbers[end]}，總和是 ${sum}，目前最大是 ${best}。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `總和最大的是位置 ${bestStart} 到 ${bestEnd} 這一段，總和是 ${best}。每個起點都重新加一次，一共做了 ${added} 次加法。`,
  });
  return frames;
}

function maxSubarrayKadane(numbers: number[]) {
  const frames: Frame[] = [];
  const sums: Cell[] = numbers.map(() => "?");
  let current = 0;
  let start = 0;
  let best = -Infinity;
  let bestStart = 0;
  let bestEnd = 0;
  let added = 0;

  for (let index = 0; index < numbers.length; index++) {
    const number = numbers[index];
    let action = `前面累積的總和 ${current} 大於 0，把 ${number} 接上去`;
    if (current <= 0) {
      action = `前面累積的總和 ${current} 沒有大於 0，接上去不會變大，改從 ${number} 重新開始`;
      current = 0;
      start = index;
    }
    if (index === 0) {
      action = `第一個數前面沒有東西，直接從 ${number} 開始`;
    }

    current += number;
    added++;
    sums[index] = current;
    if (current > best) {
      best = current;
      bestStart = start;
      bestEnd = index;
    }
    frames.push({
      rows: [
        row("陣列", numbers, { pointers: { 目前: index }, rangeStart: start, rangeEnd: index }),
        row("結尾最大和", sums, { pointers: { 目前: index } }),
      ],
      message: `${action}，以 ${number} 結尾的最大總和是 ${current}，目前最大是 ${best}。`,
    });
  }

  frames.push({
    rows: [
      row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("結尾最大和", sums, { answer: [bestEnd] }),
    ],
    message: `總和最大的是位置 ${bestStart} 到 ${bestEnd} 這一段，總和是 ${best}。只記以前一個數結尾的最大總和，一共只做了 ${added} 次加法。`,
  });
  return frames;
}

function canJumpBrute(numbers: number[]) {
  const frames: Frame[] = [];
  const last = numbers.length - 1;
  const marks = numbers.map(() => "否");
  marks[0] = "是";
  let marked = 0;

  for (let current = 0; current < last; current++) {
    const jump = numbers[current];
    const farthest = Math.min(current + jump, last);

    if (marks[current] === "否") {
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 目前: current }, rangeStart: current, rangeEnd: current }), row("能到", marks)],
        message: `位置 ${current} 沒有被標成「是」，到不了，不能從這裡跳。`,
      });
      continue;
    }

    if (jump === 0) {
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 目前: current }, rangeStart: current, rangeEnd: current }), row("能到", marks)],
        message: `位置 ${current} 的數字是 0，一格都跳不出去，沒有位置可以標記。`,
      });
      continue;
    }

    for (let target = current + 1; target <= farthest; target++) {
      let result = `把位置 ${target} 標成「是」。`;
      if (marks[target] === "是") {
        result = `位置 ${target} 早就是「是」了，還是再標一次。`;
      }
      marks[target] = "是";
      marked++;
      frames.push({
        rows: [
          row("陣列", numbers, { pointers: { 目前: current, 標記: target }, rangeStart: current, rangeEnd: farthest }),
          row("能到", marks, { pointers: { 標記: target } }),
        ],
        message: `從位置 ${current} 最多跳 ${jump} 格，跳得到的位置都要標記：${result}`,
      });
    }
  }

  let result = "最後一個位置是「是」，所以到得了。";
  if (marks[last] === "否") {
    result = "最後一個位置還是「否」，所以到不了。";
  }
  frames.push({
    rows: [row("陣列", numbers), row("能到", marks, { answer: [last] })],
    message: `全部標完，${result}每一格都把跳得到的位置標記一遍，一共標記了 ${marked} 次。`,
  });
  return frames;
}

function canJumpFarthest(numbers: number[]) {
  const frames: Frame[] = [];
  let farthest = 0;
  let counted = 0;

  for (let current = 0; current < numbers.length; current++) {
    if (current > farthest) {
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 最遠: farthest, 目前: current }, rangeEnd: farthest })],
        message: `位置 ${current} 超過最遠能到的位置 ${farthest}，到不了，後面也都到不了，所以到不了最後一個位置。只記最遠位置，一共只算了 ${counted} 次。`,
      });
      return frames;
    }

    const reach = current + numbers[current];
    const text = `位置 ${current} 到得了，從這裡最遠能跳到位置 ${current} + ${numbers[current]} = ${reach}`;
    counted++;

    if (reach > farthest) {
      const before = farthest;
      farthest = reach;
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 目前: current, 最遠: farthest }, rangeEnd: farthest })],
        message: `${text}，比原本的最遠位置 ${before} 遠，最遠位置更新成 ${farthest}。`,
      });
    } else {
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 目前: current, 最遠: farthest }, rangeEnd: farthest })],
        message: `${text}，沒有超過原本的最遠位置 ${farthest}，最遠位置不變。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers, { answer: [numbers.length - 1] })],
    message: `整個陣列走完，每個位置都到得了，所以到得了最後一個位置。只記最遠位置，一共只算了 ${counted} 次。`,
  });
  return frames;
}

function mergeBrute(intervals: number[][]) {
  const frames: Frame[] = [];
  const list = [...intervals];
  let first = 0;
  let second = 1;
  let compared = 0;

  while (first < list.length - 1) {
    const one = list[first];
    const other = list[second];
    const cells = row("區間", intervalCells(list), { pointers: { 甲: first, 乙: second }, indexed: false });
    const pair = `${intervalText(one)} 和 ${intervalText(other)}`;
    compared++;

    if (one[0] <= other[1] && other[0] <= one[1]) {
      const start = Math.min(one[0], other[0]);
      const end = Math.max(one[1], other[1]);
      frames.push({
        rows: [cells],
        message: `${pair} 有重疊，合併成 ${start}~${end}。合併後可能又和別的區間重疊，所以從頭再找一次。`,
      });
      list[first] = [start, end];
      list.splice(second, 1);
      first = 0;
      second = 1;
    } else {
      frames.push({
        rows: [cells],
        message: `任兩個區間都拿來比一次：${pair} 沒有重疊，換下一組。`,
      });
      second++;
      if (second === list.length) {
        first++;
        second = first + 1;
      }
    }
  }

  const cells = intervalCells(list);
  frames.push({
    rows: [row("區間", cells, { answer: positions(0, list.length - 1), indexed: false })],
    message: `再也找不到重疊的了，剩下 ${list.length} 個區間：${cells.join("、")}。每次合併後都從頭再找，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function mergeSorted(intervals: number[][]) {
  const frames: Frame[] = [];
  const sorted = [...intervals];
  sorted.sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [];
  let compared = 0;

  frames.push({
    rows: [row("區間", intervalCells(intervals), { indexed: false }), row("答案", [], { indexed: false })],
    message: "先依左端點由小到大排序。排序後會重疊的區間一定排在一起，每個區間只要和答案的最後一個區間比。",
  });

  for (let index = 0; index < sorted.length; index++) {
    const start = sorted[index][0];
    const end = sorted[index][1];
    const text = intervalText(sorted[index]);
    const cells = row("區間", intervalCells(sorted), { pointers: { 目前: index }, rangeStart: index, indexed: false });

    if (merged.length === 0) {
      merged.push([start, end]);
      frames.push({
        rows: [cells, row("答案", intervalCells(merged), { pointers: { 最後: 0 }, indexed: false })],
        message: `排序好了。答案還是空的，直接把第一個區間 ${text} 放進答案。`,
      });
      continue;
    }

    const lastIndex = merged.length - 1;
    const last = merged[lastIndex];
    let message = `${text} 的左端點 ${start} 超過答案最後一個區間的右端點 ${last[1]}，沒有重疊，把 ${text} 放進答案。`;
    compared++;

    if (start <= last[1]) {
      const longer = Math.max(last[1], end);
      message = `${text} 的左端點 ${start} 沒有超過答案最後一個區間的右端點 ${last[1]}，有重疊，右端點取較大的 ${longer}，變成 ${last[0]}~${longer}。`;
      merged[lastIndex] = [last[0], longer];
    } else {
      merged.push([start, end]);
    }

    frames.push({
      rows: [cells, row("答案", intervalCells(merged), { pointers: { 最後: merged.length - 1 }, indexed: false })],
      message,
    });
  }

  const answers = intervalCells(merged);
  frames.push({
    rows: [
      row("區間", intervalCells(sorted), { rangeEnd: -1, indexed: false }),
      row("答案", answers, { answer: positions(0, merged.length - 1), indexed: false }),
    ],
    message: `合併後剩下 ${merged.length} 個區間：${answers.join("、")}。排序後只要掃一遍，掃描一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function stockChoicesBrute(prices: number[]) {
  const frames: Frame[] = [];
  const days = prices.length;
  const choices = prices.map(() => "不動");
  let best = -Infinity;
  let bestChoices: string[] = [];
  let compared = 0;

  function choose(day: number, holding: boolean, profit: number) {
    if (day < days) {
      choices[day] = "不動";
      choose(day + 1, holding, profit);
      if (holding) {
        choices[day] = "賣";
        choose(day + 1, false, profit + prices[day]);
      } else {
        choices[day] = "買";
        choose(day + 1, true, profit - prices[day]);
      }
      return;
    }

    let ending = "";
    if (holding) {
      ending = "最後股票沒賣掉，";
    }
    compared++;
    if (profit > best) {
      best = profit;
      bestChoices = [...choices];
    }
    frames.push({
      rows: [row("價格", prices), row("選擇", choices)],
      message: `每天可以不動，也可以買進或賣出，每一種選法都算一次：這一種${ending}利潤是 ${profit}，目前最多賺 ${best}。`,
    });
  }

  choose(0, false, 0);

  frames.push({
    rows: [row("價格", prices), row("選擇", bestChoices, { answer: positions(0, days - 1) })],
    message: `最多賺 ${best}。每天都有兩種選擇，${days} 天就有 ${compared} 種選法，每一種的利潤都要比，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function stockStates(prices: number[]) {
  const frames: Frame[] = [];
  const emptyHand: Cell[] = prices.map(() => "?");
  const withStock: Cell[] = prices.map(() => "?");
  let notHold = 0;
  let hold = -prices[0];
  let compared = 0;

  emptyHand[0] = notHold;
  withStock[0] = hold;
  frames.push({
    rows: [
      row("價格", prices, { pointers: { 今天: 0 } }),
      row("沒股票", emptyHand, { pointers: { 今天: 0 } }),
      row("有股票", withStock, { pointers: { 今天: 0 } }),
    ],
    message: `兩列分別記每天結束時「手上沒股票」和「手上有股票」的最大利潤。第 0 天：沒股票是 0，有股票就是用 ${prices[0]} 買進，利潤是 ${hold}。`,
  });

  for (let day = 1; day < prices.length; day++) {
    const price = prices[day];
    const yesterday = day - 1;

    const sell = hold + price;
    const newNotHold = Math.max(notHold, sell);
    compared++;
    emptyHand[day] = newNotHold;
    frames.push({
      rows: [
        row("價格", prices, { pointers: { 今天: day } }),
        row("沒股票", emptyHand, { pointers: { 昨天: yesterday, 今天: day } }),
        row("有股票", withStock, { pointers: { 昨天: yesterday } }),
      ],
      message: `第 ${day} 天沒股票：昨天就沒有是 ${notHold}，昨天有、今天用 ${price} 賣掉是 ${hold} + ${price} = ${sell}，取較大的 ${newNotHold}。`,
    });

    const buy = notHold - price;
    const newHold = Math.max(hold, buy);
    compared++;
    withStock[day] = newHold;
    frames.push({
      rows: [
        row("價格", prices, { pointers: { 今天: day } }),
        row("沒股票", emptyHand, { pointers: { 昨天: yesterday } }),
        row("有股票", withStock, { pointers: { 昨天: yesterday, 今天: day } }),
      ],
      message: `第 ${day} 天有股票：昨天就有是 ${hold}，昨天沒有、今天用 ${price} 買進是 ${notHold} - ${price} = ${buy}，取較大的 ${newHold}。`,
    });

    notHold = newNotHold;
    hold = newHold;
  }

  const lastDay = prices.length - 1;
  frames.push({
    rows: [row("價格", prices), row("沒股票", emptyHand, { answer: [lastDay] }), row("有股票", withStock)],
    message: `最後一天手上沒股票的利潤就是答案，最多賺 ${notHold}。每天只算兩個狀態，一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function gasBrute(gas: number[], cost: number[]) {
  const frames: Frame[] = [];
  const count = gas.length;
  let counted = 0;

  for (let start = 0; start < count; start++) {
    let tank = 0;

    for (let step = 0; step < count; step++) {
      const station = (start + step) % count;
      tank += gas[station] - cost[station];
      counted++;
      const rows = [
        row("加油", gas, { pointers: { 起點: start, 目前: station } }),
        row("耗油", cost, { pointers: { 目前: station } }),
      ];
      const text = `從第 ${start} 站出發：在第 ${station} 站加 ${gas[station]}，開到下一站要花 ${cost[station]}`;

      if (tank < 0) {
        frames.push({
          rows,
          message: `${text}，油量變成 ${tank}，不夠用。這個起點失敗，換下一個起點重新開。`,
        });
        break;
      }

      frames.push({
        rows,
        message: `${text}，油量剩 ${tank}。`,
      });
    }

    if (tank >= 0) {
      frames.push({
        rows: [row("加油", gas, { pointers: { 起點: start }, answer: [start] }), row("耗油", cost)],
        message: `從第 ${start} 站出發繞完一圈，油都夠用，答案是第 ${start} 站。每個起點都重新開一次，一共算了 ${counted} 次油量。`,
      });
      return frames;
    }
  }

  frames.push({
    rows: [row("加油", gas, { rangeEnd: -1 }), row("耗油", cost, { rangeEnd: -1 })],
    message: `每個起點都失敗，沒有辦法繞完一圈，答案是 -1。每個起點都重新開一次，一共算了 ${counted} 次油量。`,
  });
  return frames;
}

function gasLowestPoint(gas: number[], cost: number[]) {
  const frames: Frame[] = [];
  const totals: Cell[] = gas.map(() => "?");
  let answer = 0;
  let total = 0;
  let lowest = 0;
  let counted = 0;

  frames.push({
    rows: [row("加油", gas, { pointers: { 起點: answer } }), row("耗油", cost), row("累計", totals)],
    message: "先假設從第 0 站出發，油量可以暫時是負的。每一站把「加油減耗油」累計起來，找出累計最低的地方。",
  });

  for (let station = 0; station < gas.length; station++) {
    total += gas[station] - cost[station];
    totals[station] = total;
    counted++;
    let result = `沒有比最低點 ${lowest} 低，起點不變。`;

    if (total < lowest) {
      lowest = total;
      answer = station + 1;
      result = `比之前的最低點還低，最低點換成這裡，起點改成下一站，第 ${answer} 站。`;
    }

    frames.push({
      rows: [
        row("加油", gas, { pointers: { 目前: station, 起點: answer } }),
        row("耗油", cost, { pointers: { 目前: station } }),
        row("累計", totals, { pointers: { 目前: station } }),
      ],
      message: `第 ${station} 站：加 ${gas[station]}、花 ${cost[station]}，累計變成 ${total}。${result}`,
    });
  }

  if (total < 0) {
    frames.push({
      rows: [row("加油", gas, { rangeEnd: -1 }), row("耗油", cost, { rangeEnd: -1 }), row("累計", totals)],
      message: `累計到最後是 ${total}，小於 0，整圈的油不夠，答案是 -1。每一站只算一次，一共只算了 ${counted} 次油量。`,
    });
    return frames;
  }

  frames.push({
    rows: [row("加油", gas, { pointers: { 起點: answer }, answer: [answer] }), row("耗油", cost), row("累計", totals)],
    message: `累計到最後是 ${total}，沒有小於 0，油夠繞一圈。從最低點的下一站出發，答案是第 ${answer} 站。每一站只算一次，一共只算了 ${counted} 次油量。`,
  });
  return frames;
}

function eraseBrute(intervals: number[][]) {
  const frames: Frame[] = [];
  const count = intervals.length;
  const cells = intervalCells(intervals);
  const choices = intervals.map(() => "留");
  let best = 0;
  let bestChoices: string[] = [];
  let tried = 0;
  let compared = 0;

  function findClash() {
    for (let first = 0; first < count; first++) {
      for (let second = first + 1; second < count; second++) {
        if (choices[first] === "留" && choices[second] === "留") {
          compared++;
          if (intervals[first][0] < intervals[second][1] && intervals[second][0] < intervals[first][1]) {
            return `${cells[first]} 和 ${cells[second]} 重疊`;
          }
        }
      }
    }
    return "";
  }

  function choose(index: number) {
    if (index < count) {
      choices[index] = "留";
      choose(index + 1);
      choices[index] = "拿掉";
      choose(index + 1);
      return;
    }

    const kept = positionsOf(choices, "留").length;
    const clash = findClash();
    let result = `但 ${clash}，不行。`;
    tried++;

    if (clash === "") {
      if (kept > best) {
        best = kept;
        bestChoices = [...choices];
      }
      result = `沒有重疊，目前最多留 ${best} 個。`;
    }
    frames.push({
      rows: [row("區間", cells, { indexed: false }), row("選擇", choices, { indexed: false })],
      message: `每個區間都選留或拿掉，每一種選法都檢查：這種留下 ${kept} 個，${result}`,
    });
  }

  choose(0);

  frames.push({
    rows: [
      row("區間", cells, { answer: positionsOf(bestChoices, "留"), indexed: false }),
      row("選擇", bestChoices, { indexed: false }),
    ],
    message: `最多能留 ${best} 個，最少拿掉 ${count} - ${best} = ${count - best} 個。${count} 個區間就要試 ${tried} 種選法，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function eraseSorted(intervals: number[][]) {
  const frames: Frame[] = [];
  const sorted = [...intervals];
  sorted.sort((a, b) => a[1] - b[1]);
  const count = sorted.length;
  const cells = intervalCells(sorted);
  const results = sorted.map(() => "?");
  let kept = 1;
  let lastKept = 0;
  let compared = 0;

  frames.push({
    rows: [row("區間", intervalCells(intervals), { indexed: false }), row("結果", results, { indexed: false })],
    message: "先依右端點由小到大排序。右端點越小，留給後面區間的空間越大，所以從右端點最小的開始留。",
  });

  results[0] = "留";
  frames.push({
    rows: [row("區間", cells, { pointers: { 目前: 0 }, indexed: false }), row("結果", results, { indexed: false })],
    message: `排序好了。第一個區間 ${cells[0]} 的右端點最小，一定留下，記住它的右端點 ${sorted[0][1]}。`,
  });

  for (let index = 1; index < count; index++) {
    const start = sorted[index][0];
    const lastEnd = sorted[lastKept][1];
    const pointers = { 上個: lastKept, 目前: index };
    let message = `${cells[index]} 的左端點 ${start} 小於上一個留下的右端點 ${lastEnd}，重疊了，拿掉。`;
    compared++;

    if (start >= lastEnd) {
      results[index] = "留";
      kept++;
      lastKept = index;
      message = `${cells[index]} 的左端點 ${start} 沒有小於上一個留下的右端點 ${lastEnd}，不重疊，留下，右端點改記 ${sorted[index][1]}。`;
    } else {
      results[index] = "拿掉";
    }

    frames.push({
      rows: [row("區間", cells, { pointers, indexed: false }), row("結果", results, { indexed: false })],
      message,
    });
  }

  frames.push({
    rows: [
      row("區間", cells, { answer: positionsOf(results, "留"), indexed: false }),
      row("結果", results, { indexed: false }),
    ],
    message: `留下 ${kept} 個，最少拿掉 ${count} - ${kept} = ${count - kept} 個。排序後每個區間只和上一個留下的比，掃描一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function arrowsBrute(balloons: number[][]) {
  const frames: Frame[] = [];
  const count = balloons.length;
  const cells = intervalCells(balloons);
  const shots: Cell[] = balloons.map(() => "不射");
  let best = Infinity;
  let bestShots: Cell[] = [];
  let tried = 0;
  let compared = 0;

  function findMissed(arrows: number[]) {
    for (const balloon of balloons) {
      let hit = false;
      for (const arrow of arrows) {
        compared++;
        if (balloon[0] <= arrow && arrow <= balloon[1]) {
          hit = true;
          break;
        }
      }
      if (!hit) {
        return intervalText(balloon);
      }
    }
    return "";
  }

  function choose(index: number) {
    if (index < count) {
      shots[index] = balloons[index][1];
      choose(index + 1);
      shots[index] = "不射";
      choose(index + 1);
      return;
    }

    const arrows: number[] = [];
    for (let balloon = 0; balloon < count; balloon++) {
      if (shots[balloon] !== "不射") {
        arrows.push(balloons[balloon][1]);
      }
    }
    const missed = findMissed(arrows);
    let result = `${missed} 沒被射到，不行。`;
    tried++;

    if (missed === "") {
      if (arrows.length < best) {
        best = arrows.length;
        bestShots = [...shots];
      }
      result = `氣球全破，目前最少 ${best} 支。`;
    }
    frames.push({
      rows: [row("氣球", cells, { indexed: false }), row("箭", shots, { indexed: false })],
      message: `每個氣球的右端點都選射或不射，每一種射法都試：這種射 ${arrows.length} 支，${result}`,
    });
  }

  choose(0);

  const used: number[] = [];
  for (let index = 0; index < count; index++) {
    if (bestShots[index] !== "不射") {
      used.push(index);
    }
  }
  frames.push({
    rows: [row("氣球", cells, { indexed: false }), row("箭", bestShots, { answer: used, indexed: false })],
    message: `最少要 ${best} 支箭。${count} 個氣球就要試 ${tried} 種射法，每一種都要檢查氣球破了沒，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function arrowsSorted(balloons: number[][]) {
  const frames: Frame[] = [];
  const sorted = [...balloons];
  sorted.sort((a, b) => a[1] - b[1]);
  const cells = intervalCells(sorted);
  const shots: Cell[] = sorted.map(() => "?");
  let arrows = 1;
  let position = sorted[0][1];
  let compared = 0;

  frames.push({
    rows: [row("氣球", intervalCells(balloons), { indexed: false }), row("中箭位置", shots, { indexed: false })],
    message: "先依右端點由小到大排序。箭射在氣球的右端點，是還射得到它、又最有機會射到後面氣球的位置。",
  });

  shots[0] = position;
  frames.push({
    rows: [row("氣球", cells, { pointers: { 目前: 0 }, indexed: false }), row("中箭位置", shots, { indexed: false })],
    message: `排序好了。第一支箭射在第一個氣球 ${cells[0]} 的右端點 ${position}。`,
  });

  for (let index = 1; index < sorted.length; index++) {
    const start = sorted[index][0];
    let message = `${cells[index]} 的左端點 ${start} 沒有超過箭的位置 ${position}，這支箭也射得到它，不用多射。`;
    compared++;

    if (start > position) {
      arrows++;
      message = `${cells[index]} 的左端點 ${start} 超過箭的位置 ${position}，射不到，要再射一支，射在它的右端點 ${sorted[index][1]}，目前 ${arrows} 支。`;
      position = sorted[index][1];
    }
    shots[index] = position;

    frames.push({
      rows: [
        row("氣球", cells, { pointers: { 目前: index }, rangeStart: index, indexed: false }),
        row("中箭位置", shots, { indexed: false }),
      ],
      message,
    });
  }

  frames.push({
    rows: [
      row("氣球", cells, { indexed: false }),
      row("中箭位置", shots, { answer: positions(0, sorted.length - 1), indexed: false }),
    ],
    message: `最少要 ${arrows} 支箭。排序後每個氣球只和目前這支箭的位置比一次，掃描一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function stretchText(letter: string, index: number, start: number, end: number, last: number) {
  if (index === start) {
    return `新的一段從位置 ${index} 開始，${letter} 最後出現在位置 ${last}，這一段至少要到位置 ${last}。`;
  }
  if (last > end) {
    return `${letter} 最後出現在位置 ${last}，超過目前的終點 ${end}，這一段要延伸到位置 ${last}。`;
  }
  return `${letter} 最後出現在位置 ${last}，沒有超過終點 ${end}，終點不變。`;
}

function partitionBrute(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const count = letters.length;
  const sizes: number[] = [];
  let start = 0;
  let end = 0;
  let looked = 0;

  for (let index = 0; index < count; index++) {
    const letter = letters[index];
    let last = index;
    for (let later = index; later < count; later++) {
      looked++;
      if (letters[later] === letter) {
        last = later;
      }
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 目前: index }, rangeStart: index }),
        row("答案", sizes, { indexed: false }),
      ],
      message: `${letter} 最後出現在哪裡？沒有先記下來，只好從位置 ${index} 一路看到結尾，看了 ${count - index} 個字元，最後一個 ${letter} 在位置 ${last}。`,
    });

    let message = stretchText(letter, index, start, end, last);
    end = Math.max(end, last);
    if (index === end) {
      const size = end - start + 1;
      sizes.push(size);
      message += `走到終點了，這一段的字母後面都不會再出現，在這裡切開，長度是 ${size}。`;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 起點: start, 目前: index, 終點: end }, rangeStart: start, rangeEnd: end }),
        row("答案", sizes, { indexed: false }),
      ],
      message,
    });
    if (index === end) {
      start = index + 1;
    }
  }

  frames.push({
    rows: [row("字串", letters), row("答案", sizes, { answer: positions(0, sizes.length - 1), indexed: false })],
    message: `切成 ${sizes.length} 段，長度是 ${sizes.join("、")}。每個字母都重新往後找一遍，一共看了 ${looked} 個字元。`,
  });
  return frames;
}

function partitionLastSeen(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const lastSeen: Record<string, number> = {};
  const sizes: number[] = [];
  let start = 0;
  let end = 0;
  let looked = 0;

  for (let index = 0; index < letters.length; index++) {
    lastSeen[letters[index]] = index;
    looked++;
  }
  const names = Object.keys(lastSeen);
  const table = names.map((name) => `${name}→${lastSeen[name]}`);

  frames.push({
    rows: [
      row("字串", letters),
      row("雜湊表", table, { indexed: false }),
      row("答案", sizes, { indexed: false }),
    ],
    message: `先走一遍字串，把每個字母最後出現的位置記進雜湊表，這一遍看了 ${looked} 個字元。之後查表就知道，不用再往後找。`,
  });

  for (let index = 0; index < letters.length; index++) {
    const letter = letters[index];
    const last = lastSeen[letter];
    let message = `查表：${stretchText(letter, index, start, end, last)}`;
    looked++;
    end = Math.max(end, last);
    if (index === end) {
      const size = end - start + 1;
      sizes.push(size);
      message += `走到終點了，這一段的字母後面都不會再出現，在這裡切開，長度是 ${size}。`;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 起點: start, 目前: index, 終點: end }, rangeStart: start, rangeEnd: end }),
        row("雜湊表", table, { pointers: { 目前: names.indexOf(letter) }, indexed: false }),
        row("答案", sizes, { indexed: false }),
      ],
      message,
    });
    if (index === end) {
      start = index + 1;
    }
  }

  frames.push({
    rows: [
      row("字串", letters),
      row("雜湊表", table, { indexed: false }),
      row("答案", sizes, { answer: positions(0, sizes.length - 1), indexed: false }),
    ],
    message: `切成 ${sizes.length} 段，長度是 ${sizes.join("、")}。先記好每個字母最後出現的位置再掃一遍，一共只看了 ${looked} 個字元。`,
  });
  return frames;
}

const jumpSteps = [2, 3, 1, 1, 2, 1, 1];
const subarrayNumbers = [-2, 3, -1, 2, -6, 3];
const blockedSteps = [5, 3, 3, 2, 1, 0, 4];
const mergeIntervals = [
  [1, 3],
  [8, 10],
  [2, 6],
  [15, 18],
  [9, 12],
  [5, 7],
];
const stockPrices = [1, 5, 3, 6];
const stationGas = [3, 3, 1, 4, 2, 3];
const stationCost = [2, 2, 5, 2, 3, 2];
const eraseIntervals = [
  [1, 4],
  [3, 5],
  [2, 3],
  [4, 6],
];
const balloons = [
  [10, 16],
  [2, 8],
  [1, 6],
  [7, 12],
];

export const stage6a: ProblemAnimation[] = [
  {
    problemId: 45,
    brute: minJumpsBrute(jumpSteps),
    efficient: minJumpsBridge(jumpSteps),
  },
  {
    problemId: 53,
    brute: maxSubarrayBrute(subarrayNumbers),
    efficient: maxSubarrayKadane(subarrayNumbers),
  },
  {
    problemId: 55,
    brute: canJumpBrute(blockedSteps),
    efficient: canJumpFarthest(blockedSteps),
  },
  {
    problemId: 56,
    brute: mergeBrute(mergeIntervals),
    efficient: mergeSorted(mergeIntervals),
  },
  {
    problemId: 122,
    brute: stockChoicesBrute(stockPrices),
    efficient: stockStates(stockPrices),
  },
  {
    problemId: 134,
    brute: gasBrute(stationGas, stationCost),
    efficient: gasLowestPoint(stationGas, stationCost),
  },
  {
    problemId: 435,
    brute: eraseBrute(eraseIntervals),
    efficient: eraseSorted(eraseIntervals),
  },
  {
    problemId: 452,
    brute: arrowsBrute(balloons),
    efficient: arrowsSorted(balloons),
  },
  {
    problemId: 763,
    brute: partitionBrute("abacbdedf"),
    efficient: partitionLastSeen("abacbdedf"),
  },
];
