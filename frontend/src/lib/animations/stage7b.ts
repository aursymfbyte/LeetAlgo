import { Cell, Frame, ProblemAnimation, Row, row } from "./types";

type FoodEntry = { rating: number; food: string };
type Tweet = { time: number; id: number; user: string };
type FeedEntry = { time: number; user: string; index: number };

function hasNode(tree: Cell[], index: number) {
  return index < tree.length && tree[index] !== "";
}

function treeCells(cells: Cell[], size: number) {
  const padded = [...cells];
  while (padded.length < size) {
    padded.push("");
  }
  return padded;
}

function allPositions(cells: Cell[]) {
  return cells.map((cell, index) => index);
}

function stackRow(label: string, cells: Cell[]) {
  if (cells.length === 0) {
    return row(label, cells, { indexed: false });
  }
  return row(label, cells, { indexed: false, pointers: { 頂: cells.length - 1 } });
}

function smaller(a: number, b: number) {
  return a < b;
}

function larger(a: number, b: number) {
  return a > b;
}

function heapPush<T>(heap: T[], item: T, above: (a: T, b: T) => boolean) {
  let index = heap.length;
  let compared = 0;
  heap.push(item);

  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    compared++;
    if (!above(item, heap[parent])) {
      break;
    }
    heap[index] = heap[parent];
    heap[parent] = item;
    index = parent;
  }
  return compared;
}

function heapPop<T>(heap: T[], above: (a: T, b: T) => boolean) {
  const last = heap.pop() as T;
  let compared = 0;
  if (heap.length === 0) {
    return compared;
  }

  let index = 0;
  heap[0] = last;
  while (index * 2 + 1 < heap.length) {
    const left = index * 2 + 1;
    const right = index * 2 + 2;
    let child = left;
    if (right < heap.length) {
      compared++;
      if (above(heap[right], heap[left])) {
        child = right;
      }
    }
    compared++;
    if (!above(heap[child], last)) {
      break;
    }
    heap[index] = heap[child];
    heap[child] = last;
    index = child;
  }
  return compared;
}

function sortCount<T>(items: T[], before: (a: T, b: T) => boolean) {
  let compared = 0;
  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    let j = i - 1;
    while (j >= 0) {
      compared++;
      if (!before(item, items[j])) {
        break;
      }
      items[j + 1] = items[j];
      j--;
    }
    items[j + 1] = item;
  }
  return compared;
}

