import { Cell, Frame, ProblemAnimation, Row, row } from "./types";

type Entry = { key: number; value: number };
type LfuItem = { key: number; value: number; count: number; used: number };
type LfuNode = { key: number; value: number; freq: number };

function linkedRow(label: string, cells: Cell[], options: Partial<Row> = {}) {
  return row(label, cells, { shape: "linked", indexed: false, ...options });
}

function pointAt(index: number) {
  const pointers: Record<string, number> = {};
  if (index >= 0) {
    pointers["目前"] = index;
  }
  return pointers;
}

function scanned(found: number, length: number) {
  if (found === -1) {
    return length;
  }
  return found + 1;
}

function pairCells(entries: Entry[]) {
  return entries.map((entry) => `${entry.key}=${entry.value}`);
}

function arrowCells(entries: Entry[]) {
  return entries.map((entry) => `${entry.key}→${entry.value}`);
}

function nodeCells(keys: number[]) {
  return keys.map((key) => `${key}→節點`);
}

function tableCells(table: Map<number, number>) {
  const cells: string[] = [];
  for (const [key, value] of table) {
    cells.push(`${key}→${value}`);
  }
  return cells;
}

function lruList(capacity: number, ops: string[]) {
  const frames: Frame[] = [];
  const entries: Entry[] = [];
  const results: number[] = [];
  let looked = 0;
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", [], { indexed: false })],
    message: `快取最多放 ${capacity} 筆。清單每格是「鍵=值」，越前面越近用過，最後面那格最久沒用，滿了就丟它。`,
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const numbers = text.split(",").map(Number);
    const key = numbers[0];
    const value = numbers[1];
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    let title = `${ops[step]}（get）`;
    if (name === "放") {
      title = `${ops[step]}（put）`;
    }

    const found = entries.findIndex((entry) => entry.key === key);
    const seen = scanned(found, entries.length);
    looked += seen;

    if (found >= 0) {
      const entry = entries[found];
      frames.push({
        rows: [opRow, row("清單", pairCells(entries), { indexed: false, pointers: { 目前: found }, rangeEnd: found })],
        message: `${title}：從頭一格一格比，看了 ${seen} 格才找到鍵 ${key}。`,
      });

      let ending = `回傳 ${entry.value}。`;
      if (name === "放") {
        entry.value = value;
        ending = `值也改成 ${value}。`;
      } else {
        results.push(entry.value);
      }
      entries.splice(found, 1);
      entries.unshift(entry);
      moved += found;
      frames.push({
        rows: [opRow, row("清單", pairCells(entries), { indexed: false, pointers: { 目前: 0 } })],
        message: `把它前面的 ${found} 格各往後搬一格，再把它放到最前面，代表剛用過。${ending}`,
      });
      continue;
    }

    if (name === "拿") {
      results.push(-1);
      frames.push({
        rows: [opRow, row("清單", pairCells(entries), { indexed: false })],
        message: `${title}：從頭比到尾，${seen} 格都不是鍵 ${key}，回傳 -1。`,
      });
      continue;
    }

    let dropped = "";
    if (entries.length === capacity) {
      const oldest = entries.pop() as Entry;
      dropped = `快取滿了，丟掉最後面的 ${oldest.key}。`;
    }
    moved += entries.length;
    entries.unshift({ key, value });
    frames.push({
      rows: [opRow, row("清單", pairCells(entries), { indexed: false, pointers: { 目前: 0 } })],
      message: `${title}：從頭比了 ${seen} 格，清單裡沒有鍵 ${key}，是新的。${dropped}原有的往後搬一格，把它放最前面。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", pairCells(entries), { indexed: false })],
    message: `${results.length} 次「拿」依序回傳 ${results.join("、")}。每次都從頭找，再把前面的往後搬，一共看了 ${looked} 格、搬了 ${moved} 格。`,
  });
  return frames;
}

function lruLinkedList(capacity: number, ops: string[]) {
  const frames: Frame[] = [];
  const nodes = new Map<number, Entry>();
  const order: Entry[] = [];
  const results: number[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("雜湊表", [], { indexed: false }), linkedRow("串列", ["頭", "尾"])],
    message: "雜湊表記著每個鍵的節點在哪。串列從頭到尾是最近用過到最久沒用，每個節點其實也記著前一個節點，拆下和接上都只改連結。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const numbers = text.split(",").map(Number);
    const key = numbers[0];
    const value = numbers[1];
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    let title = `${ops[step]}（get）`;
    if (name === "放") {
      title = `${ops[step]}（put）`;
    }

    const node = nodes.get(key);
    looked++;

    if (node !== undefined) {
      let ending = `回傳 ${node.value}。`;
      if (name === "放") {
        node.value = value;
        ending = `值也改成 ${value}。`;
      } else {
        results.push(node.value);
      }
      order.splice(order.indexOf(node), 1);
      order.unshift(node);
      const keys = [...nodes.keys()];
      frames.push({
        rows: [
          opRow,
          row("雜湊表", nodeCells(keys), { indexed: false, pointers: { 目前: keys.indexOf(key) } }),
          linkedRow("串列", ["頭", ...pairCells(order), "尾"], { pointers: { 目前: 1 } }),
        ],
        message: `${title}：查雜湊表一次就找到節點。把它從串列拆下來，接到頭的後面，只改連結，不用搬。${ending}`,
      });
      continue;
    }

    if (name === "拿") {
      results.push(-1);
      frames.push({
        rows: [
          opRow,
          row("雜湊表", nodeCells([...nodes.keys()]), { indexed: false }),
          linkedRow("串列", ["頭", ...pairCells(order), "尾"]),
        ],
        message: `${title}：查雜湊表一次就知道沒有鍵 ${key}，回傳 -1。`,
      });
      continue;
    }

    const added = { key, value };
    nodes.set(key, added);
    order.unshift(added);
    let dropped = "";
    if (nodes.size > capacity) {
      const oldest = order.pop() as Entry;
      nodes.delete(oldest.key);
      dropped = `超過 ${capacity} 筆，尾前面的 ${oldest.key} 最久沒用，拆掉它，也從雜湊表刪掉。`;
    }
    const keys = [...nodes.keys()];
    frames.push({
      rows: [
        opRow,
        row("雜湊表", nodeCells(keys), { indexed: false, pointers: { 目前: keys.indexOf(key) } }),
        linkedRow("串列", ["頭", ...pairCells(order), "尾"], { pointers: { 目前: 1 } }),
      ],
      message: `${title}：查雜湊表一次就知道沒有鍵 ${key}，新節點接到頭的後面。${dropped}`,
    });
  }

  frames.push({
    rows: [
      row("操作", ops, { indexed: false }),
      row("雜湊表", nodeCells([...nodes.keys()]), { indexed: false }),
      linkedRow("串列", ["頭", ...pairCells(order), "尾"]),
    ],
    message: `${results.length} 次「拿」依序回傳 ${results.join("、")}。每次查雜湊表只看 1 格，一共只看了 ${looked} 格，移到最前面也不用搬任何一格。`,
  });
  return frames;
}

function randomSetList(ops: string[]) {
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

function randomSetHashMap(ops: string[]) {
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

function lfuScanRows(opRow: Row, items: LfuItem[], marked: number) {
  const counts = items.map((item) => item.count);
  const times = items.map((item) => item.used);
  return [
    opRow,
    row("清單", pairCells(items), { indexed: false, pointers: pointAt(marked) }),
    row("次數", counts, { indexed: false }),
    row("上次使用", times, { indexed: false }),
  ];
}

function lfuScan(capacity: number, ops: string[]) {
  const frames: Frame[] = [];
  const items: LfuItem[] = [];
  const results: number[] = [];
  let looked = 0;

  frames.push({
    rows: lfuScanRows(row("操作", ops, { indexed: false }), items, -1),
    message: `快取最多放 ${capacity} 筆。清單每格是「鍵=值」；下面兩列是它被用過幾次、上次是第幾個操作用到它。`,
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const numbers = text.split(",").map(Number);
    const key = numbers[0];
    const value = numbers[1];
    const time = step + 1;
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    const found = items.findIndex((item) => item.key === key);
    const seen = scanned(found, items.length);
    looked += seen;

    if (name === "拿" && found === -1) {
      results.push(-1);
      frames.push({
        rows: lfuScanRows(opRow, items, -1),
        message: `拿 ${key}（get）：從頭比到尾，${seen} 格都不是鍵 ${key}，回傳 -1。`,
      });
      continue;
    }

    if (name === "拿") {
      const item = items[found];
      item.count++;
      item.used = time;
      results.push(item.value);
      frames.push({
        rows: lfuScanRows(opRow, items, found),
        message: `拿 ${key}（get）：從頭比了 ${seen} 格找到鍵 ${key}。次數加一變成 ${item.count}，上次使用改成第 ${time} 個操作。回傳 ${item.value}。`,
      });
      continue;
    }

    const added = { key, value, count: 1, used: time };
    if (items.length < capacity) {
      items.push(added);
      frames.push({
        rows: lfuScanRows(opRow, items, items.length - 1),
        message: `放 ${text}（put）：從頭比了 ${seen} 格，清單裡沒有鍵 ${key}。還有空位，放到最後面，次數從 1 開始。`,
      });
      continue;
    }

    let victim = 0;
    for (let i = 1; i < items.length; i++) {
      const fewer = items[i].count < items[victim].count;
      const tied = items[i].count === items[victim].count;
      const older = items[i].used < items[victim].used;
      if (fewer || (tied && older)) {
        victim = i;
      }
    }
    looked += items.length;
    const removed = items[victim].key;
    frames.push({
      rows: lfuScanRows(opRow, items, victim),
      message: `放 ${text}（put）：從頭比了 ${seen} 格沒有鍵 ${key}，快取滿了。再掃 ${items.length} 格找次數最少、其中最久沒用的，是鍵 ${removed}。`,
    });

    items[victim] = added;
    frames.push({
      rows: lfuScanRows(opRow, items, victim),
      message: `把鍵 ${removed} 淘汰，原地換成 ${key}=${value}，次數從 1 開始。`,
    });
  }

  frames.push({
    rows: lfuScanRows(row("操作", ops, { indexed: false }), items, -1),
    message: `${results.length} 次「拿」依序回傳 ${results.join("、")}。每次都從頭找鍵，淘汰時還要整列掃一遍，一共看了 ${looked} 格。`,
  });
  return frames;
}

function pushFront(lists: Map<number, LfuNode[]>, node: LfuNode) {
  if (!lists.has(node.freq)) {
    lists.set(node.freq, []);
  }
  const list = lists.get(node.freq) as LfuNode[];
  list.unshift(node);
}

function lfuListRow(lists: Map<number, LfuNode[]>, freq: number, marked: number) {
  const label = `次數 ${freq}`;
  const list = lists.get(freq);
  if (list === undefined) {
    return linkedRow(label, []);
  }
  const keys = list.map((node) => node.key);
  const at = keys.indexOf(marked);
  if (at === -1) {
    return linkedRow(label, ["頭", ...pairCells(list)]);
  }
  return linkedRow(label, ["頭", ...pairCells(list)], { pointers: { 目前: at + 1 } });
}

function lfuRows(opRow: Row, nodes: Map<number, LfuNode>, lists: Map<number, LfuNode[]>, minFreq: number, marked: number) {
  const keys = [...nodes.keys()];
  return [
    opRow,
    row("雜湊表", nodeCells(keys), { indexed: false, pointers: pointAt(keys.indexOf(marked)) }),
    row("最小次數", [minFreq], { indexed: false }),
    lfuListRow(lists, 1, marked),
    lfuListRow(lists, 2, marked),
  ];
}

function lfuFrequencyLists(capacity: number, ops: string[]) {
  const frames: Frame[] = [];
  const nodes = new Map<number, LfuNode>();
  const lists = new Map<number, LfuNode[]>();
  const results: number[] = [];
  let minFreq = 0;
  let looked = 0;

  frames.push({
    rows: lfuRows(row("操作", ops, { indexed: false }), nodes, lists, minFreq, -1),
    message: "每種使用次數各有一條串列，頭後面是最近用過的，最後面最久沒用，節點也記著前一個節點。雜湊表記鍵的節點在哪，另外記住最小的次數。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const numbers = text.split(",").map(Number);
    const key = numbers[0];
    const value = numbers[1];
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    const node = nodes.get(key);
    looked++;

    if (name === "拿") {
      if (node === undefined) {
        results.push(-1);
        frames.push({
          rows: lfuRows(opRow, nodes, lists, minFreq, key),
          message: `拿 ${key}（get）：查雜湊表一次就知道沒有鍵 ${key}，回傳 -1。`,
        });
        continue;
      }

      const oldFreq = node.freq;
      const oldList = lists.get(oldFreq) as LfuNode[];
      oldList.splice(oldList.indexOf(node), 1);
      let emptied = "";
      if (oldList.length === 0) {
        lists.delete(oldFreq);
        emptied = `次數 ${oldFreq} 的串列空了。`;
        if (minFreq === oldFreq) {
          minFreq++;
          emptied = `次數 ${oldFreq} 的串列空了，最小次數加一變成 ${minFreq}。`;
        }
      }
      node.freq++;
      pushFront(lists, node);
      results.push(node.value);
      frames.push({
        rows: lfuRows(opRow, nodes, lists, minFreq, key),
        message: `拿 ${key}（get）：查雜湊表找到節點，從次數 ${oldFreq} 的串列拆下，接到次數 ${node.freq} 的最前面。${emptied}回傳 ${node.value}。`,
      });
      continue;
    }

    let lead = `放 ${text}（put）：雜湊表沒有鍵 ${key}，還有空位。`;
    if (nodes.size === capacity) {
      const victimList = lists.get(minFreq) as LfuNode[];
      const victim = victimList[victimList.length - 1];
      looked++;
      frames.push({
        rows: lfuRows(opRow, nodes, lists, minFreq, victim.key),
        message: `放 ${text}（put）：雜湊表沒有鍵 ${key}，快取滿了。最小次數是 ${minFreq}，那條串列最後面的 ${victim.key} 最久沒用，直接選它，不用掃。`,
      });

      victimList.pop();
      if (victimList.length === 0) {
        lists.delete(minFreq);
      }
      nodes.delete(victim.key);
      lead = `把 ${victim.key} 拆掉，也從雜湊表刪掉。`;
    }

    const added = { key, value, freq: 1 };
    nodes.set(key, added);
    pushFront(lists, added);
    minFreq = 1;
    frames.push({
      rows: lfuRows(opRow, nodes, lists, minFreq, key),
      message: `${lead}新節點 ${key}=${value} 接到次數 1 的串列最前面，最小次數設成 1。`,
    });
  }

  frames.push({
    rows: lfuRows(row("操作", ops, { indexed: false }), nodes, lists, minFreq, -1),
    message: `${results.length} 次「拿」依序回傳 ${results.join("、")}。找鍵只查雜湊表，淘汰只看最小次數那條串列的尾端，一共只看了 ${looked} 格。`,
  });
  return frames;
}

function circularQueueShift(k: number, ops: string[]) {
  const frames: Frame[] = [];
  const items = new Array<Cell>(k).fill("");
  const results: Cell[] = [];
  let count = 0;
  let written = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("陣列", items), row("回傳", results, { indexed: false })],
    message: `佇列最多放 ${k} 個數，放在長度 ${k} 的陣列裡，隊首固定在位置 0。「回傳」記每個操作回傳什麼。`,
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    let message = "";

    if (name === "放" && count === k) {
      results.push("false");
      message = `放 ${text}（enQueue）：${k} 格都滿了，放不進去，回傳 false。`;
    } else if (name === "放") {
      items[count] = Number(text);
      message = `放 ${text}（enQueue）：寫進隊尾後面的空格，也就是位置 ${count}，回傳 true。`;
      count++;
      written++;
      results.push("true");
    } else if (name === "取出") {
      const front = items[0];
      for (let i = 1; i < count; i++) {
        items[i - 1] = items[i];
        written++;
      }
      items[count - 1] = "";
      count--;
      results.push("true");
      message = `取出（deQueue）：拿走隊首的 ${front}，後面 ${count} 個數各往前搬一格，等於多寫了 ${count} 格。回傳 true。`;
    } else if (name === "看隊首") {
      results.push(items[0]);
      message = `看隊首（Front）：隊首固定在位置 0，回傳 ${items[0]}。`;
    } else {
      results.push(items[count - 1]);
      message = `看隊尾（Rear）：隊尾在位置 ${count - 1}，回傳 ${items[count - 1]}。`;
    }

    frames.push({
      rows: [
        opRow,
        row("陣列", items, { pointers: { 隊首: 0, 隊尾: count - 1 } }),
        row("回傳", results, { indexed: false }),
      ],
      message,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("陣列", items), row("回傳", results, { indexed: false })],
    message: `操作都做完了，回傳值在「回傳」那一列。每次取出都要把後面的數往前搬，一共寫了 ${written} 格。`,
  });
  return frames;
}

function ringCells(items: number[], head: number, count: number) {
  const cells: Cell[] = items.map(() => "");
  for (let offset = 0; offset < count; offset++) {
    const index = (head + offset) % items.length;
    cells[index] = items[index];
  }
  return cells;
}

function circularQueueRing(k: number, ops: string[]) {
  const frames: Frame[] = [];
  const items = new Array<number>(k).fill(0);
  const results: Cell[] = [];
  let head = 0;
  let count = 0;
  let written = 0;

  frames.push({
    rows: [
      row("操作", ops, { indexed: false }),
      row("陣列", ringCells(items, head, count)),
      row("回傳", results, { indexed: false }),
    ],
    message: `陣列固定 ${k} 格，最後一格接回第一格，當成一個環。只記隊首的位置和目前有幾個數，隊尾的位置用算的。`,
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    let message = "";

    if (name === "放" && count === k) {
      results.push("false");
      message = `放 ${text}（enQueue）：個數已經是 ${k}，滿了，回傳 false。`;
    } else if (name === "放") {
      const tail = (head + count) % k;
      items[tail] = Number(text);
      message = `放 ${text}（enQueue）：隊尾的下一格是 (${head} + ${count}) % ${k} = ${tail}，寫進位置 ${tail}，個數加一，回傳 true。`;
      count++;
      written++;
      results.push("true");
    } else if (name === "取出") {
      const front = items[head];
      head = (head + 1) % k;
      count--;
      results.push("true");
      message = `取出（deQueue）：不用搬，隊首往後移一格到位置 ${head}，個數減一，原本的 ${front} 就算不在了。回傳 true。`;
    } else if (name === "看隊首") {
      results.push(items[head]);
      message = `看隊首（Front）：直接讀隊首，也就是位置 ${head}，回傳 ${items[head]}。`;
    } else {
      const rear = (head + count - 1) % k;
      results.push(items[rear]);
      message = `看隊尾（Rear）：隊尾在 (${head} + ${count} - 1) % ${k} = ${rear}，回傳 ${items[rear]}。`;
    }

    const tailAt = (head + count - 1) % k;
    frames.push({
      rows: [
        opRow,
        row("陣列", ringCells(items, head, count), { pointers: { 隊首: head, 隊尾: tailAt } }),
        row("回傳", results, { indexed: false }),
      ],
      message,
    });
  }

  frames.push({
    rows: [
      row("操作", ops, { indexed: false }),
      row("陣列", ringCells(items, head, count)),
      row("回傳", results, { indexed: false }),
    ],
    message: `操作都做完了，回傳值在「回傳」那一列。取出時只移動隊首，放進來才寫一格，一共只寫了 ${written} 格。`,
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

function hashSetList(ops: string[]) {
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

function hashSetBuckets(ops: string[]) {
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

function hashMapList(ops: string[]) {
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

function hashMapBuckets(ops: string[]) {
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

const listMethods: Record<string, string> = {
  尾加: "addAtTail",
  插: "addAtIndex",
  刪: "deleteAtIndex",
  拿: "get",
};

function linkedListFromHead(ops: string[]) {
  const frames: Frame[] = [];
  const list: number[] = [];
  const results: number[] = [];
  let walked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), linkedRow("串列", ["頭"])],
    message: "單向鏈結串列：只記得頭（不存資料的哨兵），每個節點只知道下一個是誰，要到任何位置都得從頭沿著箭頭走。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const numbers = text.split(",").map(Number);
    let index = numbers[0];
    let value = numbers[1];
    if (name === "尾加") {
      index = list.length;
      value = numbers[0];
    }
    const title = `${ops[step]}（${listMethods[name]}）`;
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    walked += index;

    if (name === "拿") {
      results.push(list[index]);
      frames.push({
        rows: [opRow, linkedRow("串列", ["頭", ...list], { pointers: { 目前: index + 1 }, rangeEnd: index + 1 })],
        message: `${title}：從第一個節點出發，沿著箭頭走 ${index} 步才到位置 ${index}，回傳 ${list[index]}。`,
      });
      continue;
    }

    frames.push({
      rows: [opRow, linkedRow("串列", ["頭", ...list], { pointers: { 目前: index }, rangeEnd: index })],
      message: `${title}：目標是位置 ${index}。只記得頭，要從頭沿著箭頭走 ${index} 步，才到它的前一個節點。`,
    });

    if (name === "刪") {
      const removed = list[index];
      list.splice(index, 1);
      frames.push({
        rows: [opRow, linkedRow("串列", ["頭", ...list], { pointers: { 目前: index } })],
        message: `讓這個節點的箭頭跳過 ${removed}，${removed} 就從串列裡消失了。`,
      });
    } else {
      list.splice(index, 0, value);
      frames.push({
        rows: [opRow, linkedRow("串列", ["頭", ...list], { pointers: { 目前: index + 1 } })],
        message: `把 ${value} 接在這個節點後面，只改連結，不用搬其他節點。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), linkedRow("串列", ["頭", ...list])],
    message: `${results.length} 次「拿」依序回傳 ${results.join("、")}。不管目標在哪都從頭走過去，一共走了 ${walked} 步。`,
  });
  return frames;
}

