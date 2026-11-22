import { Cell, Frame, row } from "../types";
import { hasNode } from "./treeNodes";

export function sameTreeLists(p: Cell[], q: Cell[]) {
  const frames: Frame[] = [];
  const pList: Cell[] = [];
  const qList: Cell[] = [];
  let copied = 0;
  let compared = 0;

  function show(pPointers: Record<string, number>, qPointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        row("樹 p", p, { shape: "tree", pointers: pPointers }),
        row("樹 q", q, { shape: "tree", pointers: qPointers }),
        row("p 的清單", pList, { indexed: false }),
        row("q 的清單", qList, { indexed: false }),
      ],
      message,
    });
  }

  function copy(tree: Cell[], list: Cell[], name: string, index: number, place: string) {
    const order = `把樹 ${name} 照「根、左、右」的順序抄成清單：`;
    copied++;

    if (!hasNode(tree, index)) {
      list.push("空");
      show({}, {}, `${order}${place}是空的，也要記一個「空」，樹的形狀才不會抄丟。`);
      return;
    }

    const value = tree[index];
    list.push(value);
    if (name === "p") {
      show({ 目前: index }, {}, `${order}抄下節點 ${value}。`);
    } else {
      show({}, { 目前: index }, `${order}抄下節點 ${value}。`);
    }
    copy(tree, list, name, index * 2 + 1, `${value} 的左孩子`);
    copy(tree, list, name, index * 2 + 2, `${value} 的右孩子`);
  }

  show({}, {}, "最直接的想法：把兩棵樹各自抄成一份清單，再比這兩份清單一不一樣。");
  copy(p, pList, "p", 0, "根");
  copy(q, qList, "q", 0, "根");

  let same = true;
  for (let index = 0; index < pList.length; index++) {
    const rows = [
      row("樹 p", p, { shape: "tree" }),
      row("樹 q", q, { shape: "tree" }),
      row("p 的清單", pList, { pointers: { 目前: index }, indexed: false }),
      row("q 的清單", qList, { pointers: { 目前: index }, indexed: false }),
    ];
    compared++;

    if (pList[index] !== qList[index]) {
      same = false;
      frames.push({
        rows,
        message: `兩份清單一格一格比：第 ${index + 1} 格，p 是 ${pList[index]}，q 是 ${qList[index]}，不一樣。`,
      });
      break;
    }

    frames.push({
      rows,
      message: `兩份清單一格一格比：第 ${index + 1} 格都是 ${pList[index]}，一樣。`,
    });
  }

  let result = "兩份清單完全一樣，所以是相同的樹。";
  if (!same) {
    result = "清單有一格不一樣，所以不是相同的樹。";
  }
  const total = copied + compared;
  show({}, {}, `${result}兩棵樹先各抄一遍，抄了 ${copied} 格，再比較了 ${compared} 次，一共做了 ${total} 次。`);
  return frames;
}

export function sameTreeTogether(p: Cell[], q: Cell[]) {
  const frames: Frame[] = [];
  let compared = 0;

  function show(pPointers: Record<string, number>, qPointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        row("樹 p", p, { shape: "tree", pointers: pPointers }),
        row("樹 q", q, { shape: "tree", pointers: qPointers }),
      ],
      message,
    });
  }

  function same(index: number, place: string): boolean {
    const inP = hasNode(p, index);
    const inQ = hasNode(q, index);
    const pPointers: Record<string, number> = {};
    const qPointers: Record<string, number> = {};
    if (inP) {
      pPointers.目前 = index;
    }
    if (inQ) {
      qPointers.目前 = index;
    }
    compared++;

    if (!inP && !inQ) {
      show(pPointers, qPointers, `${place}：兩棵樹在這裡都沒有節點，一樣。`);
      return true;
    }
    if (!inP || !inQ) {
      show(pPointers, qPointers, `${place}：只有一棵樹在這裡有節點，形狀不同，馬上停，剩下的不用比了。`);
      return false;
    }
    if (p[index] !== q[index]) {
      show(pPointers, qPointers, `${place}：p 是 ${p[index]}，q 是 ${q[index]}，不一樣，馬上停，剩下的不用比了。`);
      return false;
    }

    const value = p[index];
    show(pPointers, qPointers, `${place}：p 和 q 都是 ${value}，一樣。接著比它們的左孩子，再比右孩子。`);
    return same(index * 2 + 1, `${value} 的左孩子`) && same(index * 2 + 2, `${value} 的右孩子`);
  }

  show({}, {}, "不用先抄下來。兩棵樹從根開始同時往下走，每次比同一個地方的一對節點，一發現不同就馬上停。");
  const isSame = same(0, "根");

  let result = "每一對都一樣，所以是相同的樹。";
  if (!isSame) {
    result = "有一對不一樣，所以不是相同的樹。";
  }
  show({}, {}, `${result}兩棵樹同時走，不用另外抄清單，一共只比較了 ${compared} 次。`);
  return frames;
}