function iteratorCopyAll(tree: Cell[], ops: string[]) {
  const frames: Frame[] = [];
  const list: Cell[] = [];
  const values: Cell[] = [];
  const answers: string[] = [];
  const buildRow = row("操作", ops, { indexed: false, pointers: { 目前: 0 } });
  let position = -1;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("樹", tree, { shape: "tree" }), row("清單", list, { indexed: false })],
    message: "「操作」是依序要做的事，「樹」是一棵二元搜尋樹。暴力解在建立時就把整棵樹走完，把所有的值由小到大抄進「清單」。",
  });

  function copy(index: number) {
    if (!hasNode(tree, index)) {
      return;
    }

    copy(index * 2 + 1);
    list.push(tree[index]);
    frames.push({
      rows: [buildRow, row("樹", tree, { shape: "tree", pointers: { 目前: index } }), row("清單", list, { indexed: false })],
      message: `建立：照「左、根、右」的順序走整棵樹，剛好由小到大。抄下 ${tree[index]}，清單現在佔了 ${list.length} 格。`,
    });
    copy(index * 2 + 2);
  }

  copy(0);

  for (let step = 1; step < ops.length; step++) {
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (ops[step] === "取下一個") {
      position++;
      const value = list[position];
      values.push(value);
      frames.push({
        rows: [
          opRow,
          row("樹", tree, { shape: "tree", pointers: { 目前: tree.indexOf(value) } }),
          row("清單", list, { indexed: false, pointers: { 指針: position }, rangeStart: position }),
        ],
        message: `取下一個（next）：清單的指針往右移一格，指到 ${value}，回傳 ${value}。`,
      });
      continue;
    }

    const has = position + 1 < list.length;
    let reason = "指針右邊還有數";
    if (!has) {
      reason = "指針已經在最後一格，右邊沒有數了";
    }
    answers.push(String(has));
    frames.push({
      rows: [
        opRow,
        row("樹", tree, { shape: "tree" }),
        row("清單", list, { indexed: false, pointers: { 指針: position }, rangeStart: position }),
      ],
      message: `還有嗎（hasNext）：${reason}，回傳 ${has}。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("樹", tree, { shape: "tree" }), row("清單", list, { indexed: false })],
    message: `取下一個依序回傳 ${values.join("、")}；還有嗎依序回傳 ${answers.join("、")}。清單從建立起就整份佔著，額外用了 ${list.length} 格。`,
  });
  return frames;
}

function iteratorStack(tree: Cell[], ops: string[]) {
  const frames: Frame[] = [];
  const stack: number[] = [];
  const values: Cell[] = [];
  const answers: string[] = [];
  let most = 0;

  function pushLeft(index: number) {
    const pushed: Cell[] = [];
    let node = index;
    while (hasNode(tree, node)) {
      stack.push(node);
      pushed.push(tree[node]);
      node = node * 2 + 1;
    }
    most = Math.max(most, stack.length);
    return pushed;
  }

  function show(opRow: Row, pointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        opRow,
        row("樹", tree, { shape: "tree", pointers, answer: [...stack] }),
        stackRow("堆疊", stack.map((index) => tree[index])),
      ],
      message,
    });
  }

  show(row("操作", ops, { indexed: false }), {}, "效率解不先抄整棵樹，只用一個「堆疊」放還沒輪到的節點。樹上標起來的節點，就是目前放在堆疊裡的節點。");

  const first = pushLeft(0);
  const smallest = first[first.length - 1];
  show(
    row("操作", ops, { indexed: false, pointers: { 目前: 0 } }),
    {},
    `建立：從根一路往左走到底，把經過的 ${first.join("、")} 放進堆疊。頂端的 ${smallest} 是整棵樹最小的，其他節點先不碰。`,
  );

  for (let step = 1; step < ops.length; step++) {
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (ops[step] === "取下一個") {
      const node = stack.pop() as number;
      const value = tree[node];
      const pushed = pushLeft(node * 2 + 2);
      let after = "它沒有右子樹，不用再放任何節點。";
      if (pushed.length > 0) {
        after = `它有右子樹，從右孩子一路往左，把 ${pushed.join("、")} 放進堆疊。`;
      }
      values.push(value);
      show(opRow, { 目前: node }, `取下一個（next）：彈出頂端的 ${value}，回傳 ${value}。${after}`);
      continue;
    }

    const has = stack.length > 0;
    let reason = `堆疊裡還有 ${stack.length} 個節點`;
    if (!has) {
      reason = "堆疊空了，沒有下一個";
    }
    answers.push(String(has));
    show(opRow, {}, `還有嗎（hasNext）：${reason}，回傳 ${has}。`);
  }

  show(
    row("操作", ops, { indexed: false }),
    {},
    `取下一個依序回傳 ${values.join("、")}；還有嗎依序回傳 ${answers.join("、")}。堆疊只放一條往左的路，最多同時 ${most} 個節點，額外只用了 ${most} 格。`,
  );
  return frames;
}

function matchedLetters(word: string, text: string) {
  let count = 0;
  while (count < word.length && count < text.length) {
    if (text[count] !== "." && text[count] !== word[count]) {
      break;
    }
    count++;
  }
  return count;
}

function wordListScan(ops: string[], addName: string) {
  const frames: Frame[] = [];
  const words: string[] = [];
  const results: string[] = [];
  let compared = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", words, { indexed: false })],
    message: "暴力解不建字典樹，只把加進來的單字依序放進「清單」。查詢時從清單的第一個單字開始，一個一個拿出來逐字比。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "加") {
      words.push(text);
      frames.push({
        rows: [opRow, row("清單", words, { indexed: false, pointers: { 目前: words.length - 1 } })],
        message: `${ops[step]}（${addName}）：直接放到清單最後面，不用整理。`,
      });
      continue;
    }

    let method = "search";
    if (name === "開頭") {
      method = "startsWith";
    }
    const head = `${ops[step]}（${method}）：`;
    let found = false;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const matched = matchedLetters(word, text);
      const shorter = Math.min(word.length, text.length);
      let used = matched;
      let verdict = `能比的 ${matched} 個字元都對得上，但長度不合，不算`;
      if (matched < shorter) {
        used = matched + 1;
        verdict = `第 ${used} 個字元 ${word[matched]} 和 ${text[matched]} 對不上，不是它`;
      }
      compared += used;

      found = matched === text.length;
      if (name === "找" && word.length !== text.length) {
        found = false;
      }
      if (found) {
        verdict = `${matched} 個字元全部對得上，符合，回傳 true`;
      }
      frames.push({
        rows: [opRow, row("清單", words, { indexed: false, pointers: { 目前: i }, rangeStart: i })],
        message: `${head}和清單裡的 ${word} 逐字比，比了 ${used} 個字元：${verdict}。`,
      });
      if (found) {
        break;
      }
    }

    results.push(String(found));
    if (!found) {
      frames.push({
        rows: [opRow, row("清單", words, { indexed: false })],
        message: `${head}清單裡的 ${words.length} 個單字都比過了，沒有符合的，回傳 false。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("清單", words, { indexed: false })],
    message: `${results.length} 次查詢依序回傳 ${results.join("、")}。每次都從清單的第一個單字開始逐字比，查詢一共比較了 ${compared} 個字元。`,
  });
  return frames;
}

function trieChild(letters: Cell[], node: number, letter: string) {
  const left = node * 2 + 1;
  const right = node * 2 + 2;
  if (letters[left] === letter) {
    return left;
  }
  if (letters[right] === letter) {
    return right;
  }
  return -1;
}

