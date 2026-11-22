import { Entry, pointAt, scanned } from "./listRows";
import { Cell, Frame, Row, row } from "../types";

function arrowCells(entries: Entry[]) {
  return entries.map((entry) => `${entry.key}→${entry.value}`);
}

function tableCells(table: Map<number, number>) {
  const cells: string[] = [];
  for (const [key, value] of table) {
    cells.push(`${key}→${value}`);
  }
  return cells;
}

export function randomSetList(ops: string[]) {
  const frames: Frame[] = [];
  const values: number[] = [];
  const results: Cell[] = [];
  let looked = 0;
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("陣列", values), row("回傳", results, { indexed: false })],
    message: "陣列存集合裡的數，「回傳」記每個操作回傳什麼。「抽位置 2」是 getRandom：為了每次播放都一樣，抽到哪個位置是事先寫好的。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const num = Number(text);
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "抽位置") {
      results.push(values[num]);
      frames.push({
        rows: [opRow, row("陣列", values, { pointers: { 目前: num } }), row("回傳", results, { indexed: false })],
        message: `${ops[step]}（getRandom）：這次抽到位置 ${num}，直接讀那一格，回傳 ${values[num]}。`,
      });
      continue;
    }

    const found = values.indexOf(num);
    const seen = scanned(found, values.length);
    looked += seen;

    if (name === "加" && found >= 0) {
      results.push("false");
      frames.push({
        rows: [
          opRow,
          row("陣列", values, { pointers: { 目前: found }, rangeEnd: found }),
          row("回傳", results, { indexed: false }),
        ],
        message: `加 ${num}（insert）：怕重複，從頭一格一格比，看了 ${seen} 格發現 ${num} 已經在了，不加，回傳 false。`,
      });
      continue;
    }

    if (name === "加") {
      values.push(num);
      results.push("true");
      frames.push({
        rows: [
          opRow,
          row("陣列", values, { pointers: { 目前: values.length - 1 } }),
          row("回傳", results, { indexed: false }),
        ],
        message: `加 ${num}（insert）：怕重複，從頭比了 ${seen} 格，陣列裡沒有 ${num}，才放到最後面，回傳 true。`,
      });
      continue;
    }

    if (found === -1) {
      results.push("false");
      frames.push({
        rows: [opRow, row("陣列", values), row("回傳", results, { indexed: false })],
        message: `刪 ${num}（remove）：從頭比到尾，${seen} 格都不是 ${num}，沒東西可刪，回傳 false。`,
      });
      continue;
    }

    frames.push({
      rows: [
        opRow,
        row("陣列", values, { pointers: { 目前: found }, rangeEnd: found }),
        row("回傳", results, { indexed: false }),
      ],
      message: `刪 ${num}（remove）：從頭一格一格比，看了 ${seen} 格才找到 ${num}。`,
    });
    values.splice(found, 1);
    const shifted = values.length - found;
    moved += shifted;
    results.push("true");
    frames.push({
      rows: [opRow, row("陣列", values, { rangeStart: found }), row("回傳", results, { indexed: false })],
      message: `把 ${num} 拿掉會留下空洞，後面的 ${shifted} 個數各往前搬一格補上，回傳 true。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("陣列", values), row("回傳", results, { indexed: false })],
    message: `操作都做完了，回傳值在「回傳」那一列。每次加和刪都從頭找，刪了還要往前補，一共看了 ${looked} 格、搬了 ${moved} 格。`,
  });
  return frames;
}

export function randomSetHashMap(ops: string[]) {
  const frames: Frame[] = [];
  const values: number[] = [];
  const positionOf = new Map<number, number>();
  const results: Cell[] = [];
  let looked = 0;
  let moved = 0;

  frames.push({
    rows: [
      row("操作", ops, { indexed: false }),
      row("陣列", values),
      row("雜湊表", [], { indexed: false }),
      row("回傳", results, { indexed: false }),
    ],
    message: "陣列存集合裡的數，雜湊表記每個數在陣列的哪個位置，寫成「數→位置」。「抽位置 2」是 getRandom，抽到哪個位置是事先寫好的。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const num = Number(text);
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "抽位置") {
      results.push(values[num]);
      frames.push({
        rows: [
          opRow,
          row("陣列", values, { pointers: { 目前: num } }),
          row("雜湊表", tableCells(positionOf), { indexed: false }),
          row("回傳", results, { indexed: false }),
        ],
        message: `${ops[step]}（getRandom）：這次抽到位置 ${num}，直接讀那一格，回傳 ${values[num]}。`,
      });
      continue;
    }

    const index = positionOf.get(num);
    looked++;

    if (name === "加" && index !== undefined) {
      const keys = [...positionOf.keys()];
      results.push("false");
      frames.push({
        rows: [
          opRow,
          row("陣列", values, { pointers: { 目前: index } }),
          row("雜湊表", tableCells(positionOf), { indexed: false, pointers: { 目前: keys.indexOf(num) } }),
          row("回傳", results, { indexed: false }),
        ],
        message: `加 ${num}（insert）：查雜湊表一次就知道 ${num} 已經在位置 ${index}，不加，回傳 false。`,
      });
      continue;
    }

    if (name === "加") {
      const last = values.length;
      positionOf.set(num, last);
      values.push(num);
      results.push("true");
      frames.push({
        rows: [
          opRow,
          row("陣列", values, { pointers: { 目前: last } }),
          row("雜湊表", tableCells(positionOf), { indexed: false, pointers: { 目前: positionOf.size - 1 } }),
          row("回傳", results, { indexed: false }),
        ],
        message: `加 ${num}（insert）：查雜湊表一次就知道沒有 ${num}。放到陣列最後面，雜湊表記下它在位置 ${last}，回傳 true。`,
      });
      continue;
    }

    if (index === undefined) {
      results.push("false");
      frames.push({
        rows: [
          opRow,
          row("陣列", values),
          row("雜湊表", tableCells(positionOf), { indexed: false }),
          row("回傳", results, { indexed: false }),
        ],
        message: `刪 ${num}（remove）：查雜湊表一次就知道沒有 ${num}，回傳 false。`,
      });
      continue;
    }

    const keys = [...positionOf.keys()];
    frames.push({
      rows: [
        opRow,
        row("陣列", values, { pointers: { 目前: index } }),
        row("雜湊表", tableCells(positionOf), { indexed: false, pointers: { 目前: keys.indexOf(num) } }),
        row("回傳", results, { indexed: false }),
      ],
      message: `刪 ${num}（remove）：查雜湊表一次就知道 ${num} 在位置 ${index}，不用從頭找。`,
    });

    const lastValue = values[values.length - 1];
    values[index] = lastValue;
    positionOf.set(lastValue, index);
    values.pop();
    positionOf.delete(num);
    moved++;
    results.push("true");
    const keysLeft = [...positionOf.keys()];
    frames.push({
      rows: [
        opRow,
        row("陣列", values, { pointers: { 目前: index } }),
        row("雜湊表", tableCells(positionOf), { indexed: false, pointers: { 目前: keysLeft.indexOf(lastValue) } }),
        row("回傳", results, { indexed: false }),
      ],
      message: `把最後面的 ${lastValue} 搬來蓋掉位置 ${index}，雜湊表改成 ${lastValue}→${index}，再刪掉陣列最後一格。只搬 1 格，回傳 true。`,
    });
  }

  frames.push({
    rows: [
      row("操作", ops, { indexed: false }),
      row("陣列", values),
      row("雜湊表", tableCells(positionOf), { indexed: false }),
      row("回傳", results, { indexed: false }),
    ],
    message: `操作都做完了，回傳值在「回傳」那一列。每次只查雜湊表 1 格，刪除只搬 1 格，一共只看了 ${looked} 格、搬了 ${moved} 格。`,
  });
  return frames;
}

function bucketRows(buckets: Cell[][], target: number, marked: number) {
  const rows: Row[] = [];
  for (let i = 0; i < 4; i++) {
    if (i >= buckets.length) {
      rows.push(row(`桶 ${i}`, ["未啟用"], { indexed: false, rangeStart: 1 }));
      continue;
    }
    let pointed = -1;
    if (i === target) {
      pointed = marked;
    }
    rows.push(row(`桶 ${i}`, buckets[i], { indexed: false, pointers: pointAt(pointed) }));
  }
  return rows;
}

export function hashSetList(ops: string[]) {
  const frames: Frame[] = [];
  const list: number[] = [];
  const results: boolean[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", list)],
    message: "集合裡的數全部放在一個清單。「加」是 add、「有」是 contains、「刪」是 remove，每次都得從頭一格一格比。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const key = Number(text);
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "有") {
      let hit = false;
      for (let i = 0; i < list.length; i++) {
        looked++;
        let message = `有 ${key}（contains）：位置 ${i} 的 ${list[i]} 不是 ${key}，看下一格。`;
        if (list[i] === key) {
          hit = true;
          message = `有 ${key}（contains）：位置 ${i} 就是 ${key}，找到了，回傳 true。`;
        } else if (i === list.length - 1) {
          message = `有 ${key}（contains）：位置 ${i} 的 ${list[i]} 也不是，整個清單都比完了，回傳 false。`;
        }
        frames.push({
          rows: [opRow, row("清單", list, { pointers: { 目前: i }, rangeEnd: i })],
          message,
        });
        if (hit) {
          break;
        }
      }
      results.push(hit);
      continue;
    }

    const found = list.indexOf(key);
    const seen = scanned(found, list.length);
    looked += seen;
    let marked = found;
    let message = `加 ${key}（add）：從頭比了 ${seen} 格，發現 ${key} 已經在了，不用再加。`;

    if (name === "刪") {
      list.splice(found, 1);
      marked = -1;
      message = `刪 ${key}（remove）：從頭比了 ${seen} 格找到 ${key}，把它拿掉，後面的 ${list.length - found} 個數往前補。`;
    } else if (found === -1) {
      list.push(key);
      marked = list.length - 1;
      message = `加 ${key}（add）：從頭比了 ${seen} 格，清單裡沒有 ${key}，放到最後面。`;
    }

    frames.push({
      rows: [opRow, row("清單", list, { pointers: pointAt(marked) })],
      message,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", list)],
    message: `${results.length} 次「有」依序回傳 ${results.join("、")}。每次都從頭一格一格比，一共看了 ${looked} 格。`,
  });
  return frames;
}

export function hashSetBuckets(ops: string[]) {
  const frames: Frame[] = [];
  let buckets: number[][] = [[], []];
  const results: boolean[] = [];
  let size = 0;
  let looked = 0;
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), ...bucketRows(buckets, 0, -1)],
    message: "每個桶一列，數字放進「數字 % 桶數」那個桶，查的時候只看那一桶。題解從 8 個桶開始，這裡為了示範先只開 2 個。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const key = Number(text);
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    const index = key % buckets.length;
    const bucket = buckets[index];
    const found = bucket.indexOf(key);
    const seen = scanned(found, bucket.length);
    looked += seen;
    const where = `${key} % ${buckets.length} = ${index}，只看桶 ${index}`;
    let marked = found;
    let message = "";

    if (name === "有" && found >= 0) {
      results.push(true);
      message = `有 ${key}（contains）：${where}。比了 ${seen} 格找到 ${key}，回傳 true。`;
    } else if (name === "有") {
      results.push(false);
      message = `有 ${key}（contains）：${where}。比了 ${seen} 格，桶裡沒有 ${key}，回傳 false。`;
    } else if (name === "刪") {
      bucket.splice(found, 1);
      size--;
      marked = -1;
      message = `刪 ${key}（remove）：${where}。比了 ${seen} 格找到 ${key}，把它拿掉。`;
    } else if (found >= 0) {
      message = `加 ${key}（add）：${where}。比了 ${seen} 格發現 ${key} 已經在了，不用再加。`;
    } else {
      bucket.push(key);
      size++;
      marked = bucket.length - 1;
      message = `加 ${key}（add）：${where}。比了 ${seen} 格，桶裡沒有 ${key}，放進去。`;
    }

    frames.push({
      rows: [opRow, ...bucketRows(buckets, index, marked)],
      message,
    });

    if (size > buckets.length) {
      const oldBuckets = buckets;
      buckets = [];
      for (let i = 0; i < oldBuckets.length * 2; i++) {
        buckets.push([]);
      }
      for (const oldBucket of oldBuckets) {
        for (const stored of oldBucket) {
          const target = stored % buckets.length;
          buckets[target].push(stored);
          looked++;
          moved++;
        }
      }
      frames.push({
        rows: [opRow, ...bucketRows(buckets, 0, -1)],
        message: `現在存了 ${size} 個數，比桶數 ${oldBuckets.length} 多：桶數加倍成 ${buckets.length}，把 ${size} 個數照「% ${buckets.length}」重新分配，每個桶又變短了。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), ...bucketRows(buckets, 0, -1)],
    message: `${results.length} 次「有」依序回傳 ${results.join("、")}。每次只比一個桶，加上加倍時重新分配的 ${moved} 格，一共只看了 ${looked} 格。`,
  });
  return frames;
}

