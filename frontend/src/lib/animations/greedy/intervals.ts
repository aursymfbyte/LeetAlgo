import { Cell, Frame, row } from "../types";
import { positions } from "./rows";

function positionsOf(cells: Cell[], value: Cell) {
  const list: number[] = [];
  for (let index = 0; index < cells.length; index++) {
    if (cells[index] === value) {
      list.push(index);
    }
  }
  return list;
}

function intervalText(interval: number[]) {
  return `${interval[0]}~${interval[1]}`;
}

function intervalCells(intervals: number[][]) {
  return intervals.map(intervalText);
}

export function mergeBrute(intervals: number[][]) {
  const frames: Frame[] = [];
  const list = [...intervals];
  let first = 0;
  let second = 1;
  let compared = 0;

  while (first < list.length - 1) {
    const one = list[first];
    const other = list[second];
    const cells = row("區間", intervalCells(list), { pointers: { 甲: first, 乙: second }, indexed: false });
    const pair = `${intervalText(one)} 和 ${intervalText(other)}`;
    compared++;

    if (one[0] <= other[1] && other[0] <= one[1]) {
      const start = Math.min(one[0], other[0]);
      const end = Math.max(one[1], other[1]);
      frames.push({
        rows: [cells],
        message: `${pair} 有重疊，合併成 ${start}~${end}。合併後可能又和別的區間重疊，所以從頭再找一次。`,
      });
      list[first] = [start, end];
      list.splice(second, 1);
      first = 0;
      second = 1;
    } else {
      frames.push({
        rows: [cells],
        message: `任兩個區間都拿來比一次：${pair} 沒有重疊，換下一組。`,
      });
      second++;
      if (second === list.length) {
        first++;
        second = first + 1;
      }
    }
  }

  const cells = intervalCells(list);
  frames.push({
    rows: [row("區間", cells, { answer: positions(0, list.length - 1), indexed: false })],
    message: `再也找不到重疊的了，剩下 ${list.length} 個區間：${cells.join("、")}。每次合併後都從頭再找，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function mergeSorted(intervals: number[][]) {
  const frames: Frame[] = [];
  const sorted = [...intervals];
  sorted.sort((a, b) => a[0] - b[0]);
  const merged: number[][] = [];
  let compared = 0;

  frames.push({
    rows: [row("區間", intervalCells(intervals), { indexed: false }), row("答案", [], { indexed: false })],
    message: "先依左端點由小到大排序。排序後會重疊的區間一定排在一起，每個區間只要和答案的最後一個區間比。",
  });

  for (let index = 0; index < sorted.length; index++) {
    const start = sorted[index][0];
    const end = sorted[index][1];
    const text = intervalText(sorted[index]);
    const cells = row("區間", intervalCells(sorted), { pointers: { 目前: index }, rangeStart: index, indexed: false });

    if (merged.length === 0) {
      merged.push([start, end]);
      frames.push({
        rows: [cells, row("答案", intervalCells(merged), { pointers: { 最後: 0 }, indexed: false })],
        message: `排序好了。答案還是空的，直接把第一個區間 ${text} 放進答案。`,
      });
      continue;
    }

    const lastIndex = merged.length - 1;
    const last = merged[lastIndex];
    let message = `${text} 的左端點 ${start} 超過答案最後一個區間的右端點 ${last[1]}，沒有重疊，把 ${text} 放進答案。`;
    compared++;

    if (start <= last[1]) {
      const longer = Math.max(last[1], end);
      message = `${text} 的左端點 ${start} 沒有超過答案最後一個區間的右端點 ${last[1]}，有重疊，右端點取較大的 ${longer}，變成 ${last[0]}~${longer}。`;
      merged[lastIndex] = [last[0], longer];
    } else {
      merged.push([start, end]);
    }

    frames.push({
      rows: [cells, row("答案", intervalCells(merged), { pointers: { 最後: merged.length - 1 }, indexed: false })],
      message,
    });
  }

  const answers = intervalCells(merged);
  frames.push({
    rows: [
      row("區間", intervalCells(sorted), { rangeEnd: -1, indexed: false }),
      row("答案", answers, { answer: positions(0, merged.length - 1), indexed: false }),
    ],
    message: `合併後剩下 ${merged.length} 個區間：${answers.join("、")}。排序後只要掃一遍，掃描一共只比較了 ${compared} 次。`,
  });
  return frames;
}

export function eraseBrute(intervals: number[][]) {
  const frames: Frame[] = [];
  const count = intervals.length;
  const cells = intervalCells(intervals);
  const choices = intervals.map(() => "留");
  let best = 0;
  let bestChoices: string[] = [];
  let tried = 0;
  let compared = 0;

  function findClash() {
    for (let first = 0; first < count; first++) {
      for (let second = first + 1; second < count; second++) {
        if (choices[first] === "留" && choices[second] === "留") {
          compared++;
          if (intervals[first][0] < intervals[second][1] && intervals[second][0] < intervals[first][1]) {
            return `${cells[first]} 和 ${cells[second]} 重疊`;
          }
        }
      }
    }
    return "";
  }

  function choose(index: number) {
    if (index < count) {
      choices[index] = "留";
      choose(index + 1);
      choices[index] = "拿掉";
      choose(index + 1);
      return;
    }

    const kept = positionsOf(choices, "留").length;
    const clash = findClash();
    let result = `但 ${clash}，不行。`;
    tried++;

    if (clash === "") {
      if (kept > best) {
        best = kept;
        bestChoices = [...choices];
      }
      result = `沒有重疊，目前最多留 ${best} 個。`;
    }
    frames.push({
      rows: [row("區間", cells, { indexed: false }), row("選擇", choices, { indexed: false })],
      message: `每個區間都選留或拿掉，每一種選法都檢查：這種留下 ${kept} 個，${result}`,
    });
  }

  choose(0);

  frames.push({
    rows: [
      row("區間", cells, { answer: positionsOf(bestChoices, "留"), indexed: false }),
      row("選擇", bestChoices, { indexed: false }),
    ],
    message: `最多能留 ${best} 個，最少拿掉 ${count} - ${best} = ${count - best} 個。${count} 個區間就要試 ${tried} 種選法，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function eraseSorted(intervals: number[][]) {
  const frames: Frame[] = [];
  const sorted = [...intervals];
  sorted.sort((a, b) => a[1] - b[1]);
  const count = sorted.length;
  const cells = intervalCells(sorted);
  const results = sorted.map(() => "?");
  let kept = 1;
  let lastKept = 0;
  let compared = 0;

  frames.push({
    rows: [row("區間", intervalCells(intervals), { indexed: false }), row("結果", results, { indexed: false })],
    message: "先依右端點由小到大排序。右端點越小，留給後面區間的空間越大，所以從右端點最小的開始留。",
  });

  results[0] = "留";
  frames.push({
    rows: [row("區間", cells, { pointers: { 目前: 0 }, indexed: false }), row("結果", results, { indexed: false })],
    message: `排序好了。第一個區間 ${cells[0]} 的右端點最小，一定留下，記住它的右端點 ${sorted[0][1]}。`,
  });

  for (let index = 1; index < count; index++) {
    const start = sorted[index][0];
    const lastEnd = sorted[lastKept][1];
    const pointers = { 上個: lastKept, 目前: index };
    let message = `${cells[index]} 的左端點 ${start} 小於上一個留下的右端點 ${lastEnd}，重疊了，拿掉。`;
    compared++;

    if (start >= lastEnd) {
      results[index] = "留";
      kept++;
      lastKept = index;
      message = `${cells[index]} 的左端點 ${start} 沒有小於上一個留下的右端點 ${lastEnd}，不重疊，留下，右端點改記 ${sorted[index][1]}。`;
    } else {
      results[index] = "拿掉";
    }

    frames.push({
      rows: [row("區間", cells, { pointers, indexed: false }), row("結果", results, { indexed: false })],
      message,
    });
  }

  frames.push({
    rows: [
      row("區間", cells, { answer: positionsOf(results, "留"), indexed: false }),
      row("結果", results, { indexed: false }),
    ],
    message: `留下 ${kept} 個，最少拿掉 ${count} - ${kept} = ${count - kept} 個。排序後每個區間只和上一個留下的比，掃描一共只比較了 ${compared} 次。`,
  });
  return frames;
}

export function arrowsBrute(balloons: number[][]) {
  const frames: Frame[] = [];
  const count = balloons.length;
  const cells = intervalCells(balloons);
  const shots: Cell[] = balloons.map(() => "不射");
  let best = Infinity;
  let bestShots: Cell[] = [];
  let tried = 0;
  let compared = 0;

  function findMissed(arrows: number[]) {
    for (const balloon of balloons) {
      let hit = false;
      for (const arrow of arrows) {
        compared++;
        if (balloon[0] <= arrow && arrow <= balloon[1]) {
          hit = true;
          break;
        }
      }
      if (!hit) {
        return intervalText(balloon);
      }
    }
    return "";
  }

  function choose(index: number) {
    if (index < count) {
      shots[index] = balloons[index][1];
      choose(index + 1);
      shots[index] = "不射";
      choose(index + 1);
      return;
    }

    const arrows: number[] = [];
    for (let balloon = 0; balloon < count; balloon++) {
      if (shots[balloon] !== "不射") {
        arrows.push(balloons[balloon][1]);
      }
    }
    const missed = findMissed(arrows);
    let result = `${missed} 沒被射到，不行。`;
    tried++;

    if (missed === "") {
      if (arrows.length < best) {
        best = arrows.length;
        bestShots = [...shots];
      }
      result = `氣球全破，目前最少 ${best} 支。`;
    }
    frames.push({
      rows: [row("氣球", cells, { indexed: false }), row("箭", shots, { indexed: false })],
      message: `每個氣球的右端點都選射或不射，每一種射法都試：這種射 ${arrows.length} 支，${result}`,
    });
  }

  choose(0);

  const used: number[] = [];
  for (let index = 0; index < count; index++) {
    if (bestShots[index] !== "不射") {
      used.push(index);
    }
  }
  frames.push({
    rows: [row("氣球", cells, { indexed: false }), row("箭", bestShots, { answer: used, indexed: false })],
    message: `最少要 ${best} 支箭。${count} 個氣球就要試 ${tried} 種射法，每一種都要檢查氣球破了沒，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function arrowsSorted(balloons: number[][]) {
  const frames: Frame[] = [];
  const sorted = [...balloons];
  sorted.sort((a, b) => a[1] - b[1]);
  const cells = intervalCells(sorted);
  const shots: Cell[] = sorted.map(() => "?");
  let arrows = 1;
  let position = sorted[0][1];
  let compared = 0;

  frames.push({
    rows: [row("氣球", intervalCells(balloons), { indexed: false }), row("中箭位置", shots, { indexed: false })],
    message: "先依右端點由小到大排序。箭射在氣球的右端點，是還射得到它、又最有機會射到後面氣球的位置。",
  });

  shots[0] = position;
  frames.push({
    rows: [row("氣球", cells, { pointers: { 目前: 0 }, indexed: false }), row("中箭位置", shots, { indexed: false })],
    message: `排序好了。第一支箭射在第一個氣球 ${cells[0]} 的右端點 ${position}。`,
  });

  for (let index = 1; index < sorted.length; index++) {
    const start = sorted[index][0];
    let message = `${cells[index]} 的左端點 ${start} 沒有超過箭的位置 ${position}，這支箭也射得到它，不用多射。`;
    compared++;

    if (start > position) {
      arrows++;
      message = `${cells[index]} 的左端點 ${start} 超過箭的位置 ${position}，射不到，要再射一支，射在它的右端點 ${sorted[index][1]}，目前 ${arrows} 支。`;
      position = sorted[index][1];
    }
    shots[index] = position;

    frames.push({
      rows: [
        row("氣球", cells, { pointers: { 目前: index }, rangeStart: index, indexed: false }),
        row("中箭位置", shots, { indexed: false }),
      ],
      message,
    });
  }

  frames.push({
    rows: [
      row("氣球", cells, { indexed: false }),
      row("中箭位置", shots, { answer: positions(0, sorted.length - 1), indexed: false }),
    ],
    message: `最少要 ${arrows} 支箭。排序後每個氣球只和目前這支箭的位置比一次，掃描一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function stretchText(letter: string, index: number, start: number, end: number, last: number) {
  if (index === start) {
    return `新的一段從位置 ${index} 開始，${letter} 最後出現在位置 ${last}，這一段至少要到位置 ${last}。`;
  }
  if (last > end) {
    return `${letter} 最後出現在位置 ${last}，超過目前的終點 ${end}，這一段要延伸到位置 ${last}。`;
  }
  return `${letter} 最後出現在位置 ${last}，沒有超過終點 ${end}，終點不變。`;
}

export function partitionBrute(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const count = letters.length;
  const sizes: number[] = [];
  let start = 0;
  let end = 0;
  let looked = 0;

  for (let index = 0; index < count; index++) {
    const letter = letters[index];
    let last = index;
    for (let later = index; later < count; later++) {
      looked++;
      if (letters[later] === letter) {
        last = later;
      }
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 目前: index }, rangeStart: index }),
        row("答案", sizes, { indexed: false }),
      ],
      message: `${letter} 最後出現在哪裡？沒有先記下來，只好從位置 ${index} 一路看到結尾，看了 ${count - index} 個字元，最後一個 ${letter} 在位置 ${last}。`,
    });

    let message = stretchText(letter, index, start, end, last);
    end = Math.max(end, last);
    if (index === end) {
      const size = end - start + 1;
      sizes.push(size);
      message += `走到終點了，這一段的字母後面都不會再出現，在這裡切開，長度是 ${size}。`;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 起點: start, 目前: index, 終點: end }, rangeStart: start, rangeEnd: end }),
        row("答案", sizes, { indexed: false }),
      ],
      message,
    });
    if (index === end) {
      start = index + 1;
    }
  }

  frames.push({
    rows: [row("字串", letters), row("答案", sizes, { answer: positions(0, sizes.length - 1), indexed: false })],
    message: `切成 ${sizes.length} 段，長度是 ${sizes.join("、")}。每個字母都重新往後找一遍，一共看了 ${looked} 個字元。`,
  });
  return frames;
}

