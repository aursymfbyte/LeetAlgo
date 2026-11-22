import { Frame, Row, row } from "../types";
import { heapPop, heapPush, sortCount } from "./heapSteps";
import { treeCells } from "./treeRows";

function smaller(a: number, b: number) {
  return a < b;
}

function larger(a: number, b: number) {
  return a > b;
}

export function medianSortEach(ops: string[]) {
  const frames: Frame[] = [];
  const nums: number[] = [];
  const results: number[] = [];
  let compared = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", nums, { indexed: false }), row("排序後", [], { indexed: false })],
    message: "暴力解把送進來的數照順序放進「清單」。每次要取中位數，才把整份清單複製出來重新排序，放在「排序後」，再取正中間。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "加") {
      nums.push(Number(text));
      frames.push({
        rows: [
          opRow,
          row("清單", nums, { indexed: false, pointers: { 目前: nums.length - 1 } }),
          row("排序後", [], { indexed: false }),
        ],
        message: `${ops[step]}（addNum）：直接放到清單最後面，不整理。上次排好的結果也不能用了。`,
      });
      continue;
    }

    const sorted = [...nums];
    const used = sortCount(sorted, smaller);
    const middle = Math.floor(sorted.length / 2);
    let median = sorted[middle];
    let picked = [middle];
    let reason = `個數是奇數，正中間的 ${median} 就是中位數`;
    if (sorted.length % 2 === 0) {
      const left = sorted[middle - 1];
      const right = sorted[middle];
      median = (left + right) / 2;
      picked = [middle - 1, middle];
      reason = `個數是偶數，取中間兩個的平均 (${left} + ${right}) / 2`;
    }
    compared += used;
    results.push(median);
    frames.push({
      rows: [opRow, row("清單", nums, { indexed: false }), row("排序後", sorted, { indexed: false, answer: picked })],
      message: `取中位數（findMedian）：把 ${sorted.length} 個數複製出來重新排序，比較了 ${used} 次。${reason}，回傳 ${median}。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", nums, { indexed: false }), row("排序後", [], { indexed: false })],
    message: `${results.length} 次取中位數依序回傳 ${results.join("、")}。每次都把全部的數重新排序，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function medianTwoHeaps(ops: string[]) {
  const frames: Frame[] = [];
  const lower: number[] = [];
  const upper: number[] = [];
  const results: number[] = [];
  let compared = 0;

  function show(opRow: Row, lowerAnswer: number[], upperAnswer: number[], message: string) {
    frames.push({
      rows: [
        opRow,
        row("最大堆", treeCells(lower, 7), { shape: "tree", answer: lowerAnswer }),
        row("最小堆", treeCells(upper, 7), { shape: "tree", answer: upperAnswer }),
      ],
      message,
    });
  }

  show(row("操作", ops, { indexed: false }), [], [], "「最大堆」放較小的一半，堆頂是這一半裡最大的；「最小堆」放較大的一半，堆頂是這一半裡最小的。中位數就在兩個堆頂。");

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "加") {
      const num = Number(text);
      let used = heapPush(lower, num, larger);
      compared += used;
      show(opRow, [], [], `${ops[step]}（addNum）：先把 ${num} 放進最大堆，沿著一條路往上浮到對的位置，比較了 ${used} 次。`);

      const top = lower[0];
      used = heapPop(lower, larger);
      used += heapPush(upper, top, smaller);
      compared += used;
      show(opRow, [], [], `${ops[step]}（addNum）：把最大堆的堆頂 ${top} 搬到最小堆，保證最大堆的數都不比最小堆的大。比較了 ${used} 次。`);

      if (upper.length > lower.length) {
        const back = upper[0];
        used = heapPop(upper, smaller);
        used += heapPush(lower, back, larger);
        compared += used;
        show(opRow, [], [], `${ops[step]}（addNum）：最小堆的個數比最大堆多了，把最小堆的堆頂 ${back} 搬回最大堆，兩邊才平衡。比較了 ${used} 次。`);
      }
      continue;
    }

    const total = lower.length + upper.length;
    if (lower.length > upper.length) {
      const median = lower[0];
      results.push(median);
      show(opRow, [0], [], `取中位數（findMedian）：一共 ${total} 個數，是奇數，最大堆多一個，它的堆頂 ${median} 就是中位數，回傳 ${median}。不用排序。`);
    } else {
      const median = (lower[0] + upper[0]) / 2;
      results.push(median);
      show(opRow, [0], [0], `取中位數（findMedian）：一共 ${total} 個數，是偶數，取兩個堆頂的平均 (${lower[0]} + ${upper[0]}) / 2，回傳 ${median}。不用排序。`);
    }
  }

  show(
    row("操作", ops, { indexed: false }),
    [],
    [],
    `${results.length} 次取中位數依序回傳 ${results.join("、")}。每次加入只沿著堆積的一條路調整，取中位數只看堆頂，一共只比較了 ${compared} 次。`,
  );
  return frames;
}

