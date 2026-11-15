import { Cell, Frame, ProblemAnimation, Row, row } from "./types";

function linkedRow(label: string, cells: Cell[], options: Partial<Row> = {}) {
  return row(label, cells, { shape: "linked", indexed: false, ...options });
}

function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
}

function spaced(cell: Cell) {
  if (cell === "空") {
    return "空";
  }
  return ` ${cell}`;
}

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

function addAsIntegers(first: number[], second: number[]) {
  const frames: Frame[] = [];
  const firstCells = [...first, "空"];
  const secondCells = [...second, "空"];
  const sum: Cell[] = ["?", "+", "?", "=", "?"];
  const digits: number[] = [];
  let steps = 0;

  let firstNumber = 0;
  let place = 1;
  for (let node = 0; node < first.length; node++) {
    firstNumber += first[node] * place;
    sum[0] = firstNumber;
    steps++;
    frames.push({
      rows: [
        linkedRow("串列一", firstCells, { pointers: { 目前: node } }),
        linkedRow("串列二", secondCells),
        row("整數", sum, { indexed: false }),
        linkedRow("答案", digits),
      ],
      message: `先把串列一變回整數：這個節點是 ${first[node]}，代表 ${first[node]} × ${place}，目前讀到的整數是 ${firstNumber}。`,
    });
    place *= 10;
  }

  let secondNumber = 0;
  place = 1;
  for (let node = 0; node < second.length; node++) {
    secondNumber += second[node] * place;
    sum[2] = secondNumber;
    steps++;
    frames.push({
      rows: [
        linkedRow("串列一", firstCells),
        linkedRow("串列二", secondCells, { pointers: { 目前: node } }),
        row("整數", sum, { indexed: false }),
        linkedRow("答案", digits),
      ],
      message: `再把串列二變回整數：這個節點是 ${second[node]}，代表 ${second[node]} × ${place}，目前讀到的整數是 ${secondNumber}。`,
    });
    place *= 10;
  }

  const total = firstNumber + secondNumber;
  sum[4] = total;
  steps++;
  frames.push({
    rows: [
      linkedRow("串列一", firstCells),
      linkedRow("串列二", secondCells),
      row("整數", sum, { indexed: false }),
      linkedRow("答案", digits),
    ],
    message: `兩個整數相加：${firstNumber} + ${secondNumber} = ${total}。但題目的串列最多有 100 位，很多程式語言的整數存不下這麼大的數。`,
  });

  let rest = total;
  while (rest > 0) {
    const digit = rest % 10;
    rest = Math.floor(rest / 10);
    digits.push(digit);
    steps++;
    frames.push({
      rows: [
        linkedRow("串列一", firstCells),
        linkedRow("串列二", secondCells),
        row("整數", sum, { indexed: false }),
        linkedRow("答案", [...digits, "空"], { pointers: { 尾: digits.length - 1 } }),
      ],
      message: `再把 ${total} 拆回串列：取出最後一位 ${digit}，做成節點接到答案後面，還沒拆的數字剩 ${rest}。`,
    });
  }

  frames.push({
    rows: [
      linkedRow("串列一", firstCells),
      linkedRow("串列二", secondCells),
      row("整數", sum, { indexed: false }),
      linkedRow("答案", [...digits, "空"], { answer: positions(0, digits.length - 1) }),
    ],
    message: `答案是 ${digits.join("→")}，代表 ${total}。讀節點、相加、拆位數一共做了 ${steps} 步，而且數字太長時整數會存不下。`,
  });
  return frames;
}

