import { Cell, Frame, row } from "../types";
import { hasNode } from "./treeNodes";

function unknownTree(tree: Cell[]) {
  const cells: Cell[] = [];
  for (const cell of tree) {
    if (cell === "") {
      cells.push("");
    } else {
      cells.push("?");
    }
  }
  return cells;
}

function pathFromRoot(index: number) {
  const path = [index];
  let current = index;
  while (current > 0) {
    current = Math.floor((current - 1) / 2);
    path.unshift(current);
  }
  return path;
}

export function depthEveryLeaf(tree: Cell[]) {
  const frames: Frame[] = [];
  let best = 0;
  let walked = 0;

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("路徑", [], { indexed: false })],
    message: "最直接的想法：找出每一片葉子，每次都從根走到那片葉子，數一數經過幾個節點，最多的就是最大深度。",
  });

  for (let leaf = 0; leaf < tree.length; leaf++) {
    const hasLeft = hasNode(tree, leaf * 2 + 1);
    const hasRight = hasNode(tree, leaf * 2 + 2);
    if (!hasNode(tree, leaf) || hasLeft || hasRight) {
      continue;
    }

    const path: Cell[] = [];
    for (const index of pathFromRoot(leaf)) {
      path.push(tree[index]);
      walked++;
      const rows = [
        row("樹", tree, { shape: "tree", pointers: { 葉: leaf, 目前: index } }),
        row("路徑", path, { indexed: false }),
      ];

      if (index === leaf) {
        best = Math.max(best, path.length);
        frames.push({
          rows,
          message: `走到葉子 ${tree[leaf]} 了，這條路上有 ${path.length} 個節點，目前最深是 ${best}。`,
        });
      } else {
        frames.push({
          rows,
          message: `從根重新走到葉子 ${tree[leaf]}：經過 ${tree[index]}，數到 ${path.length}。`,
        });
      }
    }
  }

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("路徑", [], { indexed: false })],
    message: `最大深度是 ${best}。每片葉子都從根重新走一遍，上面的節點被重複走很多次，一共走過 ${walked} 次節點。`,
  });
  return frames;
}

export function depthBottomUp(tree: Cell[]) {
  const frames: Frame[] = [];
  const depths = unknownTree(tree);
  let walked = 0;

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("深度", depths, { shape: "tree" })],
    message: "一棵樹的深度 = 左右子樹比較深的那個再加 1，沒有節點的地方深度是 0。由下往上算，每個節點算好就交給上面的節點用。",
  });

  function depth(index: number): number {
    if (!hasNode(tree, index)) {
      return 0;
    }

    const left = depth(index * 2 + 1);
    const right = depth(index * 2 + 2);
    const result = Math.max(left, right) + 1;
    depths[index] = result;
    walked++;

    let message = `節點 ${tree[index]}：左子樹深度 ${left}，右子樹深度 ${right}，取大的再加 1，深度是 ${result}。`;
    if (left === 0 && right === 0) {
      message = `節點 ${tree[index]} 沒有孩子，左右深度都是 0，加 1 之後深度是 1。`;
    }
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 目前: index } }),
        row("深度", depths, { shape: "tree", pointers: { 目前: index } }),
      ],
      message,
    });
    return result;
  }

  const best = depth(0);
  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("深度", depths, { shape: "tree", answer: [0] })],
    message: `根節點的深度就是答案：最大深度是 ${best}。每個節點只算一次，一共只走過 ${walked} 次節點。`,
  });
  return frames;
}