function trieAdd(letters: Cell[], ends: number[], word: string) {
  let node = 0;
  let created = 0;

  for (const letter of word) {
    let child = trieChild(letters, node, letter);
    if (child === -1) {
      child = node * 2 + 1;
      if (letters[child] !== "") {
        child = node * 2 + 2;
      }
      letters[child] = letter;
      created++;
    }
    node = child;
  }
  ends.push(node);
  return created;
}

function trieWalk(ops: string[]) {
  const frames: Frame[] = [];
  const letters = treeCells(["根"], 15);
  const ends: number[] = [];
  const results: string[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("字典樹", letters, { shape: "tree" })],
    message: "字典樹從「根」出發，每往下一層多一個字母，開頭相同的單字共用同一段路。標起來的節點代表有單字在這裡結束。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "加") {
      const created = trieAdd(letters, ends, text);
      const last = ends[ends.length - 1];
      frames.push({
        rows: [opRow, row("字典樹", letters, { shape: "tree", pointers: { 目前: last }, answer: [...ends] })],
        message: `${ops[step]}（insert）：從根沿著字母往下走，已經有的節點直接共用，沒有的才新建，這次新建 ${created} 個。最後把 ${letters[last]} 標成單字結尾。`,
      });
      continue;
    }

    let method = "search";
    if (name === "開頭") {
      method = "startsWith";
    }
    const head = `${ops[step]}（${method}）：`;
    let node = 0;
    let missing = "";

    for (const letter of text) {
      const child = trieChild(letters, node, letter);
      looked++;
      if (child === -1) {
        missing = letter;
        break;
      }
      node = child;
      frames.push({
        rows: [opRow, row("字典樹", letters, { shape: "tree", pointers: { 目前: node }, answer: [...ends] })],
        message: `${head}下一個字母是 ${letter}，往下一層找得到 ${letter}，走到這個節點。只比了 1 個字元。`,
      });
    }

    let found = true;
    let reason = "字母都走完了，路沒有斷，代表有單字用它開頭";
    if (name === "找") {
      found = ends.includes(node);
      reason = "字母都走完了，停下來的節點有單字結尾的標記";
      if (!found) {
        reason = "字母都走完了，但停下來的節點沒有單字結尾的標記，它只是別的單字的開頭";
      }
    }
    if (missing !== "") {
      found = false;
      reason = `下一個字母是 ${missing}，但這個節點底下沒有 ${missing}，路斷了`;
    }
    results.push(String(found));
    frames.push({
      rows: [opRow, row("字典樹", letters, { shape: "tree", pointers: { 目前: node }, answer: [...ends] })],
      message: `${head}${reason}，回傳 ${found}。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("字典樹", letters, { shape: "tree", answer: [...ends] })],
    message: `${results.length} 次查詢依序回傳 ${results.join("、")}。查詢只沿著字母往下走，和存了多少單字無關，查詢一共只比較了 ${looked} 個字元。`,
  });
  return frames;
}

function dictionaryDfs(ops: string[]) {
  const frames: Frame[] = [];
  const letters = treeCells(["根"], 15);
  const ends: number[] = [];
  const results: string[] = [];
  let looked = 0;
  let step = 0;
  let text = "";

  function show(node: number, message: string) {
    frames.push({
      rows: [
        row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step }),
        row("字典樹", letters, { shape: "tree", pointers: { 目前: node }, answer: [...ends] }),
      ],
      message,
    });
  }

  function dfs(node: number, index: number): boolean {
    const head = `${ops[step]}（search）：`;

    if (index === text.length) {
      if (ends.includes(node)) {
        show(node, `${head}字元都配完了，停下來的節點有單字結尾的標記，配對成功，回傳 true。`);
        return true;
      }
      show(node, `${head}字元都配完了，但停下來的節點沒有單字結尾的標記，這條路不算。`);
      return false;
    }

    const letter = text[index];
    if (letter === ".") {
      for (const child of [node * 2 + 1, node * 2 + 2]) {
        if (!hasNode(letters, child)) {
          continue;
        }
        looked++;
        show(child, `${head}第 ${index + 1} 個字元是 .，任何字母都可以，所以每個孩子都要試。走 ${letters[child]} 這條路試試看。`);
        if (dfs(child, index + 1)) {
          return true;
        }
      }
      return false;
    }

    const child = trieChild(letters, node, letter);
    looked++;
    if (child === -1) {
      show(node, `${head}第 ${index + 1} 個字元是 ${letter}，但這個節點底下沒有 ${letter}，這條路不通，退回去。`);
      return false;
    }
    show(child, `${head}第 ${index + 1} 個字元是 ${letter}，往下一層找得到 ${letter}，走到這個節點。`);
    return dfs(child, index + 1);
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("字典樹", letters, { shape: "tree" })],
    message: "單字存在字典樹裡，標起來的節點代表有單字在這裡結束。查詢時從根往下走，遇到 . 才需要把每個孩子都試一次。",
  });

  for (step = 0; step < ops.length; step++) {
    const parts = ops[step].split(" ");
    text = parts[1];

    if (parts[0] === "加") {
      const created = trieAdd(letters, ends, text);
      const last = ends[ends.length - 1];
      show(last, `${ops[step]}（addWord）：從根沿著字母往下走，已經有的節點直接共用，沒有的才新建，這次新建 ${created} 個。最後把 ${letters[last]} 標成單字結尾。`);
      continue;
    }

    const found = dfs(0, 0);
    results.push(String(found));
    if (!found) {
      show(0, `${ops[step]}（search）：能走的路都試過了，沒有單字配得上，回傳 false。`);
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("字典樹", letters, { shape: "tree", answer: [...ends] })],
    message: `${results.length} 次查詢依序回傳 ${results.join("、")}。只走字典樹上對得上的路，不用把每個單字都拿出來比，查詢一共只比較了 ${looked} 個字元。`,
  });
  return frames;
}

function medianSortEach(ops: string[]) {
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

function medianTwoHeaps(ops: string[]) {
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

function codecTwoLists(tree: Cell[]) {
  const frames: Frame[] = [];
  const preorder: Cell[] = [];
  const inorder: Cell[] = [];
  const rebuilt: Cell[] = tree.map(() => "");
  let compared = 0;

  function show(pointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers }),
        row("還原的樹", rebuilt, { shape: "tree" }),
        row("前序", preorder),
        row("中序", inorder),
      ],
      message,
    });
  }

  function writePreorder(index: number) {
    if (!hasNode(tree, index)) {
      return;
    }

    preorder.push(tree[index]);
    show({ 目前: index }, `序列化（serialize）：先照「根、左、右」的順序走一遍，把 ${tree[index]} 寫進前序。`);
    writePreorder(index * 2 + 1);
    writePreorder(index * 2 + 2);
  }

  function writeInorder(index: number) {
    if (!hasNode(tree, index)) {
      return;
    }

    writeInorder(index * 2 + 1);
    inorder.push(tree[index]);
    show({ 目前: index }, `序列化（serialize）：再照「左、根、右」的順序走一遍，把 ${tree[index]} 寫進中序。`);
    writeInorder(index * 2 + 2);
  }

  function build(preStart: number, inStart: number, size: number, position: number) {
    if (size === 0) {
      return;
    }

    const rootValue = preorder[preStart];
    const rootIndex = inorder.indexOf(rootValue);
    const leftSize = rootIndex - inStart;
    const rightSize = size - 1 - leftSize;
    const used = rootIndex + 1;
    rebuilt[position] = rootValue;
    compared += used;
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree" }),
        row("還原的樹", rebuilt, { shape: "tree", pointers: { 目前: position } }),
        row("前序", preorder, { pointers: { 根: preStart }, rangeStart: preStart, rangeEnd: preStart + size - 1 }),
        row("中序", inorder, { pointers: { 根: rootIndex }, rangeStart: inStart, rangeEnd: inStart + size - 1 }),
      ],
      message: `反序列化（deserialize）：前序這一段的第一個 ${rootValue} 是根。到中序裡從頭找它，比對了 ${used} 次。它左邊 ${leftSize} 個是左子樹，右邊 ${rightSize} 個是右子樹。`,
    });
    build(preStart + 1, inStart, leftSize, position * 2 + 1);
    build(preStart + 1 + leftSize, rootIndex + 1, rightSize, position * 2 + 2);
  }

  show({}, "只存一種走訪順序，還原不出唯一的樹。所以直覺的做法是存兩份：前序（根、左、右）和中序（左、根、右），之後靠這兩份建回「還原的樹」。");
  writePreorder(0);
  writeInorder(0);

  const written = preorder.length + inorder.length;
  show({}, `序列化完成，兩份清單一共寫了 ${written} 個記號。接著反序列化：前序告訴我們誰是根，中序告訴我們左右子樹各有哪些節點。`);
  build(0, 0, preorder.length, 0);

  const total = written + compared;
  show({}, `還原出一樣的樹。寫了 ${written} 個記號，還原時比對了 ${compared} 次，一共做了 ${total} 次。而且節點的值有重複時，這個做法會還原錯。`);
  return frames;
}

function codecPreorderMarks(tree: Cell[]) {
  const frames: Frame[] = [];
  const tokens: Cell[] = [];
  const rebuilt: Cell[] = tree.map(() => "");
  let position = 0;

  function write(index: number, place: string) {
    if (!hasNode(tree, index)) {
      tokens.push("#");
      frames.push({
        rows: [
          row("樹", tree, { shape: "tree" }),
          row("還原的樹", rebuilt, { shape: "tree" }),
          row("字串", tokens, { indexed: false, pointers: { 目前: tokens.length - 1 } }),
        ],
        message: `序列化（serialize）：${place}是空的，也要寫一個 # 記下來，樹的形狀才不會丟。`,
      });
      return;
    }

    const value = tree[index];
    tokens.push(value);
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 目前: index } }),
        row("還原的樹", rebuilt, { shape: "tree" }),
        row("字串", tokens, { indexed: false, pointers: { 目前: tokens.length - 1 } }),
      ],
      message: `序列化（serialize）：照「根、左、右」的順序走，寫下節點 ${value}，接著走它的左邊，再走右邊。`,
    });
    write(index * 2 + 1, `節點 ${value} 的左孩子`);
    write(index * 2 + 2, `節點 ${value} 的右孩子`);
  }

  function build(index: number, place: string) {
    const token = tokens[position];
    const textRow = row("字串", tokens, { indexed: false, pointers: { 目前: position }, rangeStart: position });
    position++;

    if (token === "#") {
      frames.push({
        rows: [row("樹", tree, { shape: "tree" }), row("還原的樹", rebuilt, { shape: "tree" }), textRow],
        message: `反序列化（deserialize）：讀到 #，代表${place}是空的，不用建節點，回到上一層。`,
      });
      return;
    }

    rebuilt[index] = token;
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree" }),
        row("還原的樹", rebuilt, { shape: "tree", pointers: { 目前: index } }),
        textRow,
      ],
      message: `反序列化（deserialize）：讀到 ${token}，建一個節點，它是${place}。接下來讀到的先是它的左子樹，再來是右子樹。`,
    });
    build(index * 2 + 1, `節點 ${token} 的左孩子`);
    build(index * 2 + 2, `節點 ${token} 的右孩子`);
  }

  frames.push({
    rows: [
      row("樹", tree, { shape: "tree" }),
      row("還原的樹", rebuilt, { shape: "tree" }),
      row("字串", tokens, { indexed: false }),
    ],
    message: "只走一遍前序，但遇到空的位置也寫一個 # 記下來。有了這些記號，每棵子樹在哪裡結束都很明確，一份字串就能還原。",
  });
  write(0, "根");
  build(0, "根");

  const written = tokens.length;
  const total = written + position;
  frames.push({
    rows: [
      row("樹", tree, { shape: "tree" }),
      row("還原的樹", rebuilt, { shape: "tree" }),
      row("字串", tokens, { indexed: false }),
    ],
    message: `還原出一樣的樹。寫了 ${written} 個記號，再讀了 ${position} 個記號，一共做了 ${total} 次，和暴力解差不多；但只要存一份，值有重複也能還原。`,
  });
  return frames;
}

