import { Frame, row } from "../types";
import { allPositions, stackRow } from "./rows";

export function minStackScan(ops: string[]) {
  const frames: Frame[] = [];
  const stack: number[] = [];
  const results: number[] = [];
  let looked = 0;

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "放") {
      stack.push(Number(text));
      frames.push({
        rows: [opRow, stackRow("堆疊", stack)],
        message: `把 ${text} 放到堆疊頂端。`,
      });
    } else if (name === "彈出") {
      const top = stack.pop();
      frames.push({
        rows: [opRow, stackRow("堆疊", stack)],
        message: `把頂端的 ${top} 彈出。`,
      });
    } else if (name === "看頂端") {
      const top = stack[stack.length - 1];
      frames.push({
        rows: [opRow, stackRow("堆疊", stack)],
        message: `堆疊頂端是 ${top}，回傳 ${top}。`,
      });
    } else {
      let smallest = stack[0];
      for (let i = 0; i < stack.length; i++) {
        smallest = Math.min(smallest, stack[i]);
        looked++;
        frames.push({
          rows: [opRow, row("堆疊", stack, { indexed: false, pointers: { 目前: i }, rangeEnd: i })],
          message: `取最小值：沒有另外記錄，只能從底到頂把堆疊掃一遍。看到 ${stack[i]}，目前最小是 ${smallest}。`,
        });
      }
      results.push(smallest);
      frames.push({
        rows: [opRow, row("堆疊", stack, { indexed: false, answer: [stack.indexOf(smallest)] })],
        message: `掃完 ${stack.length} 個數，最小值是 ${smallest}，回傳 ${smallest}。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), stackRow("堆疊", stack)],
    message: `${results.length} 次取最小值依序回傳 ${results.join("、")}。每次都把整個堆疊掃一遍，一共看了 ${looked} 個數。`,
  });
  return frames;
}

export function minStackTwoStacks(ops: string[]) {
  const frames: Frame[] = [];
  const values: number[] = [];
  const mins: number[] = [];
  const results: number[] = [];
  let looked = 0;

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "放") {
      const value = Number(text);
      values.push(value);
      if (mins.length === 0) {
        mins.push(value);
      } else {
        mins.push(Math.min(value, mins[mins.length - 1]));
      }
      const min = mins[mins.length - 1];
      frames.push({
        rows: [opRow, stackRow("堆疊", values), stackRow("最小值堆疊", mins)],
        message: `把 ${value} 放進堆疊。最小值堆疊也放一層，記下「從底到這一層為止的最小值」${min}。`,
      });
    } else if (name === "彈出") {
      const top = values.pop();
      const min = mins.pop();
      frames.push({
        rows: [opRow, stackRow("堆疊", values), stackRow("最小值堆疊", mins)],
        message: `兩個堆疊一起彈出頂端：堆疊彈出 ${top}，最小值堆疊彈出 ${min}。`,
      });
    } else if (name === "看頂端") {
      const top = values[values.length - 1];
      frames.push({
        rows: [opRow, stackRow("堆疊", values), stackRow("最小值堆疊", mins)],
        message: `堆疊頂端是 ${top}，回傳 ${top}。`,
      });
    } else {
      const min = mins[mins.length - 1];
      results.push(min);
      looked++;
      frames.push({
        rows: [opRow, stackRow("堆疊", values), { ...stackRow("最小值堆疊", mins), answer: [mins.length - 1] }],
        message: `取最小值：最小值堆疊的頂端就是目前的最小值，直接回傳 ${min}，不用掃。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), stackRow("堆疊", values), stackRow("最小值堆疊", mins)],
    message: `${results.length} 次取最小值依序回傳 ${results.join("、")}。每次只看最小值堆疊的頂端，一共只看了 ${looked} 個數。`,
  });
  return frames;
}

