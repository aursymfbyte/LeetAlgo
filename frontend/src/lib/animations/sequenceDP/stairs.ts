import { Cell, Frame, row } from "../types";

export function climbRecursion(top: number) {
  const frames: Frame[] = [];
  const times: number[] = [];
  for (let stair = 0; stair <= top; stair++) {
    times.push(0);
  }
  const path: string[] = [];
  let calls = 0;

  frames.push({
    rows: [row("呼叫路徑", path, { indexed: false }), row("算過幾次", times)],
    message: "到某一階的最後一步，不是從下一階跨 1 階，就是從下兩階跨 2 階。照這個寫遞迴，不記結果，每次用到都重新算。",
  });

  function ways(stair: number): number {
    path.push(`${stair}階`);
    times[stair]++;
    calls++;
    let count = 1;
    let message = `到第 ${stair} 階只有 1 種走法，不用再往下問。這是第 ${times[stair]} 次算第 ${stair} 階。`;

    if (stair >= 2) {
      const oneBelow = ways(stair - 1);
      const twoBelow = ways(stair - 2);
      count = oneBelow + twoBelow;
      message = `到第 ${stair} 階的方法數 = 第 ${stair - 1} 階的 ${oneBelow} 種 + 第 ${stair - 2} 階的 ${twoBelow} 種 = ${count} 種。這是第 ${times[stair]} 次算第 ${stair} 階。`;
    }

    frames.push({
      rows: [
        row("呼叫路徑", path, { pointers: { 目前: path.length - 1 }, indexed: false }),
        row("算過幾次", times, { pointers: { 目前: stair } }),
      ],
      message,
    });
    path.pop();
    return count;
  }

  const total = ways(top);
  frames.push({
    rows: [row("呼叫路徑", path, { indexed: false }), row("算過幾次", times)],
    message: `到第 ${top} 階一共有 ${total} 種走法。不記結果，同一階被重複算了很多次，光是第 1 階就算了 ${times[1]} 次，一共算了 ${calls} 次。`,
  });
  return frames;
}

export function climbTwoValues(top: number) {
  const frames: Frame[] = [];
  const stairs: string[] = [];
  for (let stair = 0; stair <= top; stair++) {
    stairs.push(`${stair}階`);
  }
  let f0 = 1;
  let f1 = 1;
  let computed = 0;

  frames.push({
    rows: [
      row("樓梯", stairs, { pointers: { 前二: 0, 前一: 1 }, rangeEnd: 1, indexed: false }),
      row("記住的值", [`f0→${f0}`, `f1→${f1}`], { indexed: false }),
    ],
    message: "只要記住前兩階的方法數就夠了。f0 記第 0 階的 1 種，f1 記第 1 階的 1 種，然後一階一階往上算。",
  });

  for (let stair = 2; stair <= top; stair++) {
    const newF = f1 + f0;
    computed++;
    frames.push({
      rows: [
        row("樓梯", stairs, {
          pointers: { 前二: stair - 2, 前一: stair - 1, 目前: stair },
          rangeStart: stair - 2,
          rangeEnd: stair,
          indexed: false,
        }),
        row("記住的值", [`f0→${f0}`, `f1→${f1}`, `新值→${newF}`], { indexed: false }),
      ],
      message: `到第 ${stair} 階的方法數 = 第 ${stair - 1} 階的 ${f1} 種 + 第 ${stair - 2} 階的 ${f0} 種 = ${newF} 種。接著 f0 換成 ${f1}，f1 換成 ${newF}。`,
    });
    f0 = f1;
    f1 = newF;
  }

  frames.push({
    rows: [
      row("樓梯", stairs, { rangeStart: top, answer: [top], indexed: false }),
      row("記住的值", [`f0→${f0}`, `f1→${f1}`], { answer: [1], indexed: false }),
    ],
    message: `算到第 ${top} 階了，f1 就是答案：一共有 ${f1} 種走法。每一階只算一次，一共只算了 ${computed} 次。`,
  });
  return frames;
}

