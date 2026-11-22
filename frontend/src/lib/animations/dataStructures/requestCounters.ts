import { Frame, Row, row } from "../types";
import { pointAt, scanned } from "./listRows";

export function recentCounterScan(times: number[]) {
  const frames: Frame[] = [];
  const ops = times.map((time) => `請求 ${time}`);
  const list: number[] = [];
  const results: number[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", list, { indexed: false })],
    message: "「請求 1」是 ping(1)：在時間 1 收到請求，要回傳最近 3000 毫秒內（含這一次）有幾次。清單記下每一次請求的時間。",
  });

  for (let step = 0; step < times.length; step++) {
    const time = times[step];
    const start = time - 3000;
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    list.push(time);
    let count = 0;
    for (const past of list) {
      looked++;
      if (past >= start) {
        count++;
      }
    }
    results.push(count);
    frames.push({
      rows: [opRow, row("清單", list, { indexed: false, rangeStart: list.length - count })],
      message: `請求 ${time}（ping）：要數 ${start} 到 ${time} 之間的請求。舊的都還留著，只好把 ${list.length} 格全部看一遍，有 ${count} 個在範圍內，回傳 ${count}。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", list, { indexed: false })],
    message: `${results.length} 次請求依序回傳 ${results.join("、")}。舊的請求都不丟，每次從頭數，一共看了 ${looked} 格。`,
  });
  return frames;
}

export function recentCounterQueue(times: number[]) {
  const frames: Frame[] = [];
  const ops = times.map((time) => `請求 ${time}`);
  const queue: number[] = [];
  const results: number[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("佇列", queue, { indexed: false })],
    message: "「請求 1」是 ping(1)。佇列只留還在 3000 毫秒範圍內的請求，由舊到新排，最舊的在隊首；時間只會越來越大，太舊的可以直接丟。",
  });

  for (let step = 0; step < times.length; step++) {
    const time = times[step];
    const start = time - 3000;
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    queue.push(time);
    let dropped = 0;
    looked++;
    while (queue[0] < start) {
      queue.shift();
      dropped++;
      looked++;
    }
    const count = queue.length;
    results.push(count);

    let message = `請求 ${time}（ping）：放到佇列尾端。隊首的 ${queue[0]} 沒有比 ${start} 早，不用丟。佇列長度 ${count} 就是答案，回傳 ${count}。`;
    if (dropped > 0) {
      message = `請求 ${time}（ping）：放到佇列尾端。隊首比 ${start} 早的以後也用不到，丟掉 ${dropped} 個，直到隊首夠新。佇列長度 ${count} 就是答案，回傳 ${count}。`;
    }
    frames.push({
      rows: [opRow, row("佇列", queue, { indexed: false, pointers: { 隊首: 0 } })],
      message,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("佇列", queue, { indexed: false })],
    message: `${results.length} 次請求依序回傳 ${results.join("、")}。太舊的從隊首丟掉就不用再看，每次只比隊首，一共只看了 ${looked} 格。`,
  });
  return frames;
}

const carNames = ["", "大車", "中車", "小車"];

function slotRows(slots: string[][], type: number, found: number) {
  const rows: Row[] = [];
  for (let i = 1; i <= 3; i++) {
    let marked = -1;
    if (i === type) {
      marked = found;
    }
    rows.push(row(`${carNames[i]}位`, slots[i], { indexed: false, pointers: pointAt(marked) }));
  }
  return rows;
}

export function parkingSlots(big: number, medium: number, small: number, ops: string[]) {
  const frames: Frame[] = [];
  const slots: string[][] = [
    [],
    new Array<string>(big).fill("空"),
    new Array<string>(medium).fill("空"),
    new Array<string>(small).fill("空"),
  ];
  const results: string[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), ...slotRows(slots, 0, -1), row("回傳", results, { indexed: false })],
    message: "每個車位佔一格，「空」是空位、「車」是停了車。「大車」是 addCar(1)、「中車」是 addCar(2)、「小車」是 addCar(3)。",
  });

  for (let step = 0; step < ops.length; step++) {
    const car = ops[step];
    const type = carNames.indexOf(car);
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    const lot = slots[type];
    const found = lot.indexOf("空");
    const seen = scanned(found, lot.length);
    looked += seen;

    let message = `${car}（addCar(${type})）：把 ${seen} 個${car}位全部看過，都停了車，回傳 false。`;
    const parked = found >= 0;
    if (parked) {
      lot[found] = "車";
      message = `${car}（addCar(${type})）：從頭找空的${car}位，看了 ${seen} 格找到，停進去，回傳 true。`;
    }
    results.push(String(parked));
    frames.push({
      rows: [opRow, ...slotRows(slots, type, found), row("回傳", results, { indexed: false })],
      message,
    });
  }

  const used = big + medium + small;
  frames.push({
    rows: [row("操作", ops, { indexed: false }), ...slotRows(slots, 0, -1), row("回傳", results, { indexed: false })],
    message: `回傳值在「回傳」那一列。每個車位佔一格，共用了 ${used} 格；每次從頭找空位，一共看了 ${looked} 格。`,
  });
  return frames;
}

export function parkingCounters(big: number, medium: number, small: number, ops: string[]) {
  const frames: Frame[] = [];
  const remaining = [0, big, medium, small];
  const results: string[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("剩餘車位", remaining), row("回傳", results, { indexed: false })],
    message: "只記三種車位各剩幾格：位置 1 是大車位、2 是中車位、3 是小車位，位置 0 用不到。addCar 的車種編號剛好就是位置。",
  });

  for (let step = 0; step < ops.length; step++) {
    const car = ops[step];
    const type = carNames.indexOf(car);
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    looked++;

    let message = `${car}（addCar(${type})）：直接看位置 ${type}，${car}位剩 0 格，回傳 false。`;
    const parked = remaining[type] > 0;
    if (parked) {
      remaining[type]--;
      message = `${car}（addCar(${type})）：直接看位置 ${type}，${car}位還有剩，減一變成 ${remaining[type]}，回傳 true。`;
    }
    results.push(String(parked));
    frames.push({
      rows: [opRow, row("剩餘車位", remaining, { pointers: { 目前: type } }), row("回傳", results, { indexed: false })],
      message,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("剩餘車位", remaining), row("回傳", results, { indexed: false })],
    message: `回傳值在「回傳」那一列。只用 ${remaining.length} 格記數量；每次只看 1 格，一共只看了 ${looked} 格。車位不多時兩種做法差距不大。`,
  });
  return frames;
}
