import { Cell, Frame, row } from "../types";
import { hasNode } from "./treeNodes";

export function bstScanSubtrees(tree: Cell[]) {
  const frames: Frame[] = [];
  let looked = 0;
  let problem = "";

  frames.push({
    rows: [row("樹", tree, { shape: "tree" })],
    message: "二元搜尋樹的規則：每個節點的左子樹全部比它小，右子樹全部比它大。最直接的做法是每個節點都把左右子樹整個掃一遍。",
  });

  function scan(index: number, top: number, side: string): boolean {
    if (!hasNode(tree, index)) {
      return true;
    }

    const value = Number(tree[index]);
    const limit = Number(tree[top]);
    let fits = value < limit;
    let rule = "小";
    if (side === "右") {
      fits = value > limit;
      rule = "大";
    }
    const cells = row("樹", tree, { shape: "tree", pointers: { 檢查: top, 目前: index } });
    const start = `檢查節點 ${limit}：${side}子樹的每個節點都要比 ${limit} ${rule}。`;
    looked++;

    if (!fits) {
      problem = `${value} 在 ${limit} 的${side}子樹裡，卻沒有比 ${limit} ${rule}`;
      frames.push({
        rows: [cells],
        message: `${start}${value} 沒有比 ${limit} ${rule}，不合格。`,
      });
      return false;
    }

    frames.push({
      rows: [cells],
      message: `${start}${value} 比 ${limit} ${rule}，沒問題。`,
    });
    return scan(index * 2 + 1, top, side) && scan(index * 2 + 2, top, side);
  }

  function check(index: number): boolean {
    if (!hasNode(tree, index)) {
      return true;
    }

    const left = index * 2 + 1;
    const right = index * 2 + 2;
    if (!hasNode(tree, left) && !hasNode(tree, right)) {
      frames.push({
        rows: [row("樹", tree, { shape: "tree", pointers: { 檢查: index } })],
        message: `節點 ${tree[index]} 沒有孩子，不用檢查。`,
      });
      return true;
    }

    if (!scan(left, index, "左")) {
      return false;
    }
    if (!scan(right, index, "右")) {
      return false;
    }
    return check(left) && check(right);
  }

  const valid = check(0);
  let result = "每個節點都合格，是二元搜尋樹。";
  if (!valid) {
    result = `${problem}，所以不是二元搜尋樹。`;
  }
  frames.push({
    rows: [row("樹", tree, { shape: "tree" })],
    message: `${result}每個節點都把整棵子樹掃一遍，一共看了 ${looked} 次節點。`,
  });
  return frames;
}

function rangeText(lower: number, upper: number) {
  if (lower === -Infinity && upper === Infinity) {
    return "沒有限制";
  }
  if (lower === -Infinity) {
    return `必須小於 ${upper}`;
  }
  if (upper === Infinity) {
    return `必須大於 ${lower}`;
  }
  return `必須大於 ${lower}、小於 ${upper}`;
}

function rangeCells(lower: number, upper: number) {
  let low = "下界→無";
  if (lower !== -Infinity) {
    low = `下界→${lower}`;
  }
  let high = "上界→無";
  if (upper !== Infinity) {
    high = `上界→${upper}`;
  }
  return [low, high];
}

