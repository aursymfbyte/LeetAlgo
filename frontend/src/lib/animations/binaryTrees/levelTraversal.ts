import { Cell, Frame, row } from "../types";
import { hasNode } from "./treeNodes";

export function levelOrderFromRoot(tree: Cell[]) {
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

export function levelOrderQueue(tree: Cell[]) {
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

export function rightViewFromRoot(tree: Cell[]) {
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

export function rightViewRightFirst(tree: Cell[]) {
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