export function hashMapList(ops: string[]) {
  const frames: Frame[] = [];
  const entries: Entry[] = [];
  const results: number[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", [])],
    message: "每筆資料寫成「鍵→值」，全部放在一個清單。「放」是 put、「拿」是 get、「刪」是 remove，每次都得從頭一格一格比。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const numbers = text.split(",").map(Number);
    const key = numbers[0];
    const value = numbers[1];
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "拿") {
      let hit = false;
      let result = -1;
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        looked++;
        let message = `拿 ${key}（get）：位置 ${i} 的鍵是 ${entry.key}，不是 ${key}，看下一格。`;
        if (entry.key === key) {
          hit = true;
          result = entry.value;
          message = `拿 ${key}（get）：位置 ${i} 的鍵就是 ${key}，找到了，回傳它的值 ${result}。`;
        } else if (i === entries.length - 1) {
          message = `拿 ${key}（get）：位置 ${i} 的鍵是 ${entry.key}，也不是，整個清單都比完了，回傳 -1。`;
        }
        frames.push({
          rows: [opRow, row("清單", arrowCells(entries), { pointers: { 目前: i }, rangeEnd: i })],
          message,
        });
        if (hit) {
          break;
        }
      }
      results.push(result);
      continue;
    }

    const found = entries.findIndex((entry) => entry.key === key);
    const seen = scanned(found, entries.length);
    looked += seen;
    let marked = found;
    let message = "";

    if (name === "刪") {
      entries.splice(found, 1);
      marked = -1;
      message = `刪 ${key}（remove）：從頭比了 ${seen} 格找到鍵 ${key}，把它拿掉，後面的 ${entries.length - found} 筆往前補。`;
    } else if (found >= 0) {
      entries[found].value = value;
      message = `放 ${text}（put）：從頭比了 ${seen} 格找到鍵 ${key}，把它的值改成 ${value}。`;
    } else {
      entries.push({ key, value });
      marked = entries.length - 1;
      message = `放 ${text}（put）：從頭比了 ${seen} 格，清單裡沒有鍵 ${key}，放到最後面。`;
    }

    frames.push({
      rows: [opRow, row("清單", arrowCells(entries), { pointers: pointAt(marked) })],
      message,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", arrowCells(entries))],
    message: `${results.length} 次「拿」依序回傳 ${results.join("、")}。每次都從頭一格一格比，一共看了 ${looked} 格。`,
  });
  return frames;
}