export function queueMoveBack(ops: string[]) {
  const frames: Frame[] = [];
  const stack: number[] = [];
  const spare: number[] = [];
  let moved = 0;

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "放") {
      stack.push(Number(text));
      frames.push({
        rows: [opRow, stackRow("堆疊", stack), stackRow("暫放堆疊", spare)],
        message: `把 ${text} 放到堆疊頂端。越早進來的數被壓在越下面。`,
      });
      continue;
    }

    const count = stack.length;
    while (stack.length > 0) {
      spare.push(stack.pop() as number);
      moved++;
    }
    frames.push({
      rows: [opRow, stackRow("堆疊", stack), stackRow("暫放堆疊", spare)],
      message: `隊首是最早進來的數，壓在堆疊最底下。把 ${count} 個數一個一個全部倒到暫放堆疊，順序反過來，隊首就到頂端了。`,
    });

    const front = spare[spare.length - 1];
    if (name === "取出") {
      spare.pop();
      frames.push({
        rows: [opRow, stackRow("堆疊", stack), stackRow("暫放堆疊", spare)],
        message: `把暫放堆疊頂端的 ${front} 取出，它就是隊首，回傳 ${front}。`,
      });
    } else {
      frames.push({
        rows: [opRow, stackRow("堆疊", stack), stackRow("暫放堆疊", spare)],
        message: `暫放堆疊頂端的 ${front} 就是隊首，只看不取出，回傳 ${front}。`,
      });
    }

    const rest = spare.length;
    while (spare.length > 0) {
      stack.push(spare.pop() as number);
      moved++;
    }
    frames.push({
      rows: [opRow, stackRow("堆疊", stack), stackRow("暫放堆疊", spare)],
      message: `再把暫放堆疊剩下的 ${rest} 個數一個一個倒回原本的堆疊，恢復原來的順序。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), stackRow("堆疊", stack), stackRow("暫放堆疊", spare)],
    message: `操作都做完了。每次要拿隊首，都把全部的數倒過去再倒回來，一共搬了 ${moved} 次。`,
  });
  return frames;
}

export function queueTwoStacks(ops: string[]) {
  const frames: Frame[] = [];
  const inStack: number[] = [];
  const outStack: number[] = [];
  let moved = 0;

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "放") {
      inStack.push(Number(text));
      frames.push({
        rows: [opRow, stackRow("放入堆疊", inStack), stackRow("取出堆疊", outStack)],
        message: `把 ${text} 放到「放入堆疊」的頂端。新的數一律只放這裡，不用搬任何數。`,
      });
      continue;
    }

    if (outStack.length === 0) {
      const count = inStack.length;
      while (inStack.length > 0) {
        outStack.push(inStack.pop() as number);
        moved++;
      }
      frames.push({
        rows: [opRow, stackRow("放入堆疊", inStack), stackRow("取出堆疊", outStack)],
        message: `要拿隊首，但「取出堆疊」是空的：把「放入堆疊」的 ${count} 個數全部倒過來，順序反轉，最早進來的就在頂端。`,
      });
    }

    const front = outStack[outStack.length - 1];
    if (name === "取出") {
      outStack.pop();
      frames.push({
        rows: [opRow, stackRow("放入堆疊", inStack), stackRow("取出堆疊", outStack)],
        message: `「取出堆疊」頂端的 ${front} 就是隊首，把它取出，回傳 ${front}。剩下的留在原地，不用倒回去。`,
      });
    } else {
      frames.push({
        rows: [opRow, stackRow("放入堆疊", inStack), stackRow("取出堆疊", outStack)],
        message: `「取出堆疊」頂端的 ${front} 就是隊首，只看不取出，回傳 ${front}。剩下的留在原地，不用倒回去。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), stackRow("放入堆疊", inStack), stackRow("取出堆疊", outStack)],
    message: `操作都做完了。「取出堆疊」空了才搬，每個數最多只搬一次，一共只搬了 ${moved} 次。`,
  });
  return frames;
}

export function asteroidsRescan(asteroids: number[]) {
  const frames: Frame[] = [];
  const cells = [...asteroids];
  let checked = 0;
  let left = 0;

  while (left + 1 < cells.length) {
    const right = left + 1;
    const first = cells[left];
    const second = cells[right];
    const pair = row("陣列", cells, { pointers: { 甲: left, 乙: right } });
    checked++;

    const collide = first > 0 && second < 0;
    if (!collide) {
      frames.push({
        rows: [pair],
        message: `從頭找一對會相撞的：${first} 和 ${second} 不是「左邊往右飛、右邊往左飛」，不會相撞，看下一對。`,
      });
      left++;
      continue;
    }

    let result = "";
    if (first < -second) {
      result = `${first} 比較小，爆炸消失`;
      cells.splice(left, 1);
    } else if (first === -second) {
      result = "兩顆一樣大，都爆炸消失";
      cells.splice(left, 2);
    } else {
      result = `${second} 比較小，爆炸消失`;
      cells.splice(right, 1);
    }
    frames.push({
      rows: [pair],
      message: `${first} 往右飛、${second} 往左飛，會相撞：${result}。處理完再回到開頭重新找。`,
    });
    left = 0;
  }

  frames.push({
    rows: [row("陣列", cells, { answer: allPositions(cells) })],
    message: `從頭到尾都沒有會相撞的了，留下 ${cells.join("、")}。每撞一次就從頭再找，一共檢查了 ${checked} 次。`,
  });
  return frames;
}

export function asteroidsStack(asteroids: number[]) {
  const frames: Frame[] = [];
  const stack: number[] = [];
  let checked = 0;

  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    const cells = row("陣列", asteroids, { pointers: { 目前: i } });
    let alive = true;

    while (alive && asteroid < 0 && stack.length > 0 && stack[stack.length - 1] > 0) {
      const top = stack[stack.length - 1];
      checked++;

      if (top < -asteroid) {
        stack.pop();
        frames.push({
          rows: [cells, stackRow("堆疊", stack)],
          message: `${asteroid} 往左飛，撞上堆疊頂端往右飛的 ${top}：${top} 比較小，爆炸彈出。${asteroid} 還活著，繼續和新的頂端比。`,
        });
      } else if (top === -asteroid) {
        stack.pop();
        alive = false;
        frames.push({
          rows: [cells, stackRow("堆疊", stack)],
          message: `${asteroid} 往左飛，撞上堆疊頂端往右飛的 ${top}：兩顆一樣大，都爆炸。${top} 彈出，${asteroid} 也不放進堆疊。`,
        });
      } else {
        alive = false;
        frames.push({
          rows: [cells, stackRow("堆疊", stack)],
          message: `${asteroid} 往左飛，撞上堆疊頂端往右飛的 ${top}：${asteroid} 比較小，爆炸消失，不放進堆疊。`,
        });
      }
    }

    if (alive) {
      stack.push(asteroid);
      checked++;
      frames.push({
        rows: [cells, stackRow("堆疊", stack)],
        message: `只有「頂端往右飛、新的往左飛」才會相撞。${asteroid} 沒有對象可以撞，還活著，放進堆疊。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", asteroids), row("堆疊", stack, { indexed: false, answer: allPositions(stack) })],
    message: `全部處理完了，堆疊裡留下的 ${stack.join("、")} 就是答案。每顆小行星只和堆疊頂端比，一共只檢查了 ${checked} 次。`,
  });
  return frames;
}