export function symmetricLists(tree: Cell[]) {
  const frames: Frame[] = [];
  const leftList: Cell[] = [];
  const rightList: Cell[] = [];
  let copied = 0;
  let compared = 0;

  function show(pointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers }),
        row("左半清單", leftList, { indexed: false }),
        row("右半清單", rightList, { indexed: false }),
      ],
      message,
    });
  }

  function copyLeft(index: number, place: string) {
    const order = "把左半邊照「根、左、右」的順序抄成清單：";
    copied++;

    if (!hasNode(tree, index)) {
      leftList.push("空");
      show({}, `${order}${place}是空的，也要記一個「空」。`);
      return;
    }

    const value = tree[index];
    leftList.push(value);
    show({ 目前: index }, `${order}抄下 ${value}。`);
    copyLeft(index * 2 + 1, `${value} 的左孩子`);
    copyLeft(index * 2 + 2, `${value} 的右孩子`);
  }

  function copyRight(index: number, place: string) {
    const order = "把右半邊左右顛倒，照「根、右、左」的順序抄成清單：";
    copied++;

    if (!hasNode(tree, index)) {
      rightList.push("空");
      show({}, `${order}${place}是空的，也要記一個「空」。`);
      return;
    }

    const value = tree[index];
    rightList.push(value);
    show({ 目前: index }, `${order}抄下 ${value}。`);
    copyRight(index * 2 + 2, `${value} 的右孩子`);
    copyRight(index * 2 + 1, `${value} 的左孩子`);
  }

  show({}, "最直接的想法：把根的左半邊抄成一份清單，右半邊左右顛倒也抄成一份清單，兩份清單一樣就是對稱。");
  copyLeft(1, "根的左孩子");
  copyRight(2, "根的右孩子");

  let same = true;
  for (let index = 0; index < leftList.length; index++) {
    const rows = [
      row("樹", tree, { shape: "tree" }),
      row("左半清單", leftList, { pointers: { 目前: index }, indexed: false }),
      row("右半清單", rightList, { pointers: { 目前: index }, indexed: false }),
    ];
    compared++;

    if (leftList[index] !== rightList[index]) {
      same = false;
      frames.push({
        rows,
        message: `兩份清單一格一格比：第 ${index + 1} 格，左半是 ${leftList[index]}，右半是 ${rightList[index]}，不一樣。`,
      });
      break;
    }

    frames.push({
      rows,
      message: `兩份清單一格一格比：第 ${index + 1} 格都是 ${leftList[index]}，一樣。`,
    });
  }

  let result = "兩份清單完全一樣，所以是對稱的。";
  if (!same) {
    result = "清單有一格不一樣，所以不對稱。";
  }
  const total = copied + compared;
  show({}, `${result}左右兩半先各抄一遍，抄了 ${copied} 格，再比較了 ${compared} 次，一共做了 ${total} 次。`);
  return frames;
}

export function symmetricMirror(tree: Cell[]) {
  const frames: Frame[] = [];
  let compared = 0;

  function show(pointers: Record<string, number>, message: string) {
    frames.push({
      rows: [row("樹", tree, { shape: "tree", pointers })],
      message,
    });
  }

  function mirror(left: number, right: number, place: string): boolean {
    const inLeft = hasNode(tree, left);
    const inRight = hasNode(tree, right);
    const pointers: Record<string, number> = {};
    if (inLeft) {
      pointers.左 = left;
    }
    if (inRight) {
      pointers.右 = right;
    }
    compared++;

    if (!inLeft && !inRight) {
      show(pointers, `${place}：兩邊都沒有節點，一樣。`);
      return true;
    }
    if (!inLeft || !inRight) {
      show(pointers, `${place}：只有一邊有節點，形狀不對稱，馬上停，剩下的不用比了。`);
      return false;
    }
    if (tree[left] !== tree[right]) {
      show(pointers, `${place}：左邊是 ${tree[left]}，右邊是 ${tree[right]}，不一樣，馬上停，剩下的不用比了。`);
      return false;
    }

    const pair = `${tree[left]} 和 ${tree[right]}`;
    show(pointers, `${place}：左邊是 ${tree[left]}，右邊是 ${tree[right]}，一樣。接著比這兩個節點的外側孩子，再比內側孩子。`);
    return mirror(left * 2 + 1, right * 2 + 2, `${pair} 的外側孩子`) && mirror(left * 2 + 2, right * 2 + 1, `${pair} 的內側孩子`);
  }

  show({}, "不用先抄下來。把根的左右兩邊當成兩棵樹同時往下走：外側比外側、內側比內側，一發現不同就馬上停。");
  const isMirror = mirror(1, 2, "根的左右孩子");

  let result = "每一對都一樣，所以是對稱的。";
  if (!isMirror) {
    result = "有一對不一樣，所以不對稱。";
  }
  show({}, `${result}左右兩邊同時走，不用另外抄清單，一共只比較了 ${compared} 次。`);
  return frames;
}

