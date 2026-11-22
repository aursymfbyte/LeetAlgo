import { Cell, Frame, row } from "../types";
import { linkedRow, positions, spaced } from "./rows";

function reversePart(list: number[], start: number, end: number) {
  let left = start;
  let right = end;
  while (left < right) {
    const kept = list[left];
    list[left] = list[right];
    list[right] = kept;
    left++;
    right--;
  }
}

export function reverseGroupsByArray(values: number[], size: number) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...values, "空"];
  const copied: number[] = [];
  const order: number[] = [];
  let steps = 0;

  for (let node = 0; node < values.length; node++) {
    copied.push(values[node]);
    steps++;
    frames.push({
      rows: [
        linkedRow("串列", cells, { pointers: { 目前: node } }),
        row("陣列", copied),
        linkedRow("新順序", order),
      ],
      message: `在串列上直接翻不好寫，所以先從頭走一遍，把節點一個一個放進陣列：放進 ${values[node]}。`,
    });
  }

  for (let start = 0; start + size <= copied.length; start += size) {
    const end = start + size - 1;
    reversePart(copied, start, end);
    frames.push({
      rows: [
        linkedRow("串列", cells),
        row("陣列", copied, { rangeStart: start, rangeEnd: end }),
        linkedRow("新順序", order),
      ],
      message: `陣列可以直接用位置存取，把位置 ${start} 到 ${end} 這一組倒過來。後面不滿 ${size} 個的就不動。`,
    });
  }

  for (let index = 0; index < copied.length; index++) {
    order.push(copied[index]);
    steps++;
    frames.push({
      rows: [
        linkedRow("串列", cells),
        row("陣列", copied, { pointers: { 目前: index } }),
        linkedRow("新順序", order, { pointers: { 尾: order.length - 1 } }),
      ],
      message: `照陣列的順序把節點重新接起來：把 ${copied[index]} 接到新順序的最後面。`,
    });
  }

  frames.push({
    rows: [
      linkedRow("串列", cells),
      row("陣列", copied),
      linkedRow("新順序", [...order, "空"], { answer: positions(0, order.length - 1) }),
    ],
    message: `答案是 ${order.join("→")}。放進陣列、重新接起來一共走了 ${steps} 步，還額外用了 ${copied.length} 格的陣列。`,
  });
  return frames;
}

export function reverseGroupsInPlace(values: number[], size: number) {
  const frames: Frame[] = [];
  let steps = 0;

  let length = 0;
  for (let node = 0; node < values.length; node++) {
    length++;
    steps++;
    frames.push({
      rows: [
        linkedRow("串列", [...values, "空"], { pointers: { 目前: node } }),
        linkedRow("已反轉", []),
        linkedRow("還沒反轉", []),
      ],
      message: `先走一遍數長度，才知道後面還夠不夠 ${size} 個：數到第 ${length} 個。`,
    });
  }

  const done: Cell[] = ["哨兵"];
  const rest: Cell[] = [...values, "空"];
  while (length >= size) {
    const before = done.length - 1;
    const reversed: Cell[] = ["空"];
    frames.push({
      rows: [
        linkedRow("串列", done, { pointers: { 段前: before } }),
        linkedRow("已反轉", reversed, { pointers: { 前: 0 } }),
        linkedRow("還沒反轉", rest, { pointers: { 目前: 0 } }),
      ],
      message: `還有 ${length} 個節點，夠 ${size} 個，翻這一組。「段前」停在這組的前一個節點不動，「目前」從 ${rest[0]} 開始反轉 ${size} 個，「前」一開始是空的。`,
    });
    length -= size;

    for (let count = 0; count < size; count++) {
      const node = rest[0];
      const target = reversed[0];
      rest.shift();
      reversed.unshift(node);
      steps++;
      frames.push({
        rows: [
          linkedRow("串列", done, { pointers: { 段前: before } }),
          linkedRow("已反轉", reversed, { pointers: { 前: 0 } }),
          linkedRow("還沒反轉", rest, { pointers: { 目前: 0 } }),
        ],
        message: `把 ${node} 改成指向${spaced(target)}，${node} 變成已反轉那一段的頭。「前」移到 ${node}，「目前」移到${spaced(rest[0])}。`,
      });
    }

    reversed.pop();
    const head = reversed[0];
    const tail = reversed[reversed.length - 1];
    done.push(...reversed);
    frames.push({
      rows: [
        linkedRow("串列", [...done, ...rest], { pointers: { 段前: done.length - 1 } }),
        linkedRow("已反轉", []),
        linkedRow("還沒反轉", []),
      ],
      message: `這組翻好了，接回去：原本的開頭 ${tail} 變成組尾，接上後面的${spaced(rest[0])}；前一個節點接上新的開頭 ${head}。「段前」移到 ${tail}。`,
    });
  }

  const result = [...done, ...rest];
  const answer = result.slice(1, values.length + 1);
  frames.push({
    rows: [
      linkedRow("串列", result, { answer: positions(1, values.length) }),
      linkedRow("已反轉", []),
      linkedRow("還沒反轉", []),
    ],
    message: `剩下 ${length} 個節點，不到 ${size} 個，保持原樣。答案是 ${answer.join("→")}。數長度加反轉一共走了 ${steps} 步，沒有用到額外的陣列。`,
  });
  return frames;
}

