import { Cell, Frame, row } from "../types";
import { allPositions } from "./rows";

export function productBrute(numbers: number[]) {
  const frames: Frame[] = [];
  const answer: Cell[] = numbers.map(() => "");
  let multiplied = 0;

  for (let i = 0; i < numbers.length; i++) {
    let product = 1;
    for (let other = 0; other < numbers.length; other++) {
      if (other === i) {
        continue;
      }
      product *= numbers[other];
      multiplied++;
      answer[i] = product;
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 目前: other } }), row("答案", answer, { pointers: { 目前: i } })],
        message: `算位置 ${i} 的答案：跳過自己，把其他的數一個一個乘起來。乘上 ${numbers[other]}，目前是 ${product}。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers), row("答案", answer, { answer: allPositions(answer) })],
    message: `答案是 ${answer.join("、")}。每個位置都把其他的數重新乘一遍，一共做了 ${multiplied} 次乘法。`,
  });
  return frames;
}

export function productTwoPasses(numbers: number[]) {
  const frames: Frame[] = [];
  const answer = numbers.map(() => 1);
  const shown: Cell[] = numbers.map(() => "");
  let multiplied = 0;

  let left = 1;
  for (let i = 0; i < numbers.length; i++) {
    answer[i] = left;
    left *= numbers[i];
    multiplied++;
    shown[i] = answer[i];
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 目前: i } }), row("答案", shown, { pointers: { 目前: i } })],
      message: `第一趟由左往右：位置 ${i} 左邊所有數的乘積是 ${answer[i]}，先寫進答案。再把 ${numbers[i]} 乘進左邊乘積，變成 ${left}。`,
    });
  }

  let right = 1;
  for (let i = numbers.length - 1; i >= 0; i--) {
    const rightSide = right;
    answer[i] *= right;
    right *= numbers[i];
    multiplied += 2;
    shown[i] = answer[i];
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 目前: i } }), row("答案", shown, { pointers: { 目前: i } })],
      message: `第二趟由右往左：位置 ${i} 右邊所有數的乘積是 ${rightSide}，乘進答案變成 ${answer[i]}。再把 ${numbers[i]} 乘進右邊乘積，變成 ${right}。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers), row("答案", shown, { answer: allPositions(shown) })],
    message: `答案是 ${answer.join("、")}。左邊和右邊的乘積都是邊走邊累乘，陣列只走兩趟，一共只做了 ${multiplied} 次乘法。`,
  });
  return frames;
}

export function moveZeroesSwap(numbers: number[]) {
  const frames: Frame[] = [];
  const cells = [...numbers];
  let compared = 0;
  let written = 0;

  for (let pass = 0; pass < cells.length - 1; pass++) {
    const last = cells.length - 1 - pass;
    for (let left = 0; left < last; left++) {
      const right = left + 1;
      compared++;

      if (cells[left] === 0 && cells[right] !== 0) {
        cells[left] = cells[right];
        cells[right] = 0;
        written += 2;
        frames.push({
          rows: [row("陣列", cells, { pointers: { 左: left, 右: right }, rangeEnd: last })],
          message: `相鄰兩格比較：原本左邊是 0、右邊是 ${cells[left]}，兩格交換，讓 0 往後退一格。`,
        });
      } else {
        frames.push({
          rows: [row("陣列", cells, { pointers: { 左: left, 右: right }, rangeEnd: last })],
          message: `相鄰兩格比較：只有左邊是 0、右邊不是 0 才交換。${cells[left]} 和 ${cells[right]} 不用換，看下一組。`,
        });
      }
    }
  }

  frames.push({
    rows: [row("陣列", cells, { answer: allPositions(cells) })],
    message: `0 都換到最後了，結果是 ${cells.join("、")}。一共比較了 ${compared} 次，交換時寫入了 ${written} 次。`,
  });
  return frames;
}