export function buildSearch(preorder: number[], inorder: number[]) {
  const frames: Frame[] = [];
  const tree: Cell[] = ["", "", "", "", "", "", ""];
  let compared = 0;

  frames.push({
    rows: [row("前序", preorder), row("中序", inorder), row("樹", tree, { shape: "tree" })],
    message: "前序的第一個數一定是根。在中序裡找到根，它左邊的數是左子樹，右邊的數是右子樹。問題是怎麼在中序裡找到根。",
  });

  function build(preStart: number, inStart: number, size: number, position: number) {
    if (size === 0) {
      return;
    }

    const rootValue = preorder[preStart];
    const preEnd = preStart + size - 1;
    const inEnd = inStart + size - 1;
    const preRow = row("前序", preorder, { pointers: { 根: preStart }, rangeStart: preStart, rangeEnd: preEnd });
    let rootIndex = 0;

    while (inorder[rootIndex] !== rootValue) {
      compared++;
      frames.push({
        rows: [
          preRow,
          row("中序", inorder, { pointers: { 目前: rootIndex }, rangeStart: inStart, rangeEnd: inEnd }),
          row("樹", tree, { shape: "tree" }),
        ],
        message: `前序這一段的第一個數 ${rootValue} 是根。從中序的最前面一個一個找：${inorder[rootIndex]} 不是 ${rootValue}，再看下一個。`,
      });
      rootIndex++;
    }
    compared++;

    const leftSize = rootIndex - inStart;
    const rightSize = size - 1 - leftSize;
    tree[position] = rootValue;
    frames.push({
      rows: [
        preRow,
        row("中序", inorder, { pointers: { 目前: rootIndex }, rangeStart: inStart, rangeEnd: inEnd }),
        row("樹", tree, { shape: "tree", pointers: { 目前: position } }),
      ],
      message: `前序這一段的第一個數 ${rootValue} 是根，在中序的位置 ${rootIndex} 找到了，接到樹上。這一段裡它左邊的 ${leftSize} 個數是左子樹，右邊的 ${rightSize} 個數是右子樹。`,
    });
    build(preStart + 1, inStart, leftSize, position * 2 + 1);
    build(preStart + 1 + leftSize, rootIndex + 1, rightSize, position * 2 + 2);
  }

  build(0, 0, preorder.length, 0);
  frames.push({
    rows: [row("前序", preorder), row("中序", inorder), row("樹", tree, { shape: "tree" })],
    message: `樹建好了。每個根都從中序的最前面一個一個找，一共比對了 ${compared} 次。`,
  });
  return frames;
}