export function hashMapBuckets(ops: string[]) {
  const frames: Frame[] = [];
  let buckets: Entry[][] = [[], []];
  const results: number[] = [];
  let size = 0;
  let looked = 0;
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), ...bucketRows(buckets.map(arrowCells), 0, -1)],
    message: "每個桶一列，「鍵→值」放進「鍵 % 桶數」那個桶，查的時候只看那一桶。題解從 8 個桶開始，這裡為了示範先只開 2 個。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const numbers = text.split(",").map(Number);
    const key = numbers[0];
    const value = numbers[1];
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    const index = key % buckets.length;
    const bucket = buckets[index];
    const found = bucket.findIndex((entry) => entry.key === key);
    const seen = scanned(found, bucket.length);
    looked += seen;
    const where = `${key} % ${buckets.length} = ${index}，只看桶 ${index}`;
    let marked = found;
    let message = "";

    if (name === "拿" && found >= 0) {
      results.push(bucket[found].value);
      message = `拿 ${key}（get）：${where}。比了 ${seen} 格找到鍵 ${key}，回傳它的值 ${bucket[found].value}。`;
    } else if (name === "拿") {
      results.push(-1);
      message = `拿 ${key}（get）：${where}。比了 ${seen} 格，桶裡沒有鍵 ${key}，回傳 -1。`;
    } else if (name === "刪") {
      bucket.splice(found, 1);
      size--;
      marked = -1;
      message = `刪 ${key}（remove）：${where}。比了 ${seen} 格找到鍵 ${key}，把它拿掉。`;
    } else if (found >= 0) {
      bucket[found].value = value;
      message = `放 ${text}（put）：${where}。比了 ${seen} 格找到鍵 ${key}，把它的值改成 ${value}。`;
    } else {
      bucket.push({ key, value });
      size++;
      marked = bucket.length - 1;
      message = `放 ${text}（put）：${where}。比了 ${seen} 格，桶裡沒有鍵 ${key}，放進去。`;
    }

    frames.push({
      rows: [opRow, ...bucketRows(buckets.map(arrowCells), index, marked)],
      message,
    });

    if (size > buckets.length) {
      const oldBuckets = buckets;
      buckets = [];
      for (let i = 0; i < oldBuckets.length * 2; i++) {
        buckets.push([]);
      }
      for (const oldBucket of oldBuckets) {
        for (const entry of oldBucket) {
          const target = entry.key % buckets.length;
          buckets[target].push(entry);
          looked++;
          moved++;
        }
      }
      frames.push({
        rows: [opRow, ...bucketRows(buckets.map(arrowCells), 0, -1)],
        message: `現在存了 ${size} 筆，比桶數 ${oldBuckets.length} 多：桶數加倍成 ${buckets.length}，把 ${size} 筆照「鍵 % ${buckets.length}」重新分配，每個桶又變短了。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), ...bucketRows(buckets.map(arrowCells), 0, -1)],
    message: `${results.length} 次「拿」依序回傳 ${results.join("、")}。每次只比一個桶，加上加倍時重新分配的 ${moved} 格，一共只看了 ${looked} 格。`,
  });
  return frames;
}