export function reverseBetweenByArray(values: number[], left: number, right: number) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...values, "空"];
  const copied: number[] = [];
  let steps = 0;

  for (let node = 0; node < values.length; node++) {
    copied.push(values[node]);
    steps++;
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 目前: node } }), row("陣列", copied)],
      message: `在串列上直接翻不好寫，所以先從頭走一遍，把每個節點的值抄到陣列：抄下 ${values[node]}。`,
    });
  }

  const start = left - 1;
  const end = right - 1;
  reversePart(copied, start, end);
  frames.push({
    rows: [linkedRow("串列", cells), row("陣列", copied, { rangeStart: start, rangeEnd: end })],
    message: `第 ${left} 到第 ${right} 個節點在陣列的位置 ${start} 到 ${end}。陣列可以直接用位置存取，把這一段倒過來。`,
  });

  for (let node = 0; node < values.length; node++) {
    cells[node] = copied[node];
    steps++;
    frames.push({
      rows: [
        linkedRow("串列", cells, { pointers: { 目前: node } }),
        row("陣列", copied, { pointers: { 目前: node } }),
      ],
      message: `再從頭走一遍，把陣列的值照順序寫回節點：這個節點寫成 ${copied[node]}。`,
    });
  }

  frames.push({
    rows: [linkedRow("串列", cells, { answer: positions(start, end) }), row("陣列", copied)],
    message: `第 ${left} 到第 ${right} 個節點倒過來了，答案是 ${copied.join("→")}。串列走了兩遍共 ${steps} 步，還額外用了 ${copied.length} 格的陣列。`,
  });
  return frames;
}

export function reverseBetweenInPlace(values: number[], left: number, right: number) {
  const frames: Frame[] = [];
  const cells: Cell[] = ["哨兵", ...values, "空"];
  let before = 0;
  let steps = 0;

  frames.push({
    rows: [
      linkedRow("串列", cells, { pointers: { 段前: before } }),
      linkedRow("已反轉", []),
      linkedRow("還沒反轉", []),
    ],
    message: `在頭的前面加一個哨兵節點。要反轉第 ${left} 到第 ${right} 個節點，先讓「段前」從哨兵走 ${left - 1} 步，停在這一段的前一個節點。`,
  });

  for (let step = 1; step < left; step++) {
    before++;
    steps++;
    frames.push({
      rows: [
        linkedRow("串列", cells, { pointers: { 段前: before } }),
        linkedRow("已反轉", []),
        linkedRow("還沒反轉", []),
      ],
      message: `「段前」往後走第 ${step} 步，到節點 ${cells[before]}。`,
    });
  }

  const done = cells.slice(0, before + 1);
  const rest = cells.slice(before + 1);
  const reversed: Cell[] = ["空"];
  frames.push({
    rows: [
      linkedRow("串列", done, { pointers: { 段前: before } }),
      linkedRow("已反轉", reversed, { pointers: { 前: 0 } }),
      linkedRow("還沒反轉", rest, { pointers: { 目前: 0 } }),
    ],
    message: `「段前」停在這裡不動。「目前」從它的下一個節點 ${rest[0]} 開始，「前」一開始是空的，接下來反轉 ${right - left + 1} 個節點。`,
  });

  for (let count = left; count <= right; count++) {
    const node = rest[0];
    const target = reversed[0];
    rest.shift();
    reversed.unshift(node);
    steps++;
    frames.push({
      rows: [
        linkedRow("串列", done, { pointers: { 段前: before } }),
        linkedRow("已反轉", reversed, { pointers: { 前: 0 } }),
        linkedRow("還沒反轉", rest, { pointers: { 目前: 0 } }),
      ],
      message: `把 ${node} 改成指向${spaced(target)}，${node} 變成已反轉那一段的頭。「前」移到 ${node}，「目前」移到${spaced(rest[0])}。`,
    });
  }

  reversed.pop();
  const head = reversed[0];
  const tail = reversed[reversed.length - 1];
  const result = [...done, ...reversed, ...rest];
  const answer = result.slice(1, values.length + 1);
  frames.push({
    rows: [
      linkedRow("串列", result, { pointers: { 段前: before } }),
      linkedRow("已反轉", []),
      linkedRow("還沒反轉", []),
    ],
    message: `反轉完了，把這一段接回去：原本的開頭 ${tail} 現在是段尾，接上後面的${spaced(rest[0])}；「段前」接上新的開頭 ${head}。`,
  });

  frames.push({
    rows: [
      linkedRow("串列", result, { answer: positions(left, right) }),
      linkedRow("已反轉", []),
      linkedRow("還沒反轉", []),
    ],
    message: `第 ${left} 到第 ${right} 個節點倒過來了，答案是 ${answer.join("→")}。一共只走了 ${steps} 步，沒有用到額外的陣列。`,
  });
  return frames;
}

