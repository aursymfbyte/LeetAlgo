import { Cell, Frame, ProblemAnimation, row } from "./types";

function hasNode(tree: Cell[], index: number) {
  return index < tree.length && tree[index] !== "";
}

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

function bstScanSubtrees(tree: Cell[]) {
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

function bstBounds(tree: Cell[]) {
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

function sameTreeLists(p: Cell[], q: Cell[]) {
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

function sameTreeTogether(p: Cell[], q: Cell[]) {
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

function symmetricLists(tree: Cell[]) {
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

function symmetricMirror(tree: Cell[]) {
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

function levelOrderFromRoot(tree: Cell[]) {
  const frames: Frame[] = [];
  const answer: string[] = [];
  let level: Cell[] = [];
  let target = 0;
  let walked = 0;

  function show(pointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers }),
        row("這一層", level, { indexed: false }),
        row("答案", answer, { indexed: false }),
      ],
      message,
    });
  }

  function collect(index: number, depth: number) {
    if (!hasNode(tree, index)) {
      return;
    }

    const start = `要找第 ${target + 1} 層，從根重新往下走：`;
    walked++;

    if (depth === target) {
      level.push(tree[index]);
      show({ 目前: index }, `${start}節點 ${tree[index]} 在第 ${depth + 1} 層，收下。`);
      return;
    }

    show({ 目前: index }, `${start}節點 ${tree[index]} 在第 ${depth + 1} 層，還沒到，繼續往下。`);
    collect(index * 2 + 1, depth + 1);
    collect(index * 2 + 2, depth + 1);
  }

  collect(0, 0);
  while (level.length > 0) {
    answer.push(level.join(","));
    show({}, `第 ${target + 1} 層收齊了，把 ${level.join("、")} 記進答案。下一層又要從根重新走。`);
    level = [];
    target++;
    collect(0, 0);
  }

  frames.push({
    rows: [
      row("樹", tree, { shape: "tree" }),
      row("這一層", level, { indexed: false }),
      row("答案", answer, { indexed: false, answer: answer.map((item, index) => index) }),
    ],
    message: `第 ${target + 1} 層一個節點也沒有，結束，答案有 ${answer.length} 層。每一層都從根重新走一遍，一共走過 ${walked} 次節點。`,
  });
  return frames;
}

function levelOrderQueue(tree: Cell[]) {
  const frames: Frame[] = [];
  const answer: string[] = [];
  const queue = [0];
  let level: Cell[] = [];
  let walked = 0;

  function show(pointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers }),
        row("佇列", queue.map((index) => tree[index]), { indexed: false }),
        row("這一層", level, { indexed: false }),
        row("答案", answer, { indexed: false }),
      ],
      message,
    });
  }

  show({}, "先把根放進佇列。每一輪開始時，佇列裡剛好是同一層的所有節點，先記下有幾個，就知道這一層要取幾次。");

  while (queue.length > 0) {
    const size = queue.length;
    level = [];

    for (let count = 0; count < size; count++) {
      const index = queue[0];
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      const children: Cell[] = [];
      queue.shift();
      level.push(tree[index]);
      walked++;

      if (hasNode(tree, left)) {
        queue.push(left);
        children.push(tree[left]);
      }
      if (hasNode(tree, right)) {
        queue.push(right);
        children.push(tree[right]);
      }

      let next = "它沒有孩子。";
      if (children.length > 0) {
        next = `把它的孩子 ${children.join("、")} 放進佇列。`;
      }
      show({ 目前: index }, `這一層有 ${size} 個節點。從佇列取出 ${tree[index]}，記進這一層。${next}`);
    }

    answer.push(level.join(","));
    let rest = "佇列裡剩下的剛好就是下一層。";
    if (queue.length === 0) {
      rest = "佇列空了，沒有下一層。";
    }
    show({}, `這一層的 ${size} 個節點都取完了，把 ${level.join("、")} 記進答案。${rest}`);
  }

  frames.push({
    rows: [
      row("樹", tree, { shape: "tree" }),
      row("佇列", [], { indexed: false }),
      row("這一層", [], { indexed: false }),
      row("答案", answer, { indexed: false, answer: answer.map((item, index) => index) }),
    ],
    message: `答案有 ${answer.length} 層。不用回到根重新走，每個節點只進出佇列一次，一共只走過 ${walked} 次節點。`,
  });
  return frames;
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