function newer(a: { time: number }, b: { time: number }) {
  return a.time > b.time;
}

function tweetText(tweet: Tweet) {
  return `${tweet.user}:${tweet.id}`;
}

function tweetCells(users: string[], tweets: Record<string, Tweet[]>) {
  const cells: string[] = [];
  for (const user of users) {
    for (const tweet of tweets[user]) {
      cells.push(tweetText(tweet));
    }
  }
  return cells;
}

function followCells(users: string[], following: Record<string, string[]>) {
  const cells: string[] = [];
  for (const user of users) {
    if (following[user].length > 0) {
      cells.push(`${user}→${following[user].join(",")}`);
    }
  }
  return cells;
}

function applyTweetOp(op: string, time: number, tweets: Record<string, Tweet[]>, following: Record<string, string[]>) {
  const [user, name, target] = op.split(" ");

  if (name === "發") {
    tweets[user].push({ time, id: Number(target), user });
    return `${op}（postTweet）：把推文 ${target} 接到${user}自己那一串的最後面，同時記下發文時間。每個人的推文越右邊越新。`;
  }
  if (name === "追蹤") {
    following[user].push(target);
    return `${op}（follow）：在追蹤名單裡記下「${user}追蹤${target}」。`;
  }
  following[user].splice(following[user].indexOf(target), 1);
  return `${op}（unfollow）：把${target}從${user}的追蹤名單裡拿掉。`;
}