export function reorderByArray(values: number[]) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...values, "空"];
  const copied: number[] = [];
  const order: number[] = [];
  let steps = 0;

  for (let node = 0; node < values.length; node++) {
    copied.push(values[node]);
    steps++;
    frames.push({
      rows: [
        linkedRow("串列", cells, { pointers: { 目前: node } }),
        row("陣列", copied),
        linkedRow("新順序", order),
      ],
      message: `串列沒辦法直接拿到尾巴的節點，所以先從頭走一遍，把節點一個一個放進陣列：放進 ${values[node]}。`,
    });
  }

  let left = 0;
  let right = copied.length - 1;
  let fromLeft = true;
  while (left <= right) {
    const array = row("陣列", copied, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right });
    let side = "左";
    let move = "左指針往右移";

    if (fromLeft) {
      order.push(copied[left]);
      left++;
    } else {
      order.push(copied[right]);
      right--;
      side = "右";
      move = "右指針往左移";
    }
    fromLeft = !fromLeft;
    steps++;

    const taken = order[order.length - 1];
    frames.push({
      rows: [
        linkedRow("串列", cells),
        array,
        linkedRow("新順序", order, { pointers: { 尾: order.length - 1 } }),
      ],
      message: `陣列可以直接用位置拿節點，左右輪流拿。這次拿${side}邊的 ${taken}，接到新順序的最後面，${move}。`,
    });
  }

  frames.push({
    rows: [
      linkedRow("串列", cells),
      row("陣列", copied),
      linkedRow("新順序", [...order, "空"], { answer: positions(0, order.length - 1) }),
    ],
    message: `重排後是 ${order.join("→")}。放進陣列、重新接起來一共走了 ${steps} 步，還額外用了 ${copied.length} 格的陣列。`,
  });
  return frames;
}

export function reorderInPlace(values: number[]) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...values, "空"];
  const end = values.length;
  let slow = 0;
  let fast = 0;
  let steps = 0;

  frames.push({
    rows: [
      linkedRow("串列", cells, { pointers: { 慢: slow, 快: fast } }),
      linkedRow("已反轉", []),
      linkedRow("還沒反轉", []),
    ],
    message: "第一步先找中間：慢指針每次走一步，快指針每次走兩步，快指針走到底時，慢指針剛好在中間。",
  });

  while (fast < end && fast + 1 < end) {
    slow += 1;
    fast += 2;
    steps++;
    frames.push({
      rows: [
        linkedRow("串列", cells, { pointers: { 慢: slow, 快: fast } }),
        linkedRow("已反轉", []),
        linkedRow("還沒反轉", []),
      ],
      message: `慢指針走一步到 ${cells[slow]}，快指針走兩步到${spaced(cells[fast])}。`,
    });
  }

  const middle = cells[slow];
  const firstHalf = cells.slice(0, slow + 1);
  const reversed: Cell[] = ["空"];
  const rest = cells.slice(slow);
  let note = `快指針走到底了，慢指針停在中間的 ${middle}。第二步從 ${middle} 開始反轉後半段：`;
  while (rest[0] !== "空") {
    const node = rest[0];
    const target = reversed[0];
    rest.shift();
    reversed.unshift(node);
    steps++;
    frames.push({
      rows: [
        linkedRow("串列", [...firstHalf, "空"]),
        linkedRow("已反轉", reversed, { pointers: { 前: 0 } }),
        linkedRow("還沒反轉", rest, { pointers: { 目前: 0 } }),
      ],
      message: `${note}把 ${node} 改成指向${spaced(target)}，${node} 變成已反轉那一段的頭。`,
    });
    note = "";
  }

  reversed.pop();
  const secondHalf = reversed;
  const done: Cell[] = [];
  frames.push({
    rows: [
      linkedRow("串列", [...firstHalf, "空"], { pointers: { 甲: 0 } }),
      linkedRow("已反轉", [...secondHalf, "空"], { pointers: { 乙: 0 } }),
      linkedRow("還沒反轉", []),
    ],
    message: `後半段反轉好了，${middle} 是兩段共同的尾巴。第三步：「甲」從前半段的頭 ${firstHalf[0]}、「乙」從反轉後的頭 ${secondHalf[0]} 出發，一前一後交錯接起來。`,
  });

  while (secondHalf.length > 1) {
    const one = firstHalf[0];
    const two = secondHalf[0];
    firstHalf.shift();
    secondHalf.shift();
    done.push(one, two);
    steps++;
    frames.push({
      rows: [
        linkedRow("串列", [...done, ...firstHalf, "空"], { pointers: { 甲: done.length } }),
        linkedRow("已反轉", [...secondHalf, "空"], { pointers: { 乙: 0 } }),
        linkedRow("還沒反轉", []),
      ],
      message: `${one} 的後面改接 ${two}，${two} 的後面再接回 ${firstHalf[0]}。「甲」移到 ${firstHalf[0]}，「乙」移到 ${secondHalf[0]}。`,
    });
  }

  const result = [...done, ...firstHalf];
  frames.push({
    rows: [
      linkedRow("串列", [...result, "空"], { answer: positions(0, result.length - 1) }),
      linkedRow("已反轉", []),
      linkedRow("還沒反轉", []),
    ],
    message: `「乙」後面沒有節點了，整條已經接好。重排後是 ${result.join("→")}。找中間、反轉、交錯一共只走了 ${steps} 步，沒有用到額外的陣列。`,
  });
  return frames;
}

