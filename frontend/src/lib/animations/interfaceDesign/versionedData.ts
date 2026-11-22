import { Frame, row } from "../types";

type Change = { id: number; value: number };

export function timeMapScan(ops: string[]) {
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

export function timeMapBinary(ops: string[]) {
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

function copyRows(copies: number[][]) {
  return copies.map((copy, id) => row(`快照 ${id}`, copy));
}

export function snapshotCopy(length: number, ops: string[]) {
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

export function snapshotHistory(length: number, ops: string[]) {
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