export function buildHashMap(preorder: number[], inorder: number[]) {
  const frames: Frame[] = [];
  const tree: Cell[] = ["", "", "", "", "", "", ""];
  const indexInInorder: Record<number, number> = {};
  const table: string[] = [];
  let lookups = 0;

  for (let index = 0; index < inorder.length; index++) {
    indexInInorder[inorder[index]] = index;
    table.push(`${inorder[index]}→${index}`);
    frames.push({
      rows: [
        row("前序", preorder),
        row("中序", inorder, { pointers: { 目前: index } }),
        row("雜湊表", table, { indexed: false }),
        row("樹", tree, { shape: "tree" }),
      ],
      message: `先走一遍中序，把每個值的位置記進雜湊表：${inorder[index]} 在位置 ${index}。之後要找根在哪裡，查表就好。`,
    });
  }

  function build(preStart: number, inStart: number, size: number, position: number) {
    if (size === 0) {
      return;
    }

    const rootValue = preorder[preStart];
    const rootIndex = indexInInorder[rootValue];
    const leftSize = rootIndex - inStart;
    const rightSize = size - 1 - leftSize;
    const preEnd = preStart + size - 1;
    const inEnd = inStart + size - 1;
    tree[position] = rootValue;
    lookups++;

    frames.push({
      rows: [
        row("前序", preorder, { pointers: { 根: preStart }, rangeStart: preStart, rangeEnd: preEnd }),
        row("中序", inorder, { pointers: { 根: rootIndex }, rangeStart: inStart, rangeEnd: inEnd }),
        row("雜湊表", table, { pointers: { 查: rootIndex }, indexed: false }),
        row("樹", tree, { shape: "tree", pointers: { 目前: position } }),
      ],
      message: `前序這一段的第一個數 ${rootValue} 是根。查雜湊表，它在中序的位置 ${rootIndex}，不用找。左邊 ${leftSize} 個數是左子樹，右邊 ${rightSize} 個數是右子樹。`,
    });
    build(preStart + 1, inStart, leftSize, position * 2 + 1);
    build(preStart + 1 + leftSize, rootIndex + 1, rightSize, position * 2 + 2);
  }

  build(0, 0, preorder.length, 0);
  frames.push({
    rows: [
      row("前序", preorder),
      row("中序", inorder),
      row("雜湊表", table, { indexed: false }),
      row("樹", tree, { shape: "tree" }),
    ],
    message: `樹建好了。一開始記了 ${table.length} 筆位置，之後每個根只查 1 次雜湊表，不用一個一個比，一共只查了 ${lookups} 次。`,
  });
  return frames;
}

export function invertCopy(tree: Cell[]) {
  const frames: Frame[] = [];
  const copy: Cell[] = tree.map(() => "");
  let walked = 0;
  let created = 0;

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("新樹", copy, { shape: "tree" })],
    message: "一種直覺的做法：另外建一棵新樹，把每個節點抄到左右顛倒的地方。",
  });

  function mirror(index: number, target: number, place: string) {
    if (!hasNode(tree, index)) {
      return;
    }

    const value = tree[index];
    copy[target] = value;
    walked++;
    created++;
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 目前: index } }),
        row("新樹", copy, { shape: "tree", pointers: { 目前: target } }),
      ],
      message: `建一個新節點 ${value}：它${place}。`,
    });
    mirror(index * 2 + 1, target * 2 + 2, `原本是 ${value} 的左孩子，在新樹裡接到 ${value} 的右邊`);
    mirror(index * 2 + 2, target * 2 + 1, `原本是 ${value} 的右孩子，在新樹裡接到 ${value} 的左邊`);
  }

  mirror(0, 0, "是根，在新樹裡也是根");
  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("新樹", copy, { shape: "tree" })],
    message: `新樹就是翻轉後的樹。一共走過 ${walked} 次節點，另外多建了 ${created} 個新節點。`,
  });
  return frames;
}

export function invertInPlace(start: Cell[]) {
  const frames: Frame[] = [];
  const tree = [...start];
  let walked = 0;

  frames.push({
    rows: [row("樹", tree, { shape: "tree" })],
    message: "不建新樹，直接改原本的樹：先把左子樹、右子樹各自翻好，再把左右兩個孩子交換。",
  });

  function swapSubtrees(first: number, second: number) {
    if (first >= tree.length) {
      return;
    }

    const kept = tree[first];
    tree[first] = tree[second];
    tree[second] = kept;
    swapSubtrees(first * 2 + 1, second * 2 + 1);
    swapSubtrees(first * 2 + 2, second * 2 + 2);
  }

  function invert(index: number) {
    if (!hasNode(tree, index)) {
      return;
    }

    const left = index * 2 + 1;
    const right = index * 2 + 2;
    invert(left);
    invert(right);
    walked++;

    const children: Cell[] = [];
    if (hasNode(tree, left)) {
      children.push(tree[left]);
    }
    if (hasNode(tree, right)) {
      children.push(tree[right]);
    }

    let message = `節點 ${tree[index]} 沒有孩子，沒有東西要交換。`;
    if (children.length > 0) {
      swapSubtrees(left, right);
      message = `節點 ${tree[index]} 的左右子樹都翻好了，把它的左右孩子（${children.join("、")}）交換，孩子底下的節點跟著一起搬。`;
    }
    frames.push({
      rows: [row("樹", tree, { shape: "tree", pointers: { 目前: index } })],
      message,
    });
  }

  invert(0);
  frames.push({
    rows: [row("樹", tree, { shape: "tree" })],
    message: `每個節點的左右孩子都交換好了。一樣走過 ${walked} 次節點，差別只在直接改原本的樹，沒有多建任何節點。`,
  });
  return frames;
}
