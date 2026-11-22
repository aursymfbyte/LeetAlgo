import { Cell, Frame, row } from "../types";
import { linkedRow } from "./listRows";

export function circularQueueShift(k: number, ops: string[]) {
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

export function circularQueueRing(k: number, ops: string[]) {
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

const listMethods: Record<string, string> = {
  尾加: "addAtTail",
  插: "addAtIndex",
  刪: "deleteAtIndex",
  拿: "get",
};

export function linkedListFromHead(ops: string[]) {
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

export function linkedListBothEnds(ops: string[]) {
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