export function kthLargestSortEach(k: number, start: number[], ops: string[]) {
  const frames: Frame[] = [];
  const nums = [...start];
  const results: number[] = [];
  let compared = 0;

  frames.push({
    rows: [
      row("操作", ops, { indexed: false, pointers: { 目前: 0 } }),
      row("清單", nums, { indexed: false }),
      row("排序後", [], { indexed: false }),
    ],
    message: `建立：k = ${k}，一開始有 ${start.join("、")}。暴力解只把數放進「清單」，每次加入新的數，就把全部複製出來由大到小重新排序，取第 ${k} 個。`,
  });

  for (let step = 1; step < ops.length; step++) {
    const value = Number(ops[step].split(" ")[1]);
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    nums.push(value);
    frames.push({
      rows: [
        opRow,
        row("清單", nums, { indexed: false, pointers: { 目前: nums.length - 1 } }),
        row("排序後", [], { indexed: false }),
      ],
      message: `${ops[step]}（add）：把 ${value} 放到清單最後面。上次排好的結果已經不能用了。`,
    });

    const sorted = [...nums];
    const used = sortCount(sorted, larger);
    const kth = sorted[k - 1];
    compared += used;
    results.push(kth);
    frames.push({
      rows: [opRow, row("清單", nums, { indexed: false }), row("排序後", sorted, { indexed: false, answer: [k - 1] })],
      message: `${ops[step]}（add）：把 ${sorted.length} 個數複製出來由大到小重新排序，比較了 ${used} 次。第 ${k} 個是 ${kth}，回傳 ${kth}。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", nums, { indexed: false }), row("排序後", [], { indexed: false })],
    message: `${results.length} 次加入依序回傳 ${results.join("、")}。數越來越多，每次都全部重新排序，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function kthLargestHeap(k: number, start: number[], ops: string[]) {
  const frames: Frame[] = [];
  const heap: number[] = [];
  const results: number[] = [];
  let compared = 0;

  function show(opRow: Row, answer: number[], message: string) {
    frames.push({
      rows: [opRow, row("最小堆", treeCells(heap, 7), { shape: "tree", answer })],
      message,
    });
  }

  show(row("操作", ops, { indexed: false }), [], `「最小堆」只留目前最大的 k 個數（這裡 k = ${k}），堆頂是其中最小的，也就是第 k 大。更小的數不可能是答案，直接丟掉。`);

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    let values = start;
    let head = "建立：一開始的數也是一個一個加進去。";
    if (name === "加") {
      values = [Number(text)];
      head = `${ops[step]}（add）：`;
    }

    for (const value of values) {
      let used = heapPush(heap, value, smaller);
      compared += used;
      show(opRow, [], `${head}把 ${value} 放進最小堆，沿著一條路往上浮到對的位置，比較了 ${used} 次。`);

      if (heap.length > k) {
        const size = heap.length;
        const smallest = heap[0];
        used = heapPop(heap, smaller);
        compared += used;
        show(opRow, [], `${head}堆裡有 ${size} 個數，超過 k 了，把堆頂最小的 ${smallest} 彈掉，比較了 ${used} 次。留下的是最大的 ${k} 個數。`);
      }
    }

    if (name === "加") {
      results.push(heap[0]);
      show(opRow, [0], `${head}堆裡留的是最大的 ${k} 個數，堆頂的 ${heap[0]} 是其中最小的，也就是第 ${k} 大，回傳 ${heap[0]}。`);
    }
  }

  show(row("操作", ops, { indexed: false }), [], `${results.length} 次加入依序回傳 ${results.join("、")}。堆裡最多 ${k + 1} 個數，每次只沿著一條路調整，一共只比較了 ${compared} 次。`);
  return frames;
}

function scanText(count: number) {
  if (count === 0) {
    return "清單是空的";
  }
  return `清單裡的 ${count} 個數都比過了`;
}

export function smallestSetScan(ops: string[]) {
  const frames: Frame[] = [];
  const taken: number[] = [];
  const results: number[] = [];
  let compared = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("拿走的數", taken, { indexed: false })],
    message: "集合有無限多個數，沒辦法全部存起來。暴力解只用一個清單記「被拿走的數」，要找最小的就從 1 開始，一個一個到清單裡查。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "放回") {
      const num = Number(text);
      const position = taken.indexOf(num);

      if (position === -1) {
        compared += taken.length;
        frames.push({
          rows: [opRow, row("拿走的數", taken, { indexed: false })],
          message: `${ops[step]}（addBack）：${scanText(taken.length)}，沒有 ${num}，代表它本來就在集合裡，不用做事。比較了 ${taken.length} 次。`,
        });
      } else {
        compared += position + 1;
        frames.push({
          rows: [opRow, row("拿走的數", taken, { indexed: false, pointers: { 目前: position } })],
          message: `${ops[step]}（addBack）：從頭比了 ${position + 1} 次，在清單裡找到 ${num}。把它從清單刪掉，它就回到集合裡了。`,
        });
        taken.splice(position, 1);
      }
      continue;
    }

    let candidate = 1;
    let position = taken.indexOf(candidate);
    while (position !== -1) {
      compared += position + 1;
      frames.push({
        rows: [opRow, row("拿走的數", taken, { indexed: false, pointers: { 目前: position } })],
        message: `拿最小（popSmallest）：從 1 開始試。試 ${candidate}：從頭比了 ${position + 1} 次，在清單裡找到它，代表已經被拿走，換下一個數。`,
      });
      candidate++;
      position = taken.indexOf(candidate);
    }

    const scanned = scanText(taken.length);
    compared += taken.length;
    taken.push(candidate);
    results.push(candidate);
    frames.push({
      rows: [opRow, row("拿走的數", taken, { indexed: false, answer: [taken.length - 1] })],
      message: `拿最小（popSmallest）：試 ${candidate}：${scanned}，沒有 ${candidate}，所以它還在集合裡。回傳 ${candidate}，並把它記進清單。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("拿走的數", taken, { indexed: false })],
    message: `${results.length} 次拿最小依序回傳 ${results.join("、")}。每次都從 1 開始，一個一個到清單裡查，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function smallestSetHeap(ops: string[]) {
  const frames: Frame[] = [];
  const heap: number[] = [];
  const inHeap = new Set<number>();
  const results: number[] = [];
  let next = 1;
  let compared = 0;

  function show(opRow: Row, pointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        opRow,
        row("下一個數", [next], { indexed: false }),
        row("最小堆", treeCells(heap, 3), { shape: "tree", pointers }),
        row("堆裡的數", [...inHeap], { indexed: false }),
      ],
      message,
    });
  }

  show(row("操作", ops, { indexed: false }), {}, "「下一個數」代表從它開始往後的數都沒被拿走過。被拿走又放回來的數放進「最小堆」。「堆裡的數」是雜湊集合，用來查某個數在不在堆裡。");

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "放回") {
      const num = Number(text);
      const head = `${ops[step]}（addBack）：`;

      compared++;
      if (num >= next) {
        show(opRow, {}, `${head}${num} 沒有比下一個數 ${next} 小，代表它從來沒被拿走過，本來就在集合裡，不用做事。只比較了 1 次。`);
        continue;
      }

      compared++;
      if (inHeap.has(num)) {
        show(opRow, { 已有: heap.indexOf(num) }, `${head}${num} 比下一個數 ${next} 小，但查「堆裡的數」發現它已經放回來過了，不能重複放。比較了 2 次。`);
        continue;
      }

      const used = heapPush(heap, num, smaller);
      compared += used;
      inHeap.add(num);
      show(opRow, { 新: heap.indexOf(num) }, `${head}${num} 比下一個數 ${next} 小，查「堆裡的數」也沒有它，所以放進最小堆。連往上浮一共比較了 ${used + 2} 次。`);
      continue;
    }

    if (heap.length > 0) {
      const smallest = heap[0];
      const used = heapPop(heap, smaller);
      compared += used;
      inHeap.delete(smallest);
      results.push(smallest);
      show(opRow, {}, `拿最小（popSmallest）：最小堆不是空的，堆裡的數一定都比下一個數小，所以彈出堆頂的 ${smallest}，回傳 ${smallest}。比較了 ${used} 次。`);
    } else {
      const smallest = next;
      next++;
      results.push(smallest);
      show(opRow, {}, `拿最小（popSmallest）：最小堆是空的，最小的就是下一個數 ${smallest}，回傳 ${smallest}，下一個數變成 ${next}。不用比較。`);
    }
  }

  show(row("操作", ops, { indexed: false }), {}, `${results.length} 次拿最小依序回傳 ${results.join("、")}。不用從 1 開始一個一個試，連查集合都算進去，一共只比較了 ${compared} 次。`);
  return frames;
}