function depthEveryLeaf(tree: Cell[]) {
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

function depthBottomUp(tree: Cell[]) {
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

function buildSearch(preorder: number[], inorder: number[]) {
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

function buildHashMap(preorder: number[], inorder: number[]) {
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

function balancedRecount(tree: Cell[]) {
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

function balancedOnePass(tree: Cell[]) {
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

function pathSumRecount(tree: Cell[]) {
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

function pathSumOnePass(tree: Cell[]) {
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

function rightViewFromRoot(tree: Cell[]) {
  const frames: Frame[] = [];
  const answer: Cell[] = [];
  const seen: number[] = [];
  let level: number[] = [];
  let target = 0;
  let walked = 0;

  function show(pointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers, answer: [...seen] }),
        row("這一層", level.map((index) => tree[index]), { indexed: false }),
        row("答案", answer, { indexed: false }),
      ],
      message,
    });
  }

  function collect(index: number, depth: number) {
    if (!hasNode(tree, index)) {
      return;
    }

    const start = `要找第 ${target + 1} 層，從根重新往下走：`;
    walked++;

    if (depth === target) {
      level.push(index);
      show({ 目前: index }, `${start}節點 ${tree[index]} 在第 ${depth + 1} 層，收下。`);
      return;
    }

    show({ 目前: index }, `${start}節點 ${tree[index]} 在第 ${depth + 1} 層，還沒到，繼續往下。`);
    collect(index * 2 + 1, depth + 1);
    collect(index * 2 + 2, depth + 1);
  }

  collect(0, 0);
  while (level.length > 0) {
    const last = level[level.length - 1];
    answer.push(tree[last]);
    seen.push(last);
    show({ 目前: last }, `第 ${target + 1} 層收齊了，最右邊的是 ${tree[last]}，記進答案。下一層又要從根重新走。`);
    level = [];
    target++;
    collect(0, 0);
  }

  show({}, `第 ${target + 1} 層一個節點也沒有，結束。從右邊看到的是 ${answer.join("、")}。每一層都從根重新走一遍，一共走過 ${walked} 次節點。`);
  return frames;
}

function rightViewRightFirst(tree: Cell[]) {
  const frames: Frame[] = [];
  const answer: Cell[] = [];
  const seen: number[] = [];
  let walked = 0;

  function show(pointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers, answer: [...seen] }),
        row("答案", answer, { indexed: false }),
      ],
      message,
    });
  }

  show({}, "每個節點都先走右邊、再走左邊。這樣每一層第一個遇到的節點，一定是那一層最右邊的，整棵樹只要走一遍。");

  function visit(index: number, depth: number) {
    if (!hasNode(tree, index)) {
      return;
    }

    const value = tree[index];
    const start = `走到節點 ${value}，它在第 ${depth + 1} 層，答案裡已經記了 ${answer.length} 層。`;
    walked++;

    if (depth === answer.length) {
      answer.push(value);
      seen.push(index);
      show({ 目前: index }, `${start}這一層還沒記過，第一個遇到的 ${value} 就是最右邊的，記進答案。`);
    } else {
      show({ 目前: index }, `${start}這一層已經記過了，${value} 被右邊的節點擋住，不記。`);
    }
    visit(index * 2 + 2, depth + 1);
    visit(index * 2 + 1, depth + 1);
  }

  visit(0, 0);
  show({}, `從右邊看到的是 ${answer.join("、")}。先右後左，不用每一層都回到根，一共只走過 ${walked} 次節點。`);
  return frames;
}