export function balancedRecount(tree: Cell[]) {
  const frames: Frame[] = [];
  let heights = unknownTree(tree);
  let walked = 0;
  let problem = "";

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("高度", heights, { shape: "tree" })],
    message: "每個節點的左右子樹高度不能差超過 1。最直接的做法：每檢查一個節點，就重新往下把它左右子樹的高度算一次。",
  });

  function height(index: number, top: number): number {
    if (!hasNode(tree, index)) {
      return 0;
    }

    const left = height(index * 2 + 1, top);
    const right = height(index * 2 + 2, top);
    const result = Math.max(left, right) + 1;
    heights[index] = result;
    walked++;
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 檢查: top, 目前: index } }),
        row("高度", heights, { shape: "tree", pointers: { 目前: index } }),
      ],
      message: `檢查節點 ${tree[top]}，要重新往下算高度：節點 ${tree[index]} 的高度是 ${result}。`,
    });
    return result;
  }

  function check(index: number): boolean {
    if (!hasNode(tree, index)) {
      return true;
    }

    heights = unknownTree(tree);
    const left = height(index * 2 + 1, index);
    const right = height(index * 2 + 2, index);
    const gap = Math.abs(left - right);
    const rows = [
      row("樹", tree, { shape: "tree", pointers: { 檢查: index } }),
      row("高度", heights, { shape: "tree" }),
    ];
    const text = `節點 ${tree[index]}：左子樹高度 ${left}，右子樹高度 ${right}，相差 ${gap}`;

    if (gap > 1) {
      problem = `節點 ${tree[index]} 的左右子樹高度相差 ${gap}`;
      frames.push({
        rows,
        message: `${text}，超過 1，不平衡。`,
      });
      return false;
    }

    frames.push({
      rows,
      message: `${text}，沒問題。剛才算的高度用完就丟，接著檢查它的孩子，高度又要重算。`,
    });
    return check(index * 2 + 1) && check(index * 2 + 2);
  }

  const balanced = check(0);
  let result = "每個節點都沒問題，是平衡二元樹。";
  if (!balanced) {
    result = `${problem}，所以不是平衡二元樹。`;
  }
  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("高度", heights, { shape: "tree" })],
    message: `${result}每檢查一個節點就重新往下算高度，一共走過 ${walked} 次節點。`,
  });
  return frames;
}

export function balancedOnePass(tree: Cell[]) {
  const frames: Frame[] = [];
  const heights = unknownTree(tree);
  let walked = 0;

  function show(index: number, message: string) {
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 目前: index } }),
        row("高度", heights, { shape: "tree", pointers: { 目前: index } }),
      ],
      message,
    });
  }

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("高度", heights, { shape: "tree" })],
    message: "由下往上，每個節點只算一次高度，順便檢查左右高度差。一發現不平衡就回傳 -1，上面的節點看到 -1 就直接往上傳。",
  });

  function getHeight(index: number): number {
    if (!hasNode(tree, index)) {
      return 0;
    }

    const value = tree[index];
    walked++;

    const left = getHeight(index * 2 + 1);
    if (left === -1) {
      heights[index] = -1;
      show(index, `節點 ${value}：左子樹回傳 -1，代表下面已經不平衡。右子樹不用算了，直接往上回傳 -1。`);
      return -1;
    }

    const right = getHeight(index * 2 + 2);
    if (right === -1) {
      heights[index] = -1;
      show(index, `節點 ${value}：右子樹回傳 -1，代表下面已經不平衡，直接往上回傳 -1。`);
      return -1;
    }

    const gap = Math.abs(left - right);
    const text = `節點 ${value}：左子樹高度 ${left}，右子樹高度 ${right}，相差 ${gap}`;
    if (gap > 1) {
      heights[index] = -1;
      show(index, `${text}，超過 1，不平衡，回傳 -1。`);
      return -1;
    }

    const result = Math.max(left, right) + 1;
    heights[index] = result;
    show(index, `${text}，沒問題。它的高度是 ${result}，交給上面的節點用。`);
    return result;
  }

  const rootHeight = getHeight(0);
  let result = "根節點回傳的不是 -1，所以是平衡二元樹。";
  if (rootHeight === -1) {
    result = "根節點回傳 -1，所以不是平衡二元樹。";
  }
  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("高度", heights, { shape: "tree" })],
    message: `${result}高度由下往上只算一次，還沒走到的節點也不用看了，一共只走過 ${walked} 次節點。`,
  });
  return frames;
}