function addDigitByDigit(first: number[], second: number[]) {
  const frames: Frame[] = [];
  const firstCells = [...first, "空"];
  const secondCells = [...second, "空"];
  const digits: number[] = [];
  let one = 0;
  let two = 0;
  let carry = 0;
  let steps = 0;

  frames.push({
    rows: [
      linkedRow("串列一", firstCells, { pointers: { 甲: one } }),
      linkedRow("串列二", secondCells, { pointers: { 乙: two } }),
      row("進位", [carry], { indexed: false }),
      linkedRow("答案", ["哨兵", "空"], { pointers: { 尾: 0 } }),
    ],
    message: "串列的頭就是個位數，所以像直式加法一樣從頭逐位相加。用哨兵節點當答案的開頭，算出的每一位接在「尾」的後面。",
  });

  while (one < first.length || two < second.length || carry > 0) {
    const firstRow = linkedRow("串列一", firstCells, { pointers: { 甲: one } });
    const secondRow = linkedRow("串列二", secondCells, { pointers: { 乙: two } });
    const bothDone = one === first.length && two === second.length;
    let total = carry;
    let text = `進位 ${carry}`;
    if (one < first.length) {
      total += first[one];
      text += ` + ${first[one]}`;
      one++;
    }
    if (two < second.length) {
      total += second[two];
      text += ` + ${second[two]}`;
      two++;
    }
    const digit = total % 10;
    carry = Math.floor(total / 10);
    digits.push(digit);
    steps++;

    let intro = `這一位：${text} = ${total}。`;
    if (bothDone) {
      intro = `兩條串列都走完了，但還有進位 ${total}，要再多算一位。`;
    }
    frames.push({
      rows: [
        firstRow,
        secondRow,
        row("進位", [carry], { indexed: false }),
        linkedRow("答案", ["哨兵", ...digits, "空"], { pointers: { 尾: digits.length } }),
      ],
      message: `${intro}個位數 ${digit} 做成節點接到答案後面，進位 ${carry} 留給下一位。`,
    });
  }

  frames.push({
    rows: [
      linkedRow("串列一", firstCells, { pointers: { 甲: one } }),
      linkedRow("串列二", secondCells, { pointers: { 乙: two } }),
      row("進位", [carry], { indexed: false }),
      linkedRow("答案", ["哨兵", ...digits, "空"], { answer: positions(1, digits.length) }),
    ],
    message: `兩條串列都走完，也沒有進位了。答案是 ${digits.join("→")}。每一位只加一次，一共只做了 ${steps} 步，數字再長也不怕整數存不下。`,
  });
  return frames;
}

function removeByLength(values: number[], fromEnd: number) {
  const frames: Frame[] = [];
  const cells: Cell[] = ["哨兵", ...values, "空"];
  let rounds = 0;

  let length = 0;
  for (let node = 1; node <= values.length; node++) {
    length++;
    rounds++;
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 目前: node } })],
      message: `串列不能直接問長度，先從頭走一遍數有幾個節點：數到第 ${length} 個。`,
    });
  }

  const walk = length - fromEnd;
  let node = 0;
  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 目前: node } })],
    message: `一共 ${length} 個節點，要刪倒數第 ${fromEnd} 個。回到頭前面的哨兵節點再走第二遍，走 ${length} - ${fromEnd} = ${walk} 步，會停在要刪的節點前面。`,
  });

  for (let step = 1; step <= walk; step++) {
    node++;
    rounds++;
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 目前: node } })],
      message: `第二遍：走第 ${step} 步，到節點 ${cells[node]}。`,
    });
  }

  const removed = cells[node + 1];
  cells.splice(node + 1, 1);
  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 目前: node }, answer: positions(1, values.length - 1) })],
    message: `${cells[node]} 的下一個就是要刪的 ${removed}，讓 ${cells[node]} 直接指向再下一個節點，${removed} 就刪掉了。串列走了兩遍，迴圈一共跑了 ${rounds} 輪。`,
  });
  return frames;
}