function linkedListBothEnds(ops: string[]) {
  const frames: Frame[] = [];
  const list: number[] = [];
  const results: number[] = [];
  let walked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), linkedRow("串列", ["頭", "尾"])],
    message: "雙向鏈結串列：頭和尾是不存資料的哨兵，每個節點其實也記著前一個節點，所以可以從尾往回走，哪一端近就從哪一端出發。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const numbers = text.split(",").map(Number);
    let index = numbers[0];
    let value = numbers[1];
    if (name === "尾加") {
      index = list.length;
      value = numbers[0];
    }
    const title = `${ops[step]}（${listMethods[name]}）`;
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    const size = list.length;
    let side = "尾";
    let steps = size - index;
    let start = index + 1;
    let end = size + 1;
    if (index < Math.floor(size / 2)) {
      side = "頭";
      steps = index;
      start = 0;
      end = index + 1;
    }
    walked += steps;
    const reached = linkedRow("串列", ["頭", ...list, "尾"], {
      pointers: { 目前: index + 1 },
      rangeStart: start,
      rangeEnd: end,
    });
    const reach = `${title}：目標是位置 ${index}，離${side}比較近，從${side}這一端走 ${steps} 步就到`;

    if (name === "拿") {
      results.push(list[index]);
      frames.push({
        rows: [opRow, reached],
        message: `${reach}，回傳 ${list[index]}。`,
      });
      continue;
    }

    frames.push({
      rows: [opRow, reached],
      message: `${reach}。`,
    });

    if (name === "刪") {
      const removed = list[index];
      list.splice(index, 1);
      frames.push({
        rows: [opRow, linkedRow("串列", ["頭", ...list, "尾"])],
        message: `它記著前後兩個鄰居，讓這兩個鄰居直接連起來，${removed} 就從串列裡消失了。`,
      });
    } else {
      list.splice(index, 0, value);
      frames.push({
        rows: [opRow, linkedRow("串列", ["頭", ...list, "尾"], { pointers: { 目前: index + 1 } })],
        message: `把 ${value} 接在它前面：它記著前一個節點是誰，改這兩個鄰居的連結就好。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), linkedRow("串列", ["頭", ...list, "尾"])],
    message: `${results.length} 次「拿」依序回傳 ${results.join("、")}。每次都從比較近的那一端出發，一共只走了 ${walked} 步。`,
  });
  return frames;
}

function recentCounterScan(times: number[]) {
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

function recentCounterQueue(times: number[]) {
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

function parkingSlots(big: number, medium: number, small: number, ops: string[]) {
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

function parkingCounters(big: number, medium: number, small: number, ops: string[]) {
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

const lruOps = ["放 1,1", "放 2,2", "放 3,3", "拿 1", "放 4,4", "拿 2", "放 3,7", "拿 1", "拿 3"];
const randomSetOps = ["加 5", "加 8", "加 3", "加 6", "加 3", "抽位置 2", "刪 8", "刪 9", "刪 5", "抽位置 1"];
const lfuOps = ["放 1,1", "放 2,2", "放 3,3", "拿 1", "放 4,4", "拿 2", "拿 3", "拿 4", "放 5,5", "拿 1"];
const circularQueueOps = ["放 1", "放 2", "放 3", "放 4", "放 5", "取出", "放 5", "看隊尾", "取出", "看隊首"];
const hashSetOps = ["加 3", "加 5", "加 6", "加 9", "有 9", "有 7", "加 5", "刪 5", "有 5", "有 6"];
const hashMapOps = ["放 1,10", "放 3,30", "放 4,40", "放 7,70", "拿 7", "放 3,35", "拿 3", "刪 1", "拿 1", "拿 7"];
const linkedListOps = ["尾加 1", "尾加 2", "尾加 3", "尾加 4", "尾加 5", "拿 3", "插 4,9", "刪 5", "拿 4", "拿 1"];
const pingTimes = [1, 100, 3001, 3002, 5000, 6100, 6200, 9500];
const parkingOps = ["大車", "小車", "中車", "小車", "大車", "大車", "中車", "小車", "小車"];

export const stage7a: ProblemAnimation[] = [
  {
    problemId: 146,
    brute: lruList(3, lruOps),
    efficient: lruLinkedList(3, lruOps),
  },
  {
    problemId: 380,
    brute: randomSetList(randomSetOps),
    efficient: randomSetHashMap(randomSetOps),
  },
  {
    problemId: 460,
    brute: lfuScan(3, lfuOps),
    efficient: lfuFrequencyLists(3, lfuOps),
  },
  {
    problemId: 622,
    brute: circularQueueShift(4, circularQueueOps),
    efficient: circularQueueRing(4, circularQueueOps),
  },
  {
    problemId: 705,
    brute: hashSetList(hashSetOps),
    efficient: hashSetBuckets(hashSetOps),
  },
  {
    problemId: 706,
    brute: hashMapList(hashMapOps),
    efficient: hashMapBuckets(hashMapOps),
  },
  {
    problemId: 707,
    brute: linkedListFromHead(linkedListOps),
    efficient: linkedListBothEnds(linkedListOps),
  },
  {
    problemId: 933,
    brute: recentCounterScan(pingTimes),
    efficient: recentCounterQueue(pingTimes),
  },
  {
    problemId: 1603,
    brute: parkingSlots(2, 1, 3, parkingOps),
    efficient: parkingCounters(2, 1, 3, parkingOps),
  },
];
