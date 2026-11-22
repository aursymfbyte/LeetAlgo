import { Cell, Frame, row } from "../types";
import { linkedRow, positions, spaced } from "./rows";

export function removeByLength(values: number[], fromEnd: number) {
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

export function removeWithGap(values: number[], fromEnd: number) {
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

function cycleNext(node: number, last: number, back: number) {
  if (node === last) {
    return back;
  }
  return node + 1;
}

export function cycleBySeenList(values: number[], back: number, conclusion: string) {
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

export function hasCycleFastSlow(values: number[], back: number) {
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

export function cycleEntryFastSlow(values: number[], back: number) {
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

export function intersectByRescan(ownA: number[], ownB: number[], shared: number[]) {
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

export function intersectBySwitching(ownA: number[], ownB: number[], shared: number[]) {
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

export function middleByLength(values: number[]) {
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

export function middleFastSlow(values: number[]) {
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