function removeWithGap(values: number[], fromEnd: number) {
  const frames: Frame[] = [];
  const cells: Cell[] = ["哨兵", ...values, "空"];
  const last = values.length;
  let front = 0;
  let back = 0;
  let rounds = 0;

  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 前: front, 後: back } })],
    message: `在頭的前面加一個哨兵節點，前、後兩個指針都從哨兵出發。要刪倒數第 ${fromEnd} 個，先讓前指針自己走 ${fromEnd} 步，拉開距離。`,
  });

  for (let step = 1; step <= fromEnd; step++) {
    front++;
    rounds++;
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 前: front, 後: back } })],
      message: `前指針先走第 ${step} 步，到節點 ${cells[front]}。後指針留在哨兵不動。`,
    });
  }

  while (front < last) {
    front++;
    back++;
    rounds++;
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 前: front, 後: back } })],
      message: `前指針後面還有節點，兩個指針一起往後走一步：前指針到 ${cells[front]}，後指針到 ${cells[back]}，中間一直隔著 ${fromEnd} 步。`,
    });
  }

  const removed = cells[back + 1];
  cells.splice(back + 1, 1);
  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 後: back }, answer: positions(1, values.length - 1) })],
    message: `前指針到了最後一個節點，後指針的下一個就是要刪的 ${removed}。讓 ${cells[back]} 直接指向再下一個節點就刪掉了。只走一遍，迴圈一共只跑了 ${rounds} 輪。`,
  });
  return frames;
}

