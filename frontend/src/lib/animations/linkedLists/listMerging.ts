import { Cell, Frame, row } from "../types";
import { linkedRow, positions } from "./rows";

export function addAsIntegers(first: number[], second: number[]) {
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

export function addDigitByDigit(first: number[], second: number[]) {
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

export function mergeByInsert(first: number[], second: number[]) {
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

export function mergeByTail(first: number[], second: number[]) {
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
