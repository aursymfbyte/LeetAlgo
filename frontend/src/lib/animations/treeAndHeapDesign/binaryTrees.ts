import { Cell, Frame, Row, row } from "../types";
import { hasNode } from "./treeRows";

function stackRow(label: string, cells: Cell[]) {
  if (cells.length === 0) {
    return row(label, cells, { indexed: false });
  }
  return row(label, cells, { indexed: false, pointers: { 頂: cells.length - 1 } });
}

export function iteratorCopyAll(tree: Cell[], ops: string[]) {
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

export function iteratorStack(tree: Cell[], ops: string[]) {
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

export function codecTwoLists(tree: Cell[]) {
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

export function codecPreorderMarks(tree: Cell[]) {
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