function tightOps(ops: string[]) {
  return ops.map((op) => op.split(" ").join(""));
}

function twitterSortAll(users: string[], ops: string[], limit: number) {
  const frames: Frame[] = [];
  const opCells = tightOps(ops);
  const tweets: Record<string, Tweet[]> = {};
  const following: Record<string, string[]> = {};
  const results: string[] = [];
  let compared = 0;

  for (const user of users) {
    tweets[user] = [];
    following[user] = [];
  }

  function show(opRow: Row, collected: Tweet[], answer: number[], message: string) {
    frames.push({
      rows: [
        opRow,
        row("各人推文", tweetCells(users, tweets), { indexed: false }),
        row("追蹤", followCells(users, following), { indexed: false }),
        row("收集", collected.map(tweetText), { indexed: false, answer }),
      ],
      message,
    });
  }

  show(row("操作", opCells, { indexed: false }), [], [], `「各人推文」每格是「誰:推文編號」，編號照發文順序編，越大越新。題目的動態消息取最新 10 則，為了示範改成只取 ${limit} 則。`);

  for (let step = 0; step < ops.length; step++) {
    const [user, name] = ops[step].split(" ");
    const opRow = row("操作", opCells, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name !== "看動態") {
      const message = applyTweetOp(ops[step], step, tweets, following);
      show(opRow, [], [], message);
      continue;
    }

    const people = [user, ...following[user]];
    const collected: Tweet[] = [];
    for (const person of people) {
      collected.push(...tweets[person]);
    }
    show(opRow, collected, [], `${ops[step]}（getNewsFeed）：動態消息要看${people.join("、")}的推文。暴力解把這些人發過的推文全部收集起來，一共 ${collected.length} 則。`);

    const used = sortCount(collected, newer);
    const feed = collected.slice(0, limit).map((tweet) => tweet.id);
    compared += used;
    results.push(`[${feed.join(",")}]`);
    show(opRow, collected, allPositions(feed), `${ops[step]}（getNewsFeed）：把收集到的 ${collected.length} 則照發文時間由新到舊重新排序，比較了 ${used} 次。取最前面 ${feed.length} 則，回傳 ${feed.join("、")}。`);
  }

  show(row("操作", opCells, { indexed: false }), [], [], `${results.length} 次看動態依序回傳 ${results.join("、")}。每次都把相關的推文全部收集起來重新排序，一共比較了 ${compared} 次。`);
  return frames;
}

