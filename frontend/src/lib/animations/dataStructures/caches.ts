import { Entry, linkedRow, pointAt, scanned } from "./listRows";
import { Frame, Row, row } from "../types";

type LfuItem = { key: number; value: number; count: number; used: number };
type LfuNode = { key: number; value: number; freq: number };

function pairCells(entries: Entry[]) {
  return entries.map((entry) => `${entry.key}=${entry.value}`);
}

function nodeCells(keys: number[]) {
  return keys.map((key) => `${key}→節點`);
}

export function lruList(capacity: number, ops: string[]) {
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

export function lruLinkedList(capacity: number, ops: string[]) {
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

export function lfuScan(capacity: number, ops: string[]) {
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

export function lfuFrequencyLists(capacity: number, ops: string[]) {
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
