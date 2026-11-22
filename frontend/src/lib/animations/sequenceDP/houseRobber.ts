import { Cell, Frame, row } from "../types";

function robPlans(count: number) {
  const plans: number[][] = [];
  const chosen: number[] = [];

  function choose(house: number) {
    if (house >= count) {
      plans.push([...chosen]);
      return;
    }
    chosen.push(house);
    choose(house + 2);
    chosen.pop();
    choose(house + 1);
  }

  choose(0);
  return plans;
}

function planCells(count: number, plan: number[]) {
  const cells: string[] = [];
  for (let house = 0; house < count; house++) {
    if (plan.includes(house)) {
      cells.push("偷");
    } else {
      cells.push("不偷");
    }
  }
  return cells;
}

function planText(plan: number[]) {
  if (plan.length === 0) {
    return "一間都不偷";
  }
  return `偷位置 ${plan.join("、")}`;
}

function planTotal(nums: number[], plan: number[]) {
  let total = 0;
  for (const house of plan) {
    total += nums[house];
  }
  return total;
}

export function robBrute(nums: number[]) {
  const frames: Frame[] = [];
  const count = nums.length;
  const plans = robPlans(count);
  let best = -Infinity;
  let bestPlan: number[] = [];
  let compared = 0;

  for (const plan of plans) {
    const total = planTotal(nums, plan);
    compared++;
    if (total > best) {
      best = total;
      bestPlan = plan;
    }
    frames.push({
      rows: [row("陣列", nums), row("偷法", planCells(count, plan))],
      message: `不相鄰的偷法一種一種列出來。第 ${compared} 種：${planText(plan)}，總和是 ${total}，目前最多是 ${best}。`,
    });
  }

  frames.push({
    rows: [row("陣列", nums, { answer: bestPlan }), row("偷法", planCells(count, bestPlan), { answer: bestPlan })],
    message: `最多能偷 ${best}：${planText(bestPlan)}。不相鄰的偷法全部列出來有 ${plans.length} 種，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function robTwoValues(nums: number[]) {
  const frames: Frame[] = [];
  let f0 = 0;
  let f1 = nums[0];
  let compared = 0;

  frames.push({
    rows: [
      row("陣列", nums, { pointers: { 目前: 0 }, rangeEnd: 0 }),
      row("記住的值", [`f0→${f0}`, `f1→${f1}`], { indexed: false }),
    ],
    message: `f1 記住「看到前一間為止最多能偷多少」，f0 記住「看到前兩間為止」。一開始只看了位置 0：f1 是偷它的 ${f1}，f0 是 0。`,
  });

  for (let house = 1; house < nums.length; house++) {
    const money = nums[house];
    const robbed = f0 + money;
    const newF = Math.max(f1, robbed);
    compared++;
    frames.push({
      rows: [
        row("陣列", nums, { pointers: { 目前: house }, rangeEnd: house }),
        row("記住的值", [`f0→${f0}`, `f1→${f1}`, `新值→${newF}`], { indexed: false }),
      ],
      message: `位置 ${house} 有 ${money}。不偷它：維持 f1 的 ${f1}。偷它：前一間不能偷，用 f0 的 ${f0} + ${money} = ${robbed}。取大的 ${newF}，f0 換成 ${f1}，f1 換成 ${newF}。`,
    });
    f0 = f1;
    f1 = newF;
  }

  frames.push({
    rows: [row("陣列", nums), row("記住的值", [`f0→${f0}`, `f1→${f1}`], { answer: [1], indexed: false })],
    message: `每間房子都看過了，f1 就是答案：最多能偷 ${f1}。每間房子只比一次「偷」和「不偷」，一共只比較了 ${compared} 次。`,
  });
  return frames;
}

export function robCircleBrute(nums: number[]) {
  const frames: Frame[] = [];
  const count = nums.length;
  const last = count - 1;
  const plans = robPlans(count);
  let best = -Infinity;
  let bestPlan: number[] = [];
  let listed = 0;
  let rejected = 0;
  let compared = 0;

  for (const plan of plans) {
    listed++;

    if (plan.includes(0) && plan.includes(last)) {
      rejected++;
      frames.push({
        rows: [row("陣列", nums), row("偷法", planCells(count, plan))],
        message: `不相鄰的偷法一種一種列出來。第 ${listed} 種：${planText(plan)}，可是位置 0 和位置 ${last} 在圓圈上相鄰，不能一起偷，這種不算。`,
      });
      continue;
    }

    const total = planTotal(nums, plan);
    compared++;
    if (total > best) {
      best = total;
      bestPlan = plan;
    }
    frames.push({
      rows: [row("陣列", nums), row("偷法", planCells(count, plan))],
      message: `不相鄰的偷法一種一種列出來。第 ${listed} 種：${planText(plan)}，總和是 ${total}，目前最多是 ${best}。`,
    });
  }

  frames.push({
    rows: [row("陣列", nums, { answer: bestPlan }), row("偷法", planCells(count, bestPlan), { answer: bestPlan })],
    message: `最多能偷 ${best}：${planText(bestPlan)}。列出 ${listed} 種偷法，扣掉 ${rejected} 種頭尾一起偷的，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function robRangeSteps(frames: Frame[], nums: number[], first: number, last: number, results: string[]) {
  let f0 = 0;
  let f1 = nums[first];
  let compared = 0;

  frames.push({
    rows: [
      row("陣列", nums, { pointers: { 目前: first }, rangeStart: first, rangeEnd: last }),
      row("記住的值", [`f0→${f0}`, `f1→${f1}`], { indexed: false }),
      row("兩趟結果", results, { indexed: false }),
    ],
    message: `這一趟只看位置 ${first} 到 ${last}，當成一排房子來偷。先看位置 ${first}：f1 是偷它的 ${f1}，f0 是 0。`,
  });

  for (let house = first + 1; house <= last; house++) {
    const money = nums[house];
    const robbed = f0 + money;
    const newF = Math.max(f1, robbed);
    compared++;
    frames.push({
      rows: [
        row("陣列", nums, { pointers: { 目前: house }, rangeStart: first, rangeEnd: last }),
        row("記住的值", [`f0→${f0}`, `f1→${f1}`, `新值→${newF}`], { indexed: false }),
        row("兩趟結果", results, { indexed: false }),
      ],
      message: `位置 ${house} 有 ${money}。不偷它：維持 f1 的 ${f1}。偷它：用 f0 的 ${f0} + ${money} = ${robbed}。取大的 ${newF}，f0 換成 ${f1}，f1 換成 ${newF}。`,
    });
    f0 = f1;
    f1 = newF;
  }

  return { best: f1, compared };
}

export function robCircleTwoTrips(nums: number[]) {
  const frames: Frame[] = [];
  const last = nums.length - 1;
  const results = ["第一趟→?", "第二趟→?"];

  frames.push({
    rows: [row("陣列", nums), row("記住的值", [], { indexed: false }), row("兩趟結果", results, { indexed: false })],
    message: `房子圍成一圈，位置 0 和位置 ${last} 相鄰，不能都偷。拆成兩趟：第一趟不看最後一間，第二趟不看第一間，再取大的。`,
  });

  const firstTrip = robRangeSteps(frames, nums, 0, last - 1, results);
  results[0] = `第一趟→${firstTrip.best}`;
  const secondTrip = robRangeSteps(frames, nums, 1, last, results);
  results[1] = `第二趟→${secondTrip.best}`;

  const best = Math.max(firstTrip.best, secondTrip.best);
  const compared = firstTrip.compared + secondTrip.compared + 1;
  let winner = 0;
  if (secondTrip.best > firstTrip.best) {
    winner = 1;
  }

  frames.push({
    rows: [
      row("陣列", nums),
      row("記住的值", [], { indexed: false }),
      row("兩趟結果", results, { answer: [winner], indexed: false }),
    ],
    message: `第一趟最多 ${firstTrip.best}，第二趟最多 ${secondTrip.best}，取大的，最多能偷 ${best}。兩趟各走一排，再比一次哪一趟多，一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function isHouse(tree: Cell[], index: number) {
  return index < tree.length && tree[index] !== "";
}

function familyPointers(tree: Cell[], index: number) {
  const pointers: Record<string, number> = { 目前: index };
  const left = index * 2 + 1;
  const right = index * 2 + 2;
  if (isHouse(tree, left)) {
    pointers.左 = left;
  }
  if (isHouse(tree, right)) {
    pointers.右 = right;
  }
  return pointers;
}

function houseCells(tree: Cell[], values: Cell[]) {
  const cells: Cell[] = [];
  for (let index = 0; index < tree.length; index++) {
    if (isHouse(tree, index)) {
      cells.push(values[index]);
    } else {
      cells.push("");
    }
  }
  return cells;
}

function houseName(tree: Cell[], index: number) {
  if (index === 0) {
    return `最上面的 ${tree[index]}`;
  }
  const parent = Math.floor((index - 1) / 2);
  return `${tree[parent]} 底下的 ${tree[index]}`;
}

const treeRule = "每個節點是一間房子，數字是裡面的錢。相連的父子不能都偷，要算出最多能偷多少。";

export function robTreeBrute(tree: Cell[]) {
  const frames: Frame[] = [];
  const times = tree.map(() => 0);
  const path: Cell[] = [];
  let houses = 0;
  let calls = 0;

  for (let index = 0; index < tree.length; index++) {
    if (isHouse(tree, index)) {
      houses++;
    }
  }

  frames.push({
    rows: [
      row("樹", tree, { shape: "tree" }),
      row("算過幾次", houseCells(tree, times), { shape: "tree" }),
      row("呼叫路徑", path, { indexed: false }),
    ],
    message: `${treeRule}第二棵樹記每間房子被算了幾次。`,
  });

  function most(index: number): number {
    if (!isHouse(tree, index)) {
      return 0;
    }

    const left = index * 2 + 1;
    const right = index * 2 + 2;
    const money = Number(tree[index]);
    const name = houseName(tree, index);
    path.push(money);
    times[index]++;
    calls++;

    const leftGrand = most(left * 2 + 1) + most(left * 2 + 2);
    const rightGrand = most(right * 2 + 1) + most(right * 2 + 2);
    const grand = leftGrand + rightGrand;
    const robbed = money + grand;
    const skipped = most(left) + most(right);
    const result = Math.max(robbed, skipped);

    let message = `${name}：偷它就跳過孩子，加上孫子們的 ${grand} 是 ${robbed}；不偷它，孩子們最多 ${skipped}。取大的 ${result}。這是第 ${times[index]} 次算這間。`;
    if (!isHouse(tree, left) && !isHouse(tree, right)) {
      message = `${name} 沒有孩子，最多就是偷它的 ${money}。這是第 ${times[index]} 次算這間。`;
    }
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: familyPointers(tree, index) }),
        row("算過幾次", houseCells(tree, times), { shape: "tree", pointers: { 目前: index } }),
        row("呼叫路徑", path, { indexed: false }),
      ],
      message,
    });
    path.pop();
    return result;
  }

  const best = most(0);
  frames.push({
    rows: [
      row("樹", tree, { shape: "tree" }),
      row("算過幾次", houseCells(tree, times), { shape: "tree" }),
      row("呼叫路徑", path, { indexed: false }),
    ],
    message: `最多能偷 ${best}。不記結果，每間房子都把孩子和孫子重新問一遍，${houses} 間房子一共算了 ${calls} 次。`,
  });
  return frames;
}

export function robTreeOnce(tree: Cell[]) {
  const frames: Frame[] = [];
  const both: Cell[] = tree.map(() => "?");
  let visited = 0;

  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("偷/不偷", houseCells(tree, both), { shape: "tree" })],
    message: treeRule,
  });
  frames.push({
    rows: [row("樹", tree, { shape: "tree" }), row("偷/不偷", houseCells(tree, both), { shape: "tree" })],
    message: "每間房子只算一次，一次算出兩個值，在第二棵樹寫成「偷這間/不偷這間」：它底下整棵子樹最多能偷多少。沒有房子的地方兩個值都當成 0。",
  });

  function visit(index: number): { robbed: number; skipped: number } {
    if (!isHouse(tree, index)) {
      return { robbed: 0, skipped: 0 };
    }

    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;
    const left = visit(leftIndex);
    const right = visit(rightIndex);
    const money = Number(tree[index]);
    const robbed = money + left.skipped + right.skipped;
    const leftBest = Math.max(left.robbed, left.skipped);
    const rightBest = Math.max(right.robbed, right.skipped);
    const skipped = leftBest + rightBest;
    const name = houseName(tree, index);
    both[index] = `${robbed}/${skipped}`;
    visited++;

    let message = `${name}：偷它，孩子都不能偷，${money} + ${left.skipped} + ${right.skipped} = ${robbed}；不偷它，左右孩子各取較大的，${leftBest} + ${rightBest} = ${skipped}。記成 ${robbed}/${skipped}。`;
    if (!isHouse(tree, leftIndex) && !isHouse(tree, rightIndex)) {
      message = `${name} 沒有孩子：偷它是 ${robbed}，不偷是 ${skipped}，記成 ${robbed}/${skipped}。兩個值一起回傳給上面的房子。`;
    }
    frames.push({
      rows: [
        row("樹", tree, { shape: "tree", pointers: familyPointers(tree, index) }),
        row("偷/不偷", houseCells(tree, both), { shape: "tree", pointers: { 目前: index } }),
      ],
      message,
    });
    return { robbed, skipped };
  }

  const root = visit(0);
  const best = Math.max(root.robbed, root.skipped);
  frames.push({
    rows: [
      row("樹", tree, { shape: "tree" }),
      row("偷/不偷", houseCells(tree, both), { shape: "tree", answer: [0] }),
    ],
    message: `最上面的房子：偷它是 ${root.robbed}，不偷是 ${root.skipped}，取大的，最多能偷 ${best}。每間房子只算一次，一共只算了 ${visited} 次。`,
  });
  return frames;
}