export function reverseByArray(values: number[]) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...values, "空"];
  const copied: number[] = [];
  let steps = 0;

  for (let node = 0; node < values.length; node++) {
    copied.push(values[node]);
    steps++;
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 目前: node } }), row("陣列", copied)],
      message: `串列不能從尾巴往回走，所以先從頭走一遍，把每個節點的值抄到陣列：抄下 ${values[node]}。`,
    });
  }

  for (let node = 0; node < values.length; node++) {
    const from = copied.length - 1 - node;
    cells[node] = copied[from];
    steps++;
    frames.push({
      rows: [
        linkedRow("串列", cells, { pointers: { 目前: node } }),
        row("陣列", copied, { pointers: { 讀: from } }),
      ],
      message: `再從頭走一遍，陣列從後面往前讀：把位置 ${from} 的 ${copied[from]} 寫進這個節點。`,
    });
  }

  const answer = cells.slice(0, values.length);
  frames.push({
    rows: [linkedRow("串列", cells, { answer: positions(0, values.length - 1) }), row("陣列", copied)],
    message: `反轉後是 ${answer.join("→")}。串列走了兩遍共 ${steps} 步，還額外用了 ${copied.length} 格的陣列。`,
  });
  return frames;
}

export function reverseInPlace(values: number[]) {
  const frames: Frame[] = [];
  const reversed: Cell[] = ["空"];
  const rest: Cell[] = [...values, "空"];
  let steps = 0;

  frames.push({
    rows: [
      linkedRow("已反轉", reversed, { pointers: { 前: 0 } }),
      linkedRow("還沒反轉", rest, { pointers: { 目前: 0 } }),
    ],
    message: "不用陣列，直接改每個節點指的方向。「目前」從頭節點開始，「前」是它前面的節點，一開始是空的。",
  });

  while (rest[0] !== "空") {
    const node = rest[0];
    const target = reversed[0];
    rest.shift();
    reversed.unshift(node);
    steps++;
    frames.push({
      rows: [
        linkedRow("已反轉", reversed, { pointers: { 前: 0 } }),
        linkedRow("還沒反轉", rest, { pointers: { 目前: 0 } }),
      ],
      message: `先記住 ${node} 的下一個是${spaced(rest[0])}，再把 ${node} 改成指向${spaced(target)}。然後「前」移到 ${node}，「目前」移到${spaced(rest[0])}。`,
    });
  }

  const answer = reversed.slice(0, values.length);
  frames.push({
    rows: [
      linkedRow("已反轉", reversed, { pointers: { 前: 0 }, answer: positions(0, values.length - 1) }),
      linkedRow("還沒反轉", rest, { pointers: { 目前: 0 } }),
    ],
    message: `「目前」走到空的，「前」指著的 ${reversed[0]} 就是新的頭。反轉後是 ${answer.join("→")}。只走一遍共 ${steps} 步，沒有用到額外的陣列。`,
  });
  return frames;
}