function mergeByInsert(first: number[], second: number[]) {
  const frames: Frame[] = [];
  const merged = [...first];
  let compared = 0;

  for (let taken = 0; taken < second.length; taken++) {
    const value = second[taken];
    let spot = 0;

    while (spot < merged.length) {
      const node = merged[spot];
      const rows = [
        linkedRow("串列一", [...merged, "空"], { pointers: { 目前: spot } }),
        linkedRow("串列二", [...second.slice(taken), "空"], { pointers: { 拿: 0 } }),
      ];
      compared++;

      if (node > value) {
        frames.push({
          rows,
          message: `拿串列二的 ${value}，從串列一的頭開始找位置：${node} 比 ${value} 大，所以 ${value} 插在 ${node} 的前面。`,
        });
        break;
      }

      let result = "繼續往後找。";
      if (spot === merged.length - 1) {
        result = `後面沒有節點了，${value} 接在最後面。`;
      }
      frames.push({
        rows,
        message: `拿串列二的 ${value}，從串列一的頭開始找位置：${node} 沒有比 ${value} 大，${result}`,
      });
      spot++;
    }

    merged.splice(spot, 0, value);
  }

  frames.push({
    rows: [
      linkedRow("串列一", [...merged, "空"], { answer: positions(0, merged.length - 1) }),
      linkedRow("串列二", ["空"]),
    ],
    message: `串列二拿完了，合併後是 ${merged.join("→")}。每個節點都從頭找位置，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function mergeByTail(first: number[], second: number[]) {
  const frames: Frame[] = [];
  const merged: Cell[] = ["哨兵"];
  const total = first.length + second.length;
  let one = 0;
  let two = 0;
  let compared = 0;

  frames.push({
    rows: [
      linkedRow("串列一", [...first, "空"], { pointers: { 甲: 0 } }),
      linkedRow("串列二", [...second, "空"], { pointers: { 乙: 0 } }),
      linkedRow("合併", merged, { pointers: { 尾: 0 } }),
    ],
    message: "兩條串列都排好了，還沒接的節點裡最小的一定是其中一條的頭。用哨兵節點當開頭，「尾」指著合併結果的最後一個節點。",
  });

  while (one < first.length && two < second.length) {
    const headOne = first[one];
    const headTwo = second[two];
    let result = "";
    compared++;

    if (headOne <= headTwo) {
      merged.push(headOne);
      one++;
      result = `${headOne} 沒有比 ${headTwo} 大，把 ${headOne} 接到「尾」的後面，串列一往後走一格。`;
    } else {
      merged.push(headTwo);
      two++;
      result = `${headTwo} 比較小，把 ${headTwo} 接到「尾」的後面，串列二往後走一格。`;
    }

    frames.push({
      rows: [
        linkedRow("串列一", [...first.slice(one), "空"], { pointers: { 甲: 0 } }),
        linkedRow("串列二", [...second.slice(two), "空"], { pointers: { 乙: 0 } }),
        linkedRow("合併", merged, { pointers: { 尾: merged.length - 1 } }),
      ],
      message: `比較兩條串列的頭 ${headOne} 和 ${headTwo}：${result}`,
    });
  }

  let rest = first.slice(one);
  if (two < second.length) {
    rest = second.slice(two);
  }
  const tail = merged.length - 1;
  merged.push(...rest, "空");
  frames.push({
    rows: [
      linkedRow("串列一", [...first.slice(one), "空"], { rangeEnd: -1 }),
      linkedRow("串列二", [...second.slice(two), "空"], { rangeEnd: -1 }),
      linkedRow("合併", merged, { pointers: { 尾: tail } }),
    ],
    message: `其中一條走完了。另一條剩下的 ${rest.join("→")} 本來就排好了，整段接到「尾」的後面，只改一次指向，不用再比較。`,
  });

  frames.push({
    rows: [
      linkedRow("串列一", [...first.slice(one), "空"], { rangeEnd: -1 }),
      linkedRow("串列二", [...second.slice(two), "空"], { rangeEnd: -1 }),
      linkedRow("合併", merged, { answer: positions(1, total) }),
    ],
    message: `哨兵的下一個節點就是答案的頭，合併後是 ${merged.slice(1, total + 1).join("→")}。每次只比兩條串列的頭，一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function reverseGroupsByArray(values: number[], size: number) {
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

function reverseGroupsInPlace(values: number[], size: number) {
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

function reverseBetweenByArray(values: number[], left: number, right: number) {
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

function reverseBetweenInPlace(values: number[], left: number, right: number) {
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

function cycleNext(node: number, last: number, back: number) {
  if (node === last) {
    return back;
  }
  return node + 1;
}

function cycleBySeenList(values: number[], back: number, conclusion: string) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...values, `回${values[back]}`];
  const last = values.length - 1;
  const seen: number[] = [];
  const seenValues: number[] = [];
  let current = 0;
  let compared = 0;

  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 目前: current } }), row("看過", seenValues, { indexed: false })],
    message: `最後一格「回${values[back]}」代表尾巴接回節點 ${values[back]}。直覺做法：每走到一個節點，就把「看過」清單從頭比一遍，沒看過才記進去。清單現在是空的，直接記下 ${values[current]}。`,
  });

  while (true) {
    const value = values[current];

    for (let index = 0; index < seen.length; index++) {
      compared++;

      if (seen[index] === current) {
        frames.push({
          rows: [
            linkedRow("串列", cells, { pointers: { 目前: current }, answer: [current] }),
            row("看過", seenValues, { indexed: false, pointers: { 比: index }, answer: [index] }),
          ],
          message: `走到 ${value}：它和清單裡的 ${value} 是同一個節點，${conclusion}一共比較了 ${compared} 次，還額外記了 ${seen.length} 個節點。`,
        });
        return frames;
      }

      let result = "繼續比下一個。";
      if (index === seen.length - 1) {
        result = `整個清單都沒有，把 ${value} 記進清單，往下走。`;
      }
      frames.push({
        rows: [
          linkedRow("串列", cells, { pointers: { 目前: current } }),
          row("看過", seenValues, { indexed: false, pointers: { 比: index } }),
        ],
        message: `走到 ${value}：和清單裡的 ${seenValues[index]} 比，不是同一個節點，${result}`,
      });
    }

    seen.push(current);
    seenValues.push(value);
    current = cycleNext(current, last, back);
  }
}

function hasCycleFastSlow(values: number[], back: number) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...values, `回${values[back]}`];
  const last = values.length - 1;
  let slow = 0;
  let fast = 0;
  let compared = 0;

  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 慢: slow, 快: fast } })],
    message: `最後一格「回${values[back]}」代表尾巴接回節點 ${values[back]}。慢指針每次走一步，快指針每次走兩步。如果有環，快指針會在環裡追上慢指針。`,
  });

  do {
    slow = cycleNext(slow, last, back);
    fast = cycleNext(fast, last, back);
    fast = cycleNext(fast, last, back);
    compared++;

    let result = "快指針沒有走到空的，兩個也還沒相遇，繼續走。";
    if (slow === fast) {
      result = "兩個指針相遇了。";
    }
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 慢: slow, 快: fast } })],
      message: `慢指針走一步到 ${values[slow]}，快指針走兩步到 ${values[fast]}。${result}`,
    });
  } while (slow !== fast);

  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 慢: slow, 快: fast }, answer: [slow] })],
    message: `串列沒有環的話，快指針會先走到空的，不可能再和慢指針相遇，所以有環。一共只比較了 ${compared} 次，不用額外記任何節點。`,
  });
  return frames;
}