export function minCostRecursion(cost: number[]) {
  const frames: Frame[] = [];
  const top = cost.length;
  const stairs: Cell[] = [...cost, "頂端"];
  const times = stairs.map(() => 0);
  const path: string[] = [];
  let calls = 0;

  frames.push({
    rows: [row("花費", stairs), row("呼叫路徑", path, { indexed: false }), row("算過幾次", times)],
    message: "站上某一階之前，一定是從下一階或下兩階付完費用走上來的，取便宜的。照這個寫遞迴，不記結果，每次用到都重新算。",
  });

  function cheapest(stair: number): number {
    path.push(`${stair}階`);
    times[stair]++;
    calls++;
    let spent = 0;
    let message = `可以直接從第 ${stair} 階出發，站上它不用花錢，是 0。這是第 ${times[stair]} 次算第 ${stair} 階。`;

    if (stair >= 2) {
      const oneBelow = cheapest(stair - 1);
      const twoBelow = cheapest(stair - 2);
      const fromOne = oneBelow + cost[stair - 1];
      const fromTwo = twoBelow + cost[stair - 2];
      spent = Math.min(fromOne, fromTwo);
      message = `站上第 ${stair} 階：從第 ${stair - 1} 階上來是 ${oneBelow} + ${cost[stair - 1]} = ${fromOne}，從第 ${stair - 2} 階上來是 ${twoBelow} + ${cost[stair - 2]} = ${fromTwo}，取小的 ${spent}。這是第 ${times[stair]} 次算第 ${stair} 階。`;
    }

    frames.push({
      rows: [
        row("花費", stairs, { pointers: { 目前: stair } }),
        row("呼叫路徑", path, { pointers: { 目前: path.length - 1 }, indexed: false }),
        row("算過幾次", times, { pointers: { 目前: stair } }),
      ],
      message,
    });
    path.pop();
    return spent;
  }

  const total = cheapest(top);
  frames.push({
    rows: [row("花費", stairs, { answer: [top] }), row("呼叫路徑", path, { indexed: false }), row("算過幾次", times)],
    message: `站上頂端（第 ${top} 階）最少要花 ${total}。不記結果，同一階被重複算了很多次，光是第 1 階就算了 ${times[1]} 次，一共算了 ${calls} 次。`,
  });
  return frames;
}

export function minCostTwoValues(cost: number[]) {
  const frames: Frame[] = [];
  const top = cost.length;
  const stairs: Cell[] = [...cost, "頂端"];
  let f0 = 0;
  let f1 = 0;
  let computed = 0;

  frames.push({
    rows: [
      row("花費", stairs, { pointers: { 前二: 0, 前一: 1 }, rangeEnd: 1 }),
      row("記住的值", [`f0→${f0}`, `f1→${f1}`], { indexed: false }),
    ],
    message: "只要記住站上前兩階的最小花費。可以從第 0 階或第 1 階出發，站上這兩階都不用花錢，所以 f0、f1 都是 0。",
  });

  for (let stair = 2; stair <= top; stair++) {
    const fromOne = f1 + cost[stair - 1];
    const fromTwo = f0 + cost[stair - 2];
    const newF = Math.min(fromOne, fromTwo);
    computed++;
    frames.push({
      rows: [
        row("花費", stairs, {
          pointers: { 前二: stair - 2, 前一: stair - 1, 目前: stair },
          rangeStart: stair - 2,
          rangeEnd: stair,
        }),
        row("記住的值", [`f0→${f0}`, `f1→${f1}`, `新值→${newF}`], { indexed: false }),
      ],
      message: `站上第 ${stair} 階：從第 ${stair - 1} 階上來是 ${f1} + ${cost[stair - 1]} = ${fromOne}，從第 ${stair - 2} 階上來是 ${f0} + ${cost[stair - 2]} = ${fromTwo}，取小的 ${newF}。f0 換成 ${f1}，f1 換成 ${newF}。`,
    });
    f0 = f1;
    f1 = newF;
  }

  frames.push({
    rows: [
      row("花費", stairs, { rangeStart: top, answer: [top] }),
      row("記住的值", [`f0→${f0}`, `f1→${f1}`], { answer: [1], indexed: false }),
    ],
    message: `算到頂端（第 ${top} 階）了，f1 就是答案：最少要花 ${f1}。每一階只算一次，一共只算了 ${computed} 次。`,
  });
  return frames;
}
