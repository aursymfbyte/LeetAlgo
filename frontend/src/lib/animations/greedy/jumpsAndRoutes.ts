import { Cell, Frame, row } from "../types";

export function minJumpsBrute(numbers: number[]) {
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

export function minJumpsBridge(numbers: number[]) {
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

export function canJumpBrute(numbers: number[]) {
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

export function canJumpFarthest(numbers: number[]) {
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

export function gasBrute(gas: number[], cost: number[]) {
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

export function gasLowestPoint(gas: number[], cost: number[]) {
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