export function bstBounds(tree: Cell[]) {
  const frames: Frame[] = [];
  let looked = 0;
  let problem = "";

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("範圍", rangeCells(-Infinity, Infinity), { indexed: false })],
    message: "從根往下走，順便帶著「這個節點的值必須落在哪個範圍」。往左走，上界換成目前的值；往右走，下界換成目前的值。",
  });

  function isValid(index: number, lower: number, upper: number): boolean {
    if (!hasNode(tree, index)) {
      return true;
    }

    const value = Number(tree[index]);
    const range = rangeText(lower, upper);
    const rows = [
      row("樹", tree, { shape: "tree", pointers: { 目前: index } }),
      row("範圍", rangeCells(lower, upper), { indexed: false }),
    ];
    looked++;

    if (value <= lower || value >= upper) {
      problem = `節點 ${value} ${range}，它不在範圍內`;
      frames.push({
        rows,
        message: `節點 ${value} ${range}，它不在範圍內，不用再往下看了。`,
      });
      return false;
    }

    frames.push({
      rows,
      message: `節點 ${value} ${range}，合格。往左走上界換成 ${value}，往右走下界換成 ${value}。`,
    });
    return isValid(index * 2 + 1, lower, value) && isValid(index * 2 + 2, value, upper);
  }

  const valid = isValid(0, -Infinity, Infinity);
  let result = "每個節點都在範圍內，是二元搜尋樹。";
  if (!valid) {
    result = `${problem}，所以不是二元搜尋樹。`;
  }
  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("範圍", rangeCells(-Infinity, Infinity), { indexed: false })],
    message: `${result}範圍是邊走邊帶下來的，每個節點只看一次，一共只看了 ${looked} 次節點。`,
  });
  return frames;
}

export function kthSmallestSort(tree: Cell[], k: number) {
  const frames: Frame[] = [];
  const values: number[] = [];
  let walked = 0;

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("清單", values, { indexed: false })],
    message: `要找第 ${k} 小的值。最直接的想法：把整棵樹每個節點的值都抄進清單，排序之後取第 ${k} 個。`,
  });

  function copy(index: number) {
    if (!hasNode(tree, index)) {
      return;
    }

    values.push(Number(tree[index]));
    walked++;
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 目前: index } }),
        row("清單", values, { indexed: false }),
      ],
      message: `把每個節點的值都抄進清單：抄下 ${tree[index]}。`,
    });
    copy(index * 2 + 1);
    copy(index * 2 + 2);
  }

  copy(0);
  values.sort((a, b) => a - b);
  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("清單", values, { indexed: false })],
    message: `整棵樹都抄完了，再把清單裡的 ${values.length} 個值由小到大排序。`,
  });

  const answer = values[k - 1];
  frames.push({
    rows: [
      row("樹", tree, { shape: "tree", answer: [tree.indexOf(answer)] }),
      row("清單", values, { indexed: false, answer: [k - 1] }),
    ],
    message: `排序後的第 ${k} 個是 ${answer}，它就是第 ${k} 小。整棵樹都要走完，一共走過 ${walked} 次節點，還要另外排序一次。`,
  });
  return frames;
}

export function kthSmallestInorder(tree: Cell[], k: number) {
  const frames: Frame[] = [];
  let remaining = k;
  let answer = 0;
  let answerIndex = 0;
  let walked = 0;

  function show(index: number, message: string) {
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: { 目前: index } }),
        row("還要數", [remaining], { indexed: false }),
      ],
      message,
    });
  }

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("還要數", [remaining], { indexed: false })],
    message: `二元搜尋樹照「左、根、右」的順序走，剛好由小到大經過每個節點。所以數到第 ${k} 個就可以停，不用走完，也不用排序。`,
  });

  function inorder(index: number) {
    if (!hasNode(tree, index)) {
      return;
    }

    const value = Number(tree[index]);
    walked++;
    show(index, `走進節點 ${value}。比它小的都在左邊，所以先往左走，左邊走完才輪到它。`);
    inorder(index * 2 + 1);
    if (remaining === 0) {
      return;
    }

    remaining--;
    if (remaining === 0) {
      answer = value;
      answerIndex = index;
      show(index, `左邊走完了，輪到節點 ${value}，它是第 ${k} 小，找到了，剩下的節點都不用走。`);
      return;
    }

    show(index, `左邊走完了，輪到節點 ${value}，它是第 ${k - remaining} 小，還要再數 ${remaining} 個，往右邊走。`);
    inorder(index * 2 + 2);
  }

  inorder(0);
  frames.push({
    rows: [
      row("樹", tree, { shape: "tree", answer: [answerIndex] }),
      row("還要數", [remaining], { indexed: false }),
    ],
    message: `第 ${k} 小的值是 ${answer}。數到第 ${k} 個就停，一共只走過 ${walked} 次節點，也不用排序。`,
  });
  return frames;
}