export function partitionLastSeen(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const lastSeen: Record<string, number> = {};
  const sizes: number[] = [];
  let start = 0;
  let end = 0;
  let looked = 0;

  for (let index = 0; index < letters.length; index++) {
    lastSeen[letters[index]] = index;
    looked++;
  }
  const names = Object.keys(lastSeen);
  const table = names.map((name) => `${name}→${lastSeen[name]}`);

  frames.push({
    rows: [
      row("字串", letters),
      row("雜湊表", table, { indexed: false }),
      row("答案", sizes, { indexed: false }),
    ],
    message: `先走一遍字串，把每個字母最後出現的位置記進雜湊表，這一遍看了 ${looked} 個字元。之後查表就知道，不用再往後找。`,
  });

  for (let index = 0; index < letters.length; index++) {
    const letter = letters[index];
    const last = lastSeen[letter];
    let message = `查表：${stretchText(letter, index, start, end, last)}`;
    looked++;
    end = Math.max(end, last);
    if (index === end) {
      const size = end - start + 1;
      sizes.push(size);
      message += `走到終點了，這一段的字母後面都不會再出現，在這裡切開，長度是 ${size}。`;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 起點: start, 目前: index, 終點: end }, rangeStart: start, rangeEnd: end }),
        row("雜湊表", table, { pointers: { 目前: names.indexOf(letter) }, indexed: false }),
        row("答案", sizes, { indexed: false }),
      ],
      message,
    });
    if (index === end) {
      start = index + 1;
    }
  }

  frames.push({
    rows: [
      row("字串", letters),
      row("雜湊表", table, { indexed: false }),
      row("答案", sizes, { answer: positions(0, sizes.length - 1), indexed: false }),
    ],
    message: `切成 ${sizes.length} 段，長度是 ${sizes.join("、")}。先記好每個字母最後出現的位置再掃一遍，一共只看了 ${looked} 個字元。`,
  });
  return frames;
}