function cycleEntryFastSlow(values: number[], back: number) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...values, `回${values[back]}`];
  const last = values.length - 1;
  let slow = 0;
  let fast = 0;
  let compared = 0;

  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 慢: slow, 快: fast } })],
    message: `最後一格「回${values[back]}」代表尾巴接回節點 ${values[back]}。先照 141 的做法：慢指針每次走一步，快指針每次走兩步，等它們在環裡相遇。`,
  });

  do {
    slow = cycleNext(slow, last, back);
    fast = cycleNext(fast, last, back);
    fast = cycleNext(fast, last, back);
    compared++;

    let result = "還沒相遇，繼續走。";
    if (slow === fast) {
      result = "兩個指針相遇了，確定有環。";
    }
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 慢: slow, 快: fast } })],
      message: `慢指針走一步到 ${values[slow]}，快指針走兩步到 ${values[fast]}。${result}`,
    });
  } while (slow !== fast);

  let entry = 0;
  compared++;
  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 入口: entry, 慢: slow } })],
    message: `新指針「入口」從頭出發，慢指針留在相遇點 ${values[slow]}。頭到入環點的距離，剛好等於相遇點再繞回入環點的距離（可能多繞幾圈），所以每次各走一步，會在入環點碰面。`,
  });

  while (entry !== slow) {
    entry = cycleNext(entry, last, back);
    slow = cycleNext(slow, last, back);
    compared++;

    let result = "還沒碰面，繼續走。";
    if (entry === slow) {
      result = "碰面了。";
    }
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 入口: entry, 慢: slow } })],
      message: `「入口」走一步到 ${values[entry]}，慢指針走一步到 ${values[slow]}。${result}`,
    });
  }

  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 入口: entry, 慢: slow }, answer: [entry] })],
    message: `兩個指針碰面的 ${values[entry]} 就是入環點。兩個階段一共只比較了 ${compared} 次，不用額外記任何節點。`,
  });
  return frames;
}

function reorderByArray(values: number[]) {
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

function reorderInPlace(values: number[]) {
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

function intersectRows(ownA: number[], ownB: number[], shared: number[], walkers: Record<string, number>) {
  const startB = ownA.length;
  const startShared = startB + ownB.length;
  const pointersA: Record<string, number> = {};
  const pointersB: Record<string, number> = {};
  const pointersShared: Record<string, number> = {};

  for (const name of Object.keys(walkers)) {
    const node = walkers[name];
    if (node < startB) {
      pointersA[name] = node;
    } else if (node < startShared) {
      pointersB[name] = node - startB;
    } else {
      pointersShared[name] = node - startShared;
    }
  }

  const link = `接${shared[0]}`;
  return [
    linkedRow("串列甲", [...ownA, link], { pointers: pointersA }),
    linkedRow("串列乙", [...ownB, link], { pointers: pointersB }),
    linkedRow("共用", [...shared, "空"], { pointers: pointersShared }),
  ];
}

function intersectNext(node: number, startB: number, startShared: number) {
  if (node === startB - 1) {
    return startShared;
  }
  return node + 1;
}

function intersectByRescan(ownA: number[], ownB: number[], shared: number[]) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...ownA, ...ownB, ...shared, "空"];
  const startB = ownA.length;
  const startShared = startB + ownB.length;
  const end = cells.length - 1;
  let compared = 0;

  frames.push({
    rows: intersectRows(ownA, ownB, shared, { 甲: 0, 乙: startB }),
    message: `兩條串列各自走到「接${shared[0]}」之後，就是「共用」那一列的同一批節點。直覺做法：串列甲的每個節點，都把串列乙從頭走一遍，找同一個節點。`,
  });

  let a = 0;
  while (a !== end) {
    let b = startB;

    while (b !== end) {
      const rows = intersectRows(ownA, ownB, shared, { 甲: a, 乙: b });
      compared++;

      if (a === b) {
        rows[2].answer = [a - startShared];
        frames.push({
          rows,
          message: `串列甲走到 ${cells[a]}，串列乙也走到同一個節點 ${cells[b]}，它就是交點。每個節點都把串列乙重走一遍，一共比較了 ${compared} 次。`,
        });
        return frames;
      }

      let result = "串列乙往後走一格。";
      if (b === end - 1) {
        result = "串列乙走完了都沒有，換串列甲的下一個節點，串列乙從頭再來。";
      }
      frames.push({
        rows,
        message: `串列甲的 ${cells[a]} 和串列乙的 ${cells[b]} 比：不是同一個節點，${result}`,
      });
      b = intersectNext(b, startB, startShared);
    }

    a = intersectNext(a, startB, startShared);
  }

  return frames;
}