function twitterMergeHeap(users: string[], ops: string[], limit: number) {
  const frames: Frame[] = [];
  const opCells = tightOps(ops);
  const tweets: Record<string, Tweet[]> = {};
  const following: Record<string, string[]> = {};
  const results: string[] = [];
  let compared = 0;

  for (const user of users) {
    tweets[user] = [];
    following[user] = [];
  }

  function show(opRow: Row, heap: FeedEntry[], taken: number[], message: string) {
    const nodes = heap.map((entry) => tweetText(tweets[entry.user][entry.index]));
    frames.push({
      rows: [
        opRow,
        row("各人推文", tweetCells(users, tweets), { indexed: false, answer: [...taken] }),
        row("追蹤", followCells(users, following), { indexed: false }),
        row("最大堆", treeCells(nodes, 3), { shape: "tree" }),
      ],
      message,
    });
  }

  show(row("操作", opCells, { indexed: false }), [], [], `「各人推文」每格是「誰:推文編號」，編號越大越新。「最大堆」的堆頂是堆裡最新的一則。題目取最新 10 則，為了示範改成只取 ${limit} 則。`);

  for (let step = 0; step < ops.length; step++) {
    const [user, name] = ops[step].split(" ");
    const opRow = row("操作", opCells, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name !== "看動態") {
      const message = applyTweetOp(ops[step], step, tweets, following);
      show(opRow, [], [], message);
      continue;
    }

    const head = `${ops[step]}（getNewsFeed）：`;
    const people = [user, ...following[user]];
    const cells = tweetCells(users, tweets);
    const heap: FeedEntry[] = [];
    const feed: number[] = [];
    const taken: number[] = [];
    let used = 0;

    for (const person of people) {
      const last = tweets[person].length - 1;
      if (last >= 0) {
        const entry = { time: tweets[person][last].time, user: person, index: last };
        used += heapPush(heap, entry, newer);
      }
    }
    compared += used;
    show(opRow, heap, taken, `${head}要看${people.join("、")}的推文。每個人那一串已經照時間排好，只把各自最新的一則放進最大堆，比較了 ${used} 次。`);

    while (heap.length > 0 && feed.length < limit) {
      const top = heap[0];
      const tweet = tweets[top.user][top.index];
      let next = `${top.user}沒有更早的推文了。`;
      used = heapPop(heap, newer);
      feed.push(tweet.id);
      taken.push(cells.indexOf(tweetText(tweet)));

      if (top.index > 0) {
        const previous = tweets[top.user][top.index - 1];
        const entry = { time: previous.time, user: top.user, index: top.index - 1 };
        used += heapPush(heap, entry, newer);
        next = `再把${top.user}的前一則 ${previous.id} 放進堆。`;
      }
      compared += used;
      show(opRow, heap, taken, `${head}彈出堆頂的 ${tweet.id}，它是還沒拿的推文裡最新的，記進動態消息。${next}比較了 ${used} 次。`);
    }

    let reason = `收滿 ${limit} 則就停，更舊的推文不用再看`;
    if (feed.length < limit) {
      reason = "堆空了，沒有更多推文";
    }
    results.push(`[${feed.join(",")}]`);
    show(opRow, heap, taken, `${head}${reason}。回傳 ${feed.join("、")}。`);
  }

  show(row("操作", opCells, { indexed: false }), [], [], `${results.length} 次看動態依序回傳 ${results.join("、")}。每個人只拿最新的一則進堆，拿滿就停，不用全部排序，一共只比較了 ${compared} 次。`);
  return frames;
}