export function moveZeroesWrite(numbers: number[]) {
  const frames: Frame[] = [];
  const cells = [...numbers];
  let write = 0;
  let written = 0;

  for (let read = 0; read < cells.length; read++) {
    const num = cells[read];
    if (num === 0) {
      frames.push({
        rows: [row("陣列", cells, { pointers: { 快: read, 慢: write } })],
        message: `快指針看到 0，跳過。慢指針留在位置 ${write}，等下一個不是 0 的數。`,
      });
      continue;
    }

    cells[write] = num;
    written++;
    frames.push({
      rows: [row("陣列", cells, { pointers: { 快: read, 慢: write } })],
      message: `快指針看到 ${num}，不是 0，寫到慢指針的位置 ${write}，慢指針再往右一格。`,
    });
    write++;
  }

  for (let i = write; i < cells.length; i++) {
    cells[i] = 0;
    written++;
    frames.push({
      rows: [row("陣列", cells, { pointers: { 目前: i } })],
      message: `不是 0 的數都照原本的順序搬到前面了，剩下的位置補 0：把位置 ${i} 寫成 0。`,
    });
  }

  frames.push({
    rows: [row("陣列", cells, { answer: allPositions(cells) })],
    message: `結果是 ${cells.join("、")}。陣列只走一遍，每一格最多寫一次，一共只寫入了 ${written} 次。`,
  });
  return frames;
}

function mergeRows(first: string, second: string, index: number, source: number, letters: string[]) {
  const answer = [...letters];
  while (answer.length < first.length + second.length) {
    answer.push("");
  }

  const rows = [
    row("字串一", [...first], { rangeStart: index }),
    row("字串二", [...second], { rangeStart: index }),
    row("答案", answer, { indexed: false }),
  ];
  rows[source].pointers = { 目前: index };
  return rows;
}

function mergedFrame(first: string, second: string, merged: string, summary: string) {
  const letters = [...merged];
  return {
    rows: [
      row("字串一", [...first], { rangeEnd: -1 }),
      row("字串二", [...second], { rangeEnd: -1 }),
      row("答案", letters, { indexed: false, answer: allPositions(letters) }),
    ],
    message: `兩個字串都取完了，答案是 ${merged}。${summary}`,
  };
}

export function mergeByConcat(first: string, second: string) {
  const frames: Frame[] = [];
  const words = [first, second];
  const names = ["字串一", "字串二"];
  let result = "";
  let written = 0;
  let i = 0;

  while (i < first.length || i < second.length) {
    for (let source = 0; source < words.length; source++) {
      if (i >= words[source].length) {
        continue;
      }
      const letter = words[source][i];
      let copy = "";

      for (const old of result) {
        copy += old;
        written++;
        frames.push({
          rows: mergeRows(first, second, i, source, [...copy]),
          message: `要接上${names[source]}的 ${letter}，但字串不能直接加長，得建一個新字串：先把舊的 ${old} 抄過去。`,
        });
      }

      copy += letter;
      written++;
      result = copy;
      frames.push({
        rows: mergeRows(first, second, i, source, [...result]),
        message: `把${names[source]}的 ${letter} 放到新字串的最後，答案變成 ${result}。`,
      });
    }
    i++;
  }

  frames.push(mergedFrame(first, second, result, `每接一個字元就把舊的全部重抄，一共寫了 ${written} 個字元。`));
  return frames;
}

export function mergeByAppend(first: string, second: string) {
  const frames: Frame[] = [];
  const result: string[] = [];
  let written = 0;
  let i = 0;

  while (i < first.length || i < second.length) {
    if (i < first.length) {
      result.push(first[i]);
      written++;
      frames.push({
        rows: mergeRows(first, second, i, 0, result),
        message: `第 ${i + 1} 輪：字串一還沒用完，把它的 ${first[i]} 附加到答案尾端，前面的字元不用動。`,
      });
    }
    if (i < second.length) {
      result.push(second[i]);
      written++;
      frames.push({
        rows: mergeRows(first, second, i, 1, result),
        message: `第 ${i + 1} 輪：字串二還沒用完，把它的 ${second[i]} 附加到答案尾端，前面的字元不用動。`,
      });
    }
    i++;
  }

  const merged = result.join("");
  written += result.length;
  frames.push(mergedFrame(first, second, merged, `每個字元只附加一次，最後再一次接成字串，連這次在內一共只寫了 ${written} 個字元。`));
  return frames;
}