export function pathSumRecount(tree: Cell[]) {
  const frames: Frame[] = [];
  let chains = unknownTree(tree);
  let best = -Infinity;
  let bestIndex = 0;
  let walked = 0;

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("鏈和", chains, { shape: "tree" })],
    message: "每條路徑都有一個最高的轉折點，路徑和 = 轉折點的值 + 左邊往下最大的鏈 + 右邊往下最大的鏈，負的鏈不接。每個轉折點都重新往下算。",
  });

  function chain(index: number, top: number): number {
    if (!hasNode(tree, index)) {
      return 0;
    }

    const leftChain = chain(index * 2 + 1, top);
    const rightChain = chain(index * 2 + 2, top);
    const left = Math.max(leftChain, 0);
    const right = Math.max(rightChain, 0);
    const result = Number(tree[index]) + Math.max(left, right);
    chains[index] = result;
    walked++;
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 轉折: top, 目前: index } }),
        row("鏈和", chains, { shape: "tree", pointers: { 目前: index } }),
      ],
      message: `以節點 ${tree[top]} 當轉折點，要重新往下算鏈和：從節點 ${tree[index]} 往下走，最大的鏈和是 ${result}。`,
    });
    return result;
  }

  function turnAt(index: number) {
    if (!hasNode(tree, index)) {
      return;
    }

    chains = unknownTree(tree);
    const value = Number(tree[index]);
    const leftChain = chain(index * 2 + 1, index);
    const rightChain = chain(index * 2 + 2, index);
    const left = Math.max(leftChain, 0);
    const right = Math.max(rightChain, 0);
    const sum = value + left + right;
    if (sum > best) {
      best = sum;
      bestIndex = index;
    }

    let note = "";
    if (leftChain < 0 || rightChain < 0) {
      note = "負的鏈不接，當成 0。";
    }
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 轉折: index } }),
        row("鏈和", chains, { shape: "tree" }),
      ],
      message: `以節點 ${value} 當轉折點：${note}${value} + 左邊的鏈 ${left} + 右邊的鏈 ${right} = ${sum}，目前最大是 ${best}。剛才算的鏈和用完就丟。`,
    });
    turnAt(index * 2 + 1);
    turnAt(index * 2 + 2);
  }

  turnAt(0);
  frames.push({
    rows: [row("樹", tree, { shape: "tree", answer: [bestIndex] }), row("鏈和", chains, { shape: "tree" })],
    message: `最大路徑和是 ${best}，轉折點是節點 ${tree[bestIndex]}。每個轉折點都重新往下算鏈和，一共走過 ${walked} 次節點。`,
  });
  return frames;
}

export function pathSumOnePass(tree: Cell[]) {
  const frames: Frame[] = [];
  const chains = unknownTree(tree);
  let best = -Infinity;
  let bestIndex = 0;
  let walked = 0;

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("鏈和", chains, { shape: "tree" })],
    message: "由下往上，每個節點只算一次「從它往下走最大的鏈和」，算好交給上面的節點用，同時用左右兩條鏈都接上的總和更新答案。",
  });

  function maxChain(index: number): number {
    if (!hasNode(tree, index)) {
      return 0;
    }

    const value = Number(tree[index]);
    const leftChain = maxChain(index * 2 + 1);
    const rightChain = maxChain(index * 2 + 2);
    const left = Math.max(leftChain, 0);
    const right = Math.max(rightChain, 0);
    const sum = value + left + right;
    const longer = Math.max(left, right);
    const result = value + longer;
    if (sum > best) {
      best = sum;
      bestIndex = index;
    }
    chains[index] = result;
    walked++;

    let note = "";
    if (leftChain < 0 || rightChain < 0) {
      note = "負的鏈不接，當成 0。";
    }
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 目前: index } }),
        row("鏈和", chains, { shape: "tree", pointers: { 目前: index } }),
      ],
      message: `節點 ${value}：${note}${value} + 左邊的鏈 ${left} + 右邊的鏈 ${right} = ${sum}，目前最大是 ${best}。往上只能帶一條鏈，回傳 ${value} + ${longer} = ${result}。`,
    });
    return result;
  }

  maxChain(0);
  frames.push({
    rows: [row("樹", tree, { shape: "tree", answer: [bestIndex] }), row("鏈和", chains, { shape: "tree" })],
    message: `最大路徑和是 ${best}，轉折點是節點 ${tree[bestIndex]}。每個節點的鏈和只算一次，一共只走過 ${walked} 次節點。`,
  });
  return frames;
}