function kthLargestSortEach(k: number, start: number[], ops: string[]) {
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

function kthLargestHeap(k: number, start: number[], ops: string[]) {
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

function smallestSetScan(ops: string[]) {
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

function smallestSetHeap(ops: string[]) {
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

function foodScanAll(foods: string[], cuisines: string[], start: number[], ops: string[]) {
  const frames: Frame[] = [];
  const ratings = [...start];
  const results: string[] = [];
  let compared = 0;

  function show(opRow: Row, pointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        opRow,
        row("食物", foods, { indexed: false, pointers }),
        row("料理", cuisines, { indexed: false }),
        row("評分", ratings, { indexed: false }),
      ],
      message,
    });
  }

  show(
    row("操作", ops, { indexed: false, pointers: { 目前: 0 } }),
    {},
    "建立：暴力解把食物、料理、評分照原樣存成三個陣列，上下同一格是同一道食物。之後每次查詢或改評分，都從第一格開始找。",
  );

  for (let step = 1; step < ops.length; step++) {
    const [name, text, value] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "改") {
      const position = foods.indexOf(text);
      const old = ratings[position];
      ratings[position] = Number(value);
      compared += position + 1;
      show(opRow, { 目前: position }, `${ops[step]}（changeRating）：從第一格開始一道一道找${text}，比較了 ${position + 1} 次找到它，把評分從 ${old} 改成 ${value}。`);
      continue;
    }

    let best = -1;
    for (let i = 0; i < foods.length; i++) {
      let note = `${foods[i]}是${cuisines[i]}，不是${text}，跳過。`;
      compared++;

      if (cuisines[i] === text && best === -1) {
        best = i;
        note = `${foods[i]}是${text}，${ratings[i]} 分，先當成最高。`;
      } else if (cuisines[i] === text) {
        const higher = ratings[i] > ratings[best];
        const tie = ratings[i] === ratings[best] && foods[i] < foods[best];
        compared++;
        note = `${foods[i]}是${text}，${ratings[i]} 分，沒有贏過目前最高的${foods[best]}（${ratings[best]} 分）。`;
        if (higher || tie) {
          note = `${foods[i]}是${text}，${ratings[i]} 分，贏過目前最高的${foods[best]}（${ratings[best]} 分），最高換成它。`;
          best = i;
        }
      }

      const pointers: Record<string, number> = { 目前: i };
      if (best !== -1) {
        pointers.最高 = best;
      }
      if (i === foods.length - 1) {
        results.push(foods[best]);
        note += `全部看完了，回傳${foods[best]}。`;
      }
      show(opRow, pointers, `${ops[step]}（highestRated）：${note}`);
    }
  }

  show(row("操作", ops, { indexed: false }), {}, `${results.length} 次查詢依序回傳${results.join("、")}。每次查詢都把全部食物看一遍，改評分也要從頭找，一共比較了 ${compared} 次。`);
  return frames;
}

function higherRated(a: FoodEntry, b: FoodEntry) {
  if (a.rating !== b.rating) {
    return a.rating > b.rating;
  }
  return a.food < b.food;
}

function entryText(entry: FoodEntry) {
  return `${entry.food}:${entry.rating}`;
}

function foodHeaps(foods: string[], cuisines: string[], start: number[], ops: string[]) {
  const frames: Frame[] = [];
  const ratingOf: Record<string, number> = {};
  const cuisineOf: Record<string, string> = {};
  const heaps: Record<string, FoodEntry[]> = {};
  const results: string[] = [];
  let compared = 0;

  for (const cuisine of cuisines) {
    heaps[cuisine] = [];
  }

  function show(opRow: Row, marked: string, options: Partial<Row>, message: string) {
    const table = Object.keys(ratingOf).map((food) => `${food}→${ratingOf[food]}`);
    const rows = [opRow, row("評分表", table, { indexed: false })];

    for (const cuisine of Object.keys(heaps)) {
      const cells = treeCells(heaps[cuisine].map(entryText), 7);
      if (cuisine === marked) {
        rows.push(row(`${cuisine}的堆`, cells, { shape: "tree", ...options }));
      } else {
        rows.push(row(`${cuisine}的堆`, cells, { shape: "tree" }));
      }
    }
    frames.push({ rows, message });
  }

  const buildRow = row("操作", ops, { indexed: false, pointers: { 目前: 0 } });
  show(buildRow, "", {}, "建立：「評分表」是雜湊表，記每道食物現在的評分。每種料理各有一個最大堆，節點寫成「食物:評分」，堆頂是評分最高的，同分時名稱字典序小的在上面。");

  for (let i = 0; i < foods.length; i++) {
    const food = foods[i];
    const cuisine = cuisines[i];
    const entry = { rating: start[i], food };
    ratingOf[food] = start[i];
    cuisineOf[food] = cuisine;
    const used = heapPush(heaps[cuisine], entry, higherRated);
    compared += used;
    show(buildRow, cuisine, { pointers: { 新: heaps[cuisine].indexOf(entry) } }, `建立：${food}是${cuisine}，${start[i]} 分。記進評分表，也記下它屬於${cuisine}，再放進${cuisine}的堆往上浮，比較了 ${used} 次。`);
  }

  for (let step = 1; step < ops.length; step++) {
    const [name, text, value] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "改") {
      const cuisine = cuisineOf[text];
      const old = ratingOf[text];
      const entry = { rating: Number(value), food: text };
      ratingOf[text] = entry.rating;
      const used = heapPush(heaps[cuisine], entry, higherRated);
      compared += used;
      show(opRow, cuisine, { pointers: { 新: heaps[cuisine].indexOf(entry) } }, `${ops[step]}（changeRating）：評分表改成 ${value}。不去堆裡找舊的，直接再放一筆「${text}:${value}」，比較了 ${used} 次。舊的「${text}:${old}」留在堆裡，變成過期資料。`);
      continue;
    }

    const head = `${ops[step]}（highestRated）：`;
    const heap = heaps[text];
    compared++;
    while (heap[0].rating !== ratingOf[heap[0].food]) {
      const stale = heap[0];
      show(opRow, text, { pointers: { 過期: 0 } }, `${head}堆頂是「${entryText(stale)}」，但評分表裡${stale.food}現在是 ${ratingOf[stale.food]} 分，對不上，這筆過期了，把它彈掉。`);
      compared += heapPop(heap, higherRated);
      compared++;
    }

    const top = heap[0];
    results.push(top.food);
    show(opRow, text, { answer: [0] }, `${head}堆頂是「${entryText(top)}」，和評分表裡的 ${top.rating} 分對得上，是有效的。它就是${text}評分最高的，回傳${top.food}。`);
  }

  show(row("操作", ops, { indexed: false }), "", {}, `${results.length} 次查詢依序回傳${results.join("、")}。查詢只看堆頂，過期的才彈掉，連建立時放進堆的都算，一共只比較了 ${compared} 次。`);
  return frames;
}