function intersectBySwitching(ownA: number[], ownB: number[], shared: number[]) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...ownA, ...ownB, ...shared, "空"];
  const startB = ownA.length;
  const startShared = startB + ownB.length;
  const end = cells.length - 1;
  let a = 0;
  let b = startB;
  let compared = 1;
  let moves = 0;

  frames.push({
    rows: intersectRows(ownA, ownB, shared, { 甲: a, 乙: b }),
    message: `兩條串列各自走到「接${shared[0]}」之後，就是「共用」那一列的同一批節點。「甲」「乙」各從自己的頭出發，每次走一步，走到空的就換到另一條的頭。`,
  });

  while (a !== b) {
    let textA = "";
    if (a === end) {
      a = startB;
      textA = `「甲」走完了，換到串列乙的頭 ${cells[a]}`;
    } else {
      a = intersectNext(a, startB, startShared);
      textA = `「甲」走到${spaced(cells[a])}`;
    }

    let textB = "";
    if (b === end) {
      b = 0;
      textB = `「乙」走完了，換到串列甲的頭 ${cells[b]}`;
    } else {
      b = intersectNext(b, startB, startShared);
      textB = `「乙」走到${spaced(cells[b])}`;
    }

    compared++;
    moves++;
    let result = "不是同一個節點，繼續走。";
    if (a === b) {
      result = "是同一個節點，停下來。";
    }
    frames.push({
      rows: intersectRows(ownA, ownB, shared, { 甲: a, 乙: b }),
      message: `${textA}，${textB}。${result}`,
    });
  }

  const rows = intersectRows(ownA, ownB, shared, { 甲: a, 乙: b });
  rows[2].answer = [a - startShared];
  frames.push({
    rows,
    message: `「甲」走過甲獨有、共用、乙獨有，「乙」走過乙獨有、共用、甲獨有，路程一樣長，所以各走 ${moves} 步後同時到 ${cells[a]}，它就是交點。一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function reverseByArray(values: number[]) {
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

function reverseInPlace(values: number[]) {
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

function middleByLength(values: number[]) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...values, "空"];
  let rounds = 0;

  let length = 0;
  for (let node = 0; node < values.length; node++) {
    length++;
    rounds++;
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 目前: node } })],
      message: `串列不能直接問長度，先從頭走一遍數有幾個節點：數到第 ${length} 個。`,
    });
  }

  const half = Math.floor(length / 2);
  let node = 0;
  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 目前: node } })],
    message: `一共 ${length} 個節點，中間節點要從頭走 ${length} ÷ 2 = ${half} 步（有餘數就捨去）。回到頭，再走第二遍。`,
  });

  for (let step = 1; step <= half; step++) {
    node++;
    rounds++;
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 目前: node } })],
      message: `第二遍：走第 ${step} 步，到節點 ${cells[node]}。`,
    });
  }

  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 目前: node }, answer: [node] })],
    message: `走完 ${half} 步停在 ${cells[node]}，它就是中間節點。串列走了兩遍，迴圈一共跑了 ${rounds} 輪。`,
  });
  return frames;
}

function middleFastSlow(values: number[]) {
  const frames: Frame[] = [];
  const cells: Cell[] = [...values, "空"];
  const end = values.length;
  let slow = 0;
  let fast = 0;
  let rounds = 0;

  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 慢: slow, 快: fast } })],
    message: "不用先數長度。慢指針每次走一步，快指針每次走兩步，快指針的速度是兩倍，所以它走到底時，慢指針剛好在中間。",
  });

  while (fast < end && fast + 1 < end) {
    slow += 1;
    fast += 2;
    rounds++;
    frames.push({
      rows: [linkedRow("串列", cells, { pointers: { 慢: slow, 快: fast } })],
      message: `慢指針走一步到 ${cells[slow]}，快指針走兩步到${spaced(cells[fast])}。`,
    });
  }

  frames.push({
    rows: [linkedRow("串列", cells, { pointers: { 慢: slow, 快: fast }, answer: [slow] })],
    message: `快指針已經走到底，慢指針停在 ${cells[slow]}，它就是中間節點。只走一遍，迴圈一共只跑了 ${rounds} 輪。`,
  });
  return frames;
}

const addFirst = [5, 6, 9];
const addSecond = [7, 8];
const removeValues = [1, 2, 3, 4, 5];
const mergeFirst = [1, 3, 5];
const mergeSecond = [2, 4, 6, 7];
const groupValues = [1, 2, 3, 4, 5];
const betweenValues = [1, 2, 3, 4, 5];
const cycleValues = [3, 7, 2, 9, 5];
const entryValues = [3, 7, 2, 9, 5, 4];
const reorderValues = [1, 2, 3, 4, 5];
const ownA = [1, 2];
const ownB = [3, 4, 5, 6];
const shared = [8, 9];
const reverseValues = [1, 2, 3, 4, 5];
const middleValues = [1, 2, 3, 4, 5, 6, 7, 8];

export const stage4a: ProblemAnimation[] = [
  {
    problemId: 2,
    brute: addAsIntegers(addFirst, addSecond),
    efficient: addDigitByDigit(addFirst, addSecond),
  },
  {
    problemId: 19,
    brute: removeByLength(removeValues, 2),
    efficient: removeWithGap(removeValues, 2),
  },
  {
    problemId: 21,
    brute: mergeByInsert(mergeFirst, mergeSecond),
    efficient: mergeByTail(mergeFirst, mergeSecond),
  },
  {
    problemId: 25,
    brute: reverseGroupsByArray(groupValues, 2),
    efficient: reverseGroupsInPlace(groupValues, 2),
  },
  {
    problemId: 92,
    brute: reverseBetweenByArray(betweenValues, 2, 4),
    efficient: reverseBetweenInPlace(betweenValues, 2, 4),
  },
  {
    problemId: 141,
    brute: cycleBySeenList(cycleValues, 1, "又走回看過的節點，所以有環。"),
    efficient: hasCycleFastSlow(cycleValues, 1),
  },
  {
    problemId: 142,
    brute: cycleBySeenList(entryValues, 2, "第一個重複的節點就是入環點。"),
    efficient: cycleEntryFastSlow(entryValues, 2),
  },
  {
    problemId: 143,
    brute: reorderByArray(reorderValues),
    efficient: reorderInPlace(reorderValues),
  },
  {
    problemId: 160,
    brute: intersectByRescan(ownA, ownB, shared),
    efficient: intersectBySwitching(ownA, ownB, shared),
  },
  {
    problemId: 206,
    brute: reverseByArray(reverseValues),
    efficient: reverseInPlace(reverseValues),
  },
  {
    problemId: 876,
    brute: middleByLength(middleValues),
    efficient: middleFastSlow(middleValues),
  },
];
