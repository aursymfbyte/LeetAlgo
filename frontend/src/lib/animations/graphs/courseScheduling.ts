import { Frame, row } from "../types";
import { listCells, positions } from "./rows";

function rescanCourses(total: number, conditions: number[][]) {
  const frames: Frame[] = [];
  const conditionCells = conditions.map(([course, before]) => `${before}→${course}`);
  const state: string[] = new Array(total).fill("未修");
  const order: number[] = [];
  let looked = 0;
  let round = 0;
  let changed = true;

  const [firstCourse, firstBefore] = conditions[0];
  frames.push({
    rows: [
      row("先修條件", conditionCells, { indexed: false }),
      row("狀態", state),
      row("修完順序", order, { indexed: false }),
    ],
    message: `「${conditionCells[0]}」代表先修完課程 ${firstBefore} 才能修課程 ${firstCourse}。不另外建表，每一輪把還沒修的課一門一門拿出來，把所有先修條件掃一遍，看它能不能修。`,
  });

  while (changed) {
    changed = false;
    round++;

    for (let course = 0; course < total; course++) {
      if (state[course] === "修完") {
        continue;
      }

      const mine: number[] = [];
      const waiting: number[] = [];
      for (let index = 0; index < conditions.length; index++) {
        const [target, before] = conditions[index];
        looked++;
        if (target !== course) {
          continue;
        }
        mine.push(index);
        if (state[before] === "未修") {
          waiting.push(before);
        }
      }

      let result = `要先修的課程 ${waiting.join("、")} 還沒修完，這一輪不能修。`;
      if (waiting.length === 0) {
        state[course] = "修完";
        order.push(course);
        changed = true;
        result = "它沒有還沒修完的先修課，可以修，標成修完。";
      }
      frames.push({
        rows: [
          row("先修條件", conditionCells, { answer: mine, indexed: false }),
          row("狀態", state, { pointers: { 目前: course } }),
          row("修完順序", order, { indexed: false }),
        ],
        message: `第 ${round} 輪，課程 ${course}：把 ${conditions.length} 條先修條件掃一遍，${result}`,
      });
    }
  }

  let answer: number[] = [];
  if (order.length === total) {
    answer = positions(0, total - 1);
  }
  const rows = [
    row("先修條件", conditionCells, { indexed: false }),
    row("狀態", state),
    row("修完順序", order, { answer, indexed: false }),
  ];
  return { frames, rows, order, looked };
}

function kahnCourses(total: number, conditions: number[][]) {
  const frames: Frame[] = [];
  const nextCourses: number[][] = [];
  const inDegree: number[] = [];
  for (let course = 0; course < total; course++) {
    nextCourses.push([]);
    inDegree.push(0);
  }
  let looked = 0;
  for (const [course, before] of conditions) {
    nextCourses[before].push(course);
    inDegree[course]++;
    looked++;
  }
  const nextCells = listCells(nextCourses);
  const queue: number[] = [];
  const order: number[] = [];

  frames.push({
    rows: [
      row("後續課程", nextCells),
      row("入度", inDegree),
      row("佇列", queue, { indexed: false }),
      row("修完順序", order, { indexed: false }),
    ],
    message: `先建兩張表：「後續課程」是修完這門課才能修的課，「入度」是這門課還有幾門先修課沒修完。每條先修條件看一次，共 ${looked} 次。`,
  });

  for (let course = 0; course < total; course++) {
    if (inDegree[course] === 0) {
      queue.push(course);
    }
  }
  frames.push({
    rows: [
      row("後續課程", nextCells),
      row("入度", inDegree),
      row("佇列", queue, { indexed: false }),
      row("修完順序", order, { indexed: false }),
    ],
    message: `入度是 0 的課沒有先修課要等，先放進佇列：課程 ${queue.join("、")}。之後每修完一門課，就把它的後續課程入度減一。`,
  });

  while (queue.length > 0) {
    const course = queue[0];
    queue.shift();
    order.push(course);

    const notes: string[] = [];
    for (const next of nextCourses[course]) {
      inDegree[next]--;
      looked++;
      if (inDegree[next] === 0) {
        queue.push(next);
        notes.push(`課程 ${next} 的入度減成 0，放進佇列`);
      } else {
        notes.push(`課程 ${next} 的入度減成 ${inDegree[next]}，還要等`);
      }
    }

    let detail = "它沒有後續課程。";
    if (notes.length > 0) {
      detail = `後續的${notes.join("；")}。`;
    }
    frames.push({
      rows: [
        row("後續課程", nextCells, { pointers: { 目前: course } }),
        row("入度", inDegree, { answer: nextCourses[course] }),
        row("佇列", queue, { indexed: false }),
        row("修完順序", order, { indexed: false }),
      ],
      message: `從佇列拿出課程 ${course}，修完。${detail}`,
    });
  }

  let answer: number[] = [];
  if (order.length === total) {
    answer = positions(0, total - 1);
  }
  const rows = [
    row("後續課程", nextCells),
    row("入度", inDegree),
    row("佇列", queue, { indexed: false }),
    row("修完順序", order, { answer, indexed: false }),
  ];
  return { frames, rows, order, looked };
}

export function canFinishBrute(total: number, conditions: number[][]) {
  const run = rescanCourses(total, conditions);
  const left = total - run.order.length;

  let verdict = `${total} 門課都修完了，答案是 true`;
  if (left > 0) {
    verdict = `再掃一輪也沒有課能修了，還有 ${left} 門課修不了，答案是 false`;
  }
  run.frames.push({
    rows: run.rows,
    message: `${verdict}。每一輪都把先修條件重掃，一共看了 ${run.looked} 次先修條件。`,
  });
  return run.frames;
}

export function canFinishKahn(total: number, conditions: number[][]) {
  const run = kahnCourses(total, conditions);
  const left = total - run.order.length;

  let verdict = `${total} 門課都修完了，答案是 true`;
  if (left > 0) {
    verdict = `只修完 ${run.order.length} 門，剩下 ${left} 門的入度一直不是 0，代表它們互相等對方，答案是 false`;
  }
  run.frames.push({
    rows: run.rows,
    message: `佇列空了，${verdict}。建表和減入度時各看一次，一共只看了 ${run.looked} 次先修條件。`,
  });
  return run.frames;
}

export function findOrderBrute(total: number, conditions: number[][]) {
  const run = rescanCourses(total, conditions);

  let verdict = `${total} 門課都修完了，修課順序是 ${run.order.join("、")}`;
  if (run.order.length < total) {
    verdict = "再掃一輪也沒有課能修了，有課修不了，回傳空陣列";
  }
  run.frames.push({
    rows: run.rows,
    message: `${verdict}。每一輪都把先修條件重掃，一共看了 ${run.looked} 次先修條件。`,
  });
  return run.frames;
}

export function findOrderKahn(total: number, conditions: number[][]) {
  const run = kahnCourses(total, conditions);

  let verdict = `${total} 門課都修完了，修課順序是 ${run.order.join("、")}`;
  if (run.order.length < total) {
    verdict = "還有課的入度一直不是 0，修不完，回傳空陣列";
  }
  run.frames.push({
    rows: run.rows,
    message: `佇列空了，${verdict}。建表和減入度時各看一次，一共只看了 ${run.looked} 次先修條件。`,
  });
  return run.frames;
}