export function ancestorSearchEach(tree: Cell[], p: number, q: number) {
  const frames: Frame[] = [];
  const pIndex = tree.indexOf(p);
  const qIndex = tree.indexOf(q);
  let seen: Cell[] = [];
  let walked = 0;

  function show(index: number, message: string) {
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 目前: index, p: pIndex, q: qIndex } }),
        row("走過", seen, { indexed: false }),
      ],
      message,
    });
  }

  function contains(index: number, target: number): boolean {
    if (!hasNode(tree, index)) {
      return false;
    }

    seen.push(tree[index]);
    walked++;
    if (index === target) {
      return true;
    }
    return contains(index * 2 + 1, target) || contains(index * 2 + 2, target);
  }

  function search(index: number, side: string, child: number, target: number) {
    seen = [];
    const found = contains(child, target);
    let result = "沒找到";
    if (found) {
      result = "找到了";
    }
    show(index, `站在節點 ${tree[index]}：到它的${side}子樹裡找 ${tree[target]}，走過 ${seen.length} 個節點，${result}。`);
    return found;
  }

  function find(index: number): number {
    const left = index * 2 + 1;
    const right = index * 2 + 2;

    const bothLeft = search(index, "左", left, pIndex) && search(index, "左", left, qIndex);
    if (bothLeft) {
      seen = [];
      show(left, `${p} 和 ${q} 都在節點 ${tree[index]} 的左子樹裡，答案在更下面。往左走到節點 ${tree[left]}，再重新搜尋一次。`);
      return find(left);
    }

    const bothRight = search(index, "右", right, pIndex) && search(index, "右", right, qIndex);
    if (bothRight) {
      seen = [];
      show(right, `${p} 和 ${q} 都在節點 ${tree[index]} 的右子樹裡，答案在更下面。往右走到節點 ${tree[right]}，再重新搜尋一次。`);
      return find(right);
    }

    return index;
  }

  frames.push({
    rows: [
      row("樹", tree, { shape: "tree", pointers: { p: pIndex, q: qIndex } }),
      row("走過", seen, { indexed: false }),
    ],
    message: `要找 ${p} 和 ${q} 的最近公共祖先。最直接的做法：從根開始，每到一個節點就搜尋它的子樹，看 ${p} 和 ${q} 是不是都在同一邊。`,
  });

  const answer = find(0);
  frames.push({
    rows: [
      row("樹", tree, { shape: "tree", pointers: { p: pIndex, q: qIndex }, answer: [answer] }),
      row("走過", [], { indexed: false }),
    ],
    message: `${p} 和 ${q} 沒有都在節點 ${tree[answer]} 的同一邊，所以 ${tree[answer]} 就是最近公共祖先。每到一個節點就重新搜尋子樹，一共走過 ${walked} 次節點。`,
  });
  return frames;
}

export function ancestorOnePass(tree: Cell[], p: number, q: number) {
  const frames: Frame[] = [];
  const pIndex = tree.indexOf(p);
  const qIndex = tree.indexOf(q);
  const results = unknownTree(tree);
  let walked = 0;

  function show(index: number, message: string) {
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 目前: index, p: pIndex, q: qIndex } }),
        row("回傳", results, { shape: "tree", pointers: { 目前: index } }),
      ],
      message,
    });
  }

  frames.push({
    rows: [
      row("樹", tree, { shape: "tree", pointers: { p: pIndex, q: qIndex } }),
      row("回傳", results, { shape: "tree" }),
    ],
    message: `每個節點只走一次，回傳「我這棵子樹裡找到了誰」。遇到 ${p} 或 ${q} 就回傳自己；左右兩邊都有找到，這個節點就是最近公共祖先。`,
  });

  function find(index: number): number {
    if (!hasNode(tree, index)) {
      return -1;
    }

    const value = tree[index];
    walked++;
    if (index === pIndex || index === qIndex) {
      results[index] = value;
      show(index, `節點 ${value} 就是要找的節點，直接回傳自己，不用再往下走。`);
      return index;
    }

    const left = find(index * 2 + 1);
    const right = find(index * 2 + 2);
    if (left !== -1 && right !== -1) {
      results[index] = value;
      show(index, `節點 ${value}：左邊回傳 ${tree[left]}，右邊回傳 ${tree[right]}，兩邊都找到了，所以 ${value} 就是最近公共祖先，回傳自己。`);
      return index;
    }
    if (left !== -1) {
      results[index] = tree[left];
      show(index, `節點 ${value}：只有左邊找到東西，把左邊回傳的 ${tree[left]} 原封不動往上傳。`);
      return left;
    }
    if (right !== -1) {
      results[index] = tree[right];
      show(index, `節點 ${value}：只有右邊找到東西，把右邊回傳的 ${tree[right]} 原封不動往上傳。`);
      return right;
    }

    results[index] = "空";
    show(index, `節點 ${value}：左右兩邊都沒找到，回傳空。`);
    return -1;
  }

  const answer = find(0);
  frames.push({
    rows: [
      row("樹", tree, { shape: "tree", pointers: { p: pIndex, q: qIndex }, answer: [answer] }),
      row("回傳", results, { shape: "tree", answer: [0] }),
    ],
    message: `根節點回傳 ${tree[answer]}，${p} 和 ${q} 的最近公共祖先就是節點 ${tree[answer]}。每個節點最多走一次，一共只走過 ${walked} 次節點。`,
  });
  return frames;
}