const iteratorTree: Cell[] = [8, 4, 12, 2, 6, 10, 14];
const iteratorOps = ["建立", "取下一個", "取下一個", "還有嗎", "取下一個", "取下一個", "取下一個", "取下一個", "取下一個", "還有嗎"];
const trieOps = ["加 tea", "加 ten", "加 to", "加 in", "找 to", "找 te", "開頭 te", "開頭 ta"];
const dictionaryOps = ["加 dad", "加 bad", "加 bed", "找 bed", "找 ba", "找 .ed", "找 b.d"];
const medianOps = ["加 5", "加 2", "加 8", "取中位數", "加 1", "取中位數", "加 9", "取中位數", "加 4", "取中位數"];
const codecTree: Cell[] = [1, 2, 3, "", "", 4, 5];
const twitterUsers = ["甲", "乙", "丙"];
const twitterOps = ["乙 發 1", "丙 發 2", "乙 發 3", "丙 發 4", "甲 發 5", "甲 追蹤 乙", "甲 追蹤 丙", "甲 看動態", "甲 退追 丙", "甲 看動態"];
const kthStart = [4, 5, 8, 2];
const kthOps = ["建立", "加 3", "加 5", "加 10", "加 9", "加 4"];
const smallestOps = ["放回 5", "拿最小", "拿最小", "拿最小", "放回 2", "放回 1", "放回 2", "拿最小", "拿最小", "拿最小"];
const foodNames = ["泡菜", "味噌", "壽司", "拉麵", "烤肉"];
const foodCuisines = ["韓式", "日式", "日式", "日式", "韓式"];
const foodRatings = [9, 12, 8, 14, 7];
const foodOps = ["建立", "查 日式", "改 拉麵 6", "查 日式", "改 壽司 15", "查 日式", "改 泡菜 5", "查 韓式"];

export const stage7b: ProblemAnimation[] = [
  {
    problemId: 173,
    brute: iteratorCopyAll(iteratorTree, iteratorOps),
    efficient: iteratorStack(iteratorTree, iteratorOps),
  },
  {
    problemId: 208,
    brute: wordListScan(trieOps, "insert"),
    efficient: trieWalk(trieOps),
  },
  {
    problemId: 211,
    brute: wordListScan(dictionaryOps, "addWord"),
    efficient: dictionaryDfs(dictionaryOps),
  },
  {
    problemId: 295,
    brute: medianSortEach(medianOps),
    efficient: medianTwoHeaps(medianOps),
  },
  {
    problemId: 297,
    brute: codecTwoLists(codecTree),
    efficient: codecPreorderMarks(codecTree),
  },
  {
    problemId: 355,
    brute: twitterSortAll(twitterUsers, twitterOps, 3),
    efficient: twitterMergeHeap(twitterUsers, twitterOps, 3),
  },
  {
    problemId: 703,
    brute: kthLargestSortEach(3, kthStart, kthOps),
    efficient: kthLargestHeap(3, kthStart, kthOps),
  },
  {
    problemId: 2336,
    brute: smallestSetScan(smallestOps),
    efficient: smallestSetHeap(smallestOps),
  },
  {
    problemId: 2353,
    brute: foodScanAll(foodNames, foodCuisines, foodRatings, foodOps),
    efficient: foodHeaps(foodNames, foodCuisines, foodRatings, foodOps),
  },
];