function invertCopy(tree: Cell[]) {
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

function invertInPlace(start: Cell[]) {
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

function kthSmallestSort(tree: Cell[], k: number) {
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

function kthSmallestInorder(tree: Cell[], k: number) {
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

function ancestorSearchEach(tree: Cell[], p: number, q: number) {
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

function ancestorOnePass(tree: Cell[], p: number, q: number) {
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

function diameterRecount(tree: Cell[]) {
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

function diameterOnePass(tree: Cell[]) {
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

const searchTree: Cell[] = [8, 4, 12, 2, 6, 10, 14, "", "", "", "", 9, 13, "", ""];
const sameP: Cell[] = [1, 2, 3, 4, "", "", ""];
const sameQ: Cell[] = [1, 2, 3, 5, "", "", ""];
const mirrorTree: Cell[] = [1, 2, 2, 3, 4, 5, 3];
const levelTree: Cell[] = [3, 9, 20, "", "", 15, 7];
const buildPreorder = [3, 9, 20, 15, 7];
const buildInorder = [9, 3, 15, 20, 7];
const leaningTree: Cell[] = [1, 2, 5, 3, "", 6, "", 4, "", "", "", "", "", "", ""];
const pathTree: Cell[] = [-10, 9, 20, -3, 4, 15, 7];
const viewTree: Cell[] = [1, 2, 3, 4, 5, "", ""];
const invertTree: Cell[] = [4, 2, 7, 1, 3, 6, 9];
const kthTree: Cell[] = [5, 3, 7, 2, 4, 6, 8];
const ancestorTree: Cell[] = [3, 5, 1, 6, 2, 0, 8, "", "", 7, 4, "", "", "", ""];
const diameterTree: Cell[] = [1, 2, "", 4, 5, "", "", 6, "", "", 7, "", "", "", ""];

export const stage4b: ProblemAnimation[] = [
  {
    problemId: 98,
    brute: bstScanSubtrees(searchTree),
    efficient: bstBounds(searchTree),
  },
  {
    problemId: 100,
    brute: sameTreeLists(sameP, sameQ),
    efficient: sameTreeTogether(sameP, sameQ),
  },
  {
    problemId: 101,
    brute: symmetricLists(mirrorTree),
    efficient: symmetricMirror(mirrorTree),
  },
  {
    problemId: 102,
    brute: levelOrderFromRoot(levelTree),
    efficient: levelOrderQueue(levelTree),
  },
  {
    problemId: 104,
    brute: depthEveryLeaf(levelTree),
    efficient: depthBottomUp(levelTree),
  },
  {
    problemId: 105,
    brute: buildSearch(buildPreorder, buildInorder),
    efficient: buildHashMap(buildPreorder, buildInorder),
  },
  {
    problemId: 110,
    brute: balancedRecount(leaningTree),
    efficient: balancedOnePass(leaningTree),
  },
  {
    problemId: 124,
    brute: pathSumRecount(pathTree),
    efficient: pathSumOnePass(pathTree),
  },
  {
    problemId: 199,
    brute: rightViewFromRoot(viewTree),
    efficient: rightViewRightFirst(viewTree),
  },
  {
    problemId: 226,
    brute: invertCopy(invertTree),
    efficient: invertInPlace(invertTree),
  },
  {
    problemId: 230,
    brute: kthSmallestSort(kthTree, 3),
    efficient: kthSmallestInorder(kthTree, 3),
  },
  {
    problemId: 236,
    brute: ancestorSearchEach(ancestorTree, 7, 4),
    efficient: ancestorOnePass(ancestorTree, 7, 4),
  },
  {
    problemId: 543,
    brute: diameterRecount(diameterTree),
    efficient: diameterOnePass(diameterTree),
  },
];