export function diameterRecount(tree: Cell[]) {
  const frames: Frame[] = [];
  let depths = unknownTree(tree);
  let best = 0;
  let bestIndex = 0;
  let walked = 0;

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("深度", depths, { shape: "tree" })],
    message: "直徑是最長那條路徑的邊數。以某個節點當轉折點，最長路徑的邊數 = 左子樹深度 + 右子樹深度。最直接的做法：每個節點都重新往下算深度。",
  });

  function depth(index: number, top: number): number {
    if (!hasNode(tree, index)) {
      return 0;
    }

    const left = depth(index * 2 + 1, top);
    const right = depth(index * 2 + 2, top);
    const result = Math.max(left, right) + 1;
    depths[index] = result;
    walked++;
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 轉折: top, 目前: index } }),
        row("深度", depths, { shape: "tree", pointers: { 目前: index } }),
      ],
      message: `以節點 ${tree[top]} 當轉折點，要重新往下算深度：節點 ${tree[index]} 的深度是 ${result}。`,
    });
    return result;
  }

  function turnAt(index: number) {
    if (!hasNode(tree, index)) {
      return;
    }

    depths = unknownTree(tree);
    const left = depth(index * 2 + 1, index);
    const right = depth(index * 2 + 2, index);
    const length = left + right;
    if (length > best) {
      best = length;
      bestIndex = index;
    }
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 轉折: index } }),
        row("深度", depths, { shape: "tree" }),
      ],
      message: `以節點 ${tree[index]} 當轉折點：左子樹深度 ${left} + 右子樹深度 ${right} = ${length} 條邊，目前最長是 ${best}。剛才算的深度用完就丟。`,
    });
    turnAt(index * 2 + 1);
    turnAt(index * 2 + 2);
  }

  turnAt(0);
  frames.push({
    rows: [row("樹", tree, { shape: "tree", answer: [bestIndex] }), row("深度", depths, { shape: "tree" })],
    message: `直徑是 ${best}，最長的路徑以節點 ${tree[bestIndex]} 當轉折點。每個轉折點都重新往下算深度，一共走過 ${walked} 次節點。`,
  });
  return frames;
}

export function diameterOnePass(tree: Cell[]) {
  const frames: Frame[] = [];
  const depths = unknownTree(tree);
  let best = 0;
  let bestIndex = 0;
  let walked = 0;

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("深度", depths, { shape: "tree" })],
    message: "由下往上，每個節點只算一次深度，算好交給上面的節點用，同時用「左子樹深度 + 右子樹深度」更新答案。",
  });

  function getDepth(index: number): number {
    if (!hasNode(tree, index)) {
      return 0;
    }

    const left = getDepth(index * 2 + 1);
    const right = getDepth(index * 2 + 2);
    const length = left + right;
    const result = Math.max(left, right) + 1;
    if (length > best) {
      best = length;
      bestIndex = index;
    }
    depths[index] = result;
    walked++;
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 目前: index } }),
        row("深度", depths, { shape: "tree", pointers: { 目前: index } }),
      ],
      message: `節點 ${tree[index]}：左子樹深度 ${left} + 右子樹深度 ${right} = ${length} 條邊，目前最長是 ${best}。它自己的深度是 ${result}，交給上面的節點用。`,
    });
    return result;
  }

  getDepth(0);
  frames.push({
    rows: [row("樹", tree, { shape: "tree", answer: [bestIndex] }), row("深度", depths, { shape: "tree" })],
    message: `直徑是 ${best}，最長的路徑以節點 ${tree[bestIndex]} 當轉折點。每個節點的深度只算一次，一共只走過 ${walked} 次節點。`,
  });
  return frames;
}
