import { Cell, Frame, ProblemAnimation, row } from "./types";

function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
}

function allPositions(cells: Cell[]) {
  return cells.map((cell, index) => index);
}

function stackRow(label: string, cells: Cell[]) {
  if (cells.length === 0) {
    return row(label, cells, { indexed: false });
  }
  return row(label, cells, { indexed: false, pointers: { 頂: cells.length - 1 } });
}

function indexCells(indexes: number[], values: number[]) {
  return indexes.map((index) => `${index}:${values[index]}`);
}

function tableCells(table: Map<number, number>) {
  const cells: string[] = [];
  for (const [key, value] of table) {
    cells.push(`${key}→${value}`);
  }
  return cells;
}

function isDigit(letter: string) {
  return /[0-9]/.test(letter);
}

function bracketsDeletePairs(text: string) {
  const frames: Frame[] = [];
  const closingOf: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
  const letters = [...text];
  let checked = 0;
  let left = 0;

  while (left + 1 < letters.length) {
    const right = left + 1;
    const pair = letters[left] + letters[right];
    checked++;

    if (closingOf[letters[left]] === letters[right]) {
      frames.push({
        rows: [row("字串", letters, { pointers: { 甲: left, 乙: right }, rangeStart: left, rangeEnd: right })],
        message: `位置 ${left} 和 ${right} 的 ${pair} 是相鄰的一對，把它們刪掉，後面的字元往前補。然後回到開頭重新找。`,
      });
      letters.splice(left, 2);
      left = 0;
    } else {
      frames.push({
        rows: [row("字串", letters, { pointers: { 甲: left, 乙: right } })],
        message: `從頭找相鄰的成對括號：位置 ${left} 和 ${right} 的 ${pair} 不是一對，看下一組。`,
      });
      left++;
    }
  }

  let verdict = "字串被刪光了，每個括號都配成對，答案是 true";
  if (letters.length > 0) {
    verdict = `再也找不到相鄰的一對，還剩下 ${letters.join("")}，答案是 false`;
  }
  frames.push({
    rows: [row("字串", letters)],
    message: `${verdict}。每刪一對就從頭再找，一共檢查了 ${checked} 次。`,
  });
  return frames;
}

function bracketsStack(text: string) {
  const frames: Frame[] = [];
  const openingOf: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const letters = [...text];
  const stack: string[] = [];
  let checked = 0;

  for (let i = 0; i < letters.length; i++) {
    const ch = letters[i];
    const opening = openingOf[ch];
    const textRow = row("字串", letters, { pointers: { 目前: i } });
    checked++;

    if (opening === undefined) {
      stack.push(ch);
      frames.push({
        rows: [textRow, stackRow("堆疊", stack)],
        message: `${ch} 是左括號，放進堆疊，等它的右括號出現。`,
      });
      continue;
    }

    if (stack.length === 0 || stack[stack.length - 1] !== opening) {
      frames.push({
        rows: [textRow, stackRow("堆疊", stack)],
        message: `${ch} 是右括號，但堆疊頂端沒有同種類的 ${opening} 可以配，答案是 false。一共只檢查了 ${checked} 次。`,
      });
      return frames;
    }

    stack.pop();
    frames.push({
      rows: [textRow, stackRow("堆疊", stack)],
      message: `${ch} 是右括號，堆疊頂端剛好是同種類的 ${opening}，配對成功，把 ${opening} 彈出。`,
    });
  }

  let verdict = "堆疊是空的，每個左括號都被關上了，答案是 true";
  if (stack.length > 0) {
    verdict = "堆疊裡還有沒被關上的左括號，答案是 false";
  }
  frames.push({
    rows: [row("字串", letters), stackRow("堆疊", stack)],
    message: `字串看完了，${verdict}。每個字元只看一次，一共只檢查了 ${checked} 次。`,
  });
  return frames;
}

function rectangleBrute(heights: number[]) {
  const frames: Frame[] = [];
  let best = 0;
  let bestLeft = 0;
  let bestRight = 0;
  let bestHeight = 0;
  let compared = 0;

  for (let i = 0; i < heights.length; i++) {
    const height = heights[i];
    let left = i;
    let right = i;

    while (left > 0) {
      const next = left - 1;
      compared++;
      if (heights[next] < height) {
        frames.push({
          rows: [row("陣列", heights, { pointers: { 目前: i, 左: next }, rangeStart: left, rangeEnd: right })],
          message: `位置 ${i} 高 ${height}，往左延伸：位置 ${next} 的 ${heights[next]} 比它矮，左邊到這裡為止。`,
        });
        break;
      }
      left = next;
      frames.push({
        rows: [row("陣列", heights, { pointers: { 目前: i, 左: next }, rangeStart: left, rangeEnd: right })],
        message: `位置 ${i} 高 ${height}，當最矮的那根往左延伸：位置 ${next} 的 ${heights[next]} 不比它矮，矩形可以延伸過去。`,
      });
    }

    while (right < heights.length - 1) {
      const next = right + 1;
      compared++;
      if (heights[next] < height) {
        frames.push({
          rows: [row("陣列", heights, { pointers: { 目前: i, 右: next }, rangeStart: left, rangeEnd: right })],
          message: `位置 ${i} 高 ${height}，往右延伸：位置 ${next} 的 ${heights[next]} 比它矮，右邊到這裡為止。`,
        });
        break;
      }
      right = next;
      frames.push({
        rows: [row("陣列", heights, { pointers: { 目前: i, 右: next }, rangeStart: left, rangeEnd: right })],
        message: `位置 ${i} 高 ${height}，當最矮的那根往右延伸：位置 ${next} 的 ${heights[next]} 不比它矮，矩形可以延伸過去。`,
      });
    }

    const width = right - left + 1;
    const area = height * width;
    if (area > best) {
      best = area;
      bestLeft = left;
      bestRight = right;
      bestHeight = height;
    }
    frames.push({
      rows: [row("陣列", heights, { pointers: { 目前: i }, rangeStart: left, rangeEnd: right })],
      message: `位置 ${i} 高 ${height}：矩形從位置 ${left} 到 ${right}，寬 ${width}，面積 ${height} × ${width} = ${area}，目前最大是 ${best}。`,
    });
  }

  frames.push({
    rows: [row("陣列", heights, { rangeStart: bestLeft, rangeEnd: bestRight, answer: positions(bestLeft, bestRight) })],
    message: `最大的矩形是位置 ${bestLeft} 到 ${bestRight}、高 ${bestHeight}，面積 ${best}。每根柱子都往左右一格一格比，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function boundCells(left: number[], right: number[]) {
  return left.map((value, index) => `${value},${right[index]}`);
}

function rectangleStack(heights: number[]) {
  const frames: Frame[] = [];
  const n = heights.length;
  const left = heights.map(() => -1);
  const right = heights.map(() => n);
  let stack: number[] = [];
  let compared = 0;

  frames.push({
    rows: [row("陣列", heights), stackRow("堆疊", []), row("左右邊界", boundCells(left, right))],
    message: `每根柱子當矩形的高，要找左右兩邊第一根比它矮的位置。「左右邊界」每格記這兩個位置，先填 -1 和 ${n}，代表兩邊都沒有更矮的。`,
  });

  for (let i = 0; i < n; i++) {
    let popped = 0;
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      compared++;
      if (heights[top] < heights[i]) {
        break;
      }
      stack.pop();
      popped++;
    }

    let action = "";
    if (popped > 0) {
      action = `彈出 ${popped} 根不比它矮的。`;
    }
    let found = "堆疊是空的，左邊沒有更矮的，維持 -1。";
    if (stack.length > 0) {
      left[i] = stack[stack.length - 1];
      found = `堆疊頂端的位置 ${left[i]} 比它矮，就是左邊第一根更矮的，記下來。`;
    }
    stack.push(i);
    frames.push({
      rows: [
        row("陣列", heights, { pointers: { 目前: i } }),
        stackRow("堆疊", indexCells(stack, heights)),
        row("左右邊界", boundCells(left, right), { pointers: { 目前: i } }),
      ],
      message: `由左往右，位置 ${i} 高 ${heights[i]}：${action}${found}再把它放進堆疊。`,
    });
  }

  stack = [];
  frames.push({
    rows: [row("陣列", heights), stackRow("堆疊", stack), row("左右邊界", boundCells(left, right))],
    message: "左邊的位置都找好了。把堆疊清空，改成由右往左再掃一趟，用同樣的方法找每根柱子右邊第一根更矮的位置。",
  });

  for (let i = n - 1; i >= 0; i--) {
    let popped = 0;
    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      compared++;
      if (heights[top] < heights[i]) {
        break;
      }
      stack.pop();
      popped++;
    }

    let action = "";
    if (popped > 0) {
      action = `彈出 ${popped} 根不比它矮的。`;
    }
    let found = `堆疊是空的，右邊沒有更矮的，維持 ${n}。`;
    if (stack.length > 0) {
      right[i] = stack[stack.length - 1];
      found = `堆疊頂端的位置 ${right[i]} 比它矮，就是右邊第一根更矮的，記下來。`;
    }
    stack.push(i);
    frames.push({
      rows: [
        row("陣列", heights, { pointers: { 目前: i } }),
        stackRow("堆疊", indexCells(stack, heights)),
        row("左右邊界", boundCells(left, right), { pointers: { 目前: i } }),
      ],
      message: `由右往左，位置 ${i} 高 ${heights[i]}：${action}${found}再把它放進堆疊。`,
    });
  }

  let best = 0;
  let bestIndex = 0;
  for (let i = 0; i < n; i++) {
    const width = right[i] - left[i] - 1;
    const area = heights[i] * width;
    if (area > best) {
      best = area;
      bestIndex = i;
    }
    frames.push({
      rows: [
        row("陣列", heights, { pointers: { 目前: i }, rangeStart: left[i] + 1, rangeEnd: right[i] - 1 }),
        stackRow("堆疊", indexCells(stack, heights)),
        row("左右邊界", boundCells(left, right), { pointers: { 目前: i } }),
      ],
      message: `位置 ${i}：右邊界 ${right[i]} 減左邊界 ${left[i]} 再減 1，寬度是 ${width}，面積 ${heights[i]} × ${width} = ${area}，目前最大是 ${best}。`,
    });
  }

  const bestLeft = left[bestIndex] + 1;
  const bestRight = right[bestIndex] - 1;
  frames.push({
    rows: [
      row("陣列", heights, { rangeStart: bestLeft, rangeEnd: bestRight, answer: positions(bestLeft, bestRight) }),
      stackRow("堆疊", indexCells(stack, heights)),
      row("左右邊界", boundCells(left, right)),
    ],
    message: `最大的矩形是位置 ${bestLeft} 到 ${bestRight}、高 ${heights[bestIndex]}，面積 ${best}。左右各掃一趟，每根柱子最多進出堆疊一次，一共只比較了 ${compared} 次。`,
  });
  return frames;
}

const operators = ["+", "-", "*", "/"];

function calculate(left: number, right: number, operator: string) {
  if (operator === "+") {
    return left + right;
  }
  if (operator === "-") {
    return left - right;
  }
  if (operator === "*") {
    return left * right;
  }
  return Math.trunc(left / right);
}

function rpnRescan(tokens: string[]) {
  const frames: Frame[] = [];
  const cells = [...tokens];
  let looked = 0;
  let i = 0;

  while (cells.length > 1) {
    const token = cells[i];
    looked++;

    if (!operators.includes(token)) {
      frames.push({
        rows: [row("陣列", cells, { pointers: { 目前: i } })],
        message: `從頭找第一個運算符：位置 ${i} 的 ${token} 是數字，看下一格。`,
      });
      i++;
      continue;
    }

    const left = Number(cells[i - 2]);
    const right = Number(cells[i - 1]);
    const result = calculate(left, right, token);
    frames.push({
      rows: [row("陣列", cells, { pointers: { 目前: i }, rangeStart: i - 2, rangeEnd: i })],
      message: `位置 ${i} 是運算符 ${token}，拿它前面兩個數算 ${left} ${token} ${right} = ${result}，用結果換掉這三格，再回到開頭重新找。`,
    });
    cells.splice(i - 2, 3, String(result));
    i = 0;
  }

  frames.push({
    rows: [row("陣列", cells, { answer: [0] })],
    message: `只剩一個數，答案是 ${cells[0]}。每算一次就從頭再找，一共看了 ${looked} 格。`,
  });
  return frames;
}

function rpnStack(tokens: string[]) {
  const frames: Frame[] = [];
  const stack: number[] = [];
  let looked = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const tokenRow = row("陣列", tokens, { pointers: { 目前: i } });
    looked++;

    if (operators.includes(token)) {
      const right = stack.pop() as number;
      const left = stack.pop() as number;
      const result = calculate(left, right, token);
      stack.push(result);
      frames.push({
        rows: [tokenRow, stackRow("堆疊", stack)],
        message: `${token} 是運算符：先彈出的 ${right} 是右邊的數，後彈出的 ${left} 是左邊的數，算 ${left} ${token} ${right} = ${result}，把結果放回堆疊。`,
      });
    } else {
      stack.push(Number(token));
      frames.push({
        rows: [tokenRow, stackRow("堆疊", stack)],
        message: `${token} 是數字，放進堆疊。`,
      });
    }
  }

  const top = stack.length - 1;
  frames.push({
    rows: [row("陣列", tokens), row("堆疊", stack, { indexed: false, answer: [top] })],
    message: `陣列看完了，堆疊頂端的 ${stack[top]} 就是答案。不用回頭重找，每一格只看一次，一共只看了 ${looked} 格。`,
  });
  return frames;
}

function minStackScan(ops: string[]) {
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

function minStackTwoStacks(ops: string[]) {
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

function queueMoveBack(ops: string[]) {
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

function queueTwoStacks(ops: string[]) {
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

function windowMaxScan(nums: number[], k: number) {
  const frames: Frame[] = [];
  const windows = nums.length - k + 1;
  const answer = new Array<Cell>(windows).fill("");
  let looked = 0;

  for (let start = 0; start < windows; start++) {
    const end = start + k - 1;
    let largest = nums[start];

    for (let i = start; i <= end; i++) {
      largest = Math.max(largest, nums[i]);
      answer[start] = largest;
      looked++;
      frames.push({
        rows: [
          row("陣列", nums, { pointers: { 目前: i }, rangeStart: start, rangeEnd: end }),
          row("答案", answer, { indexed: false, pointers: { 目前: start } }),
        ],
        message: `視窗在位置 ${start} 到 ${end}，從頭掃一遍找最大值：看到 ${nums[i]}，這個視窗目前最大是 ${largest}。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", nums), row("答案", answer, { indexed: false, answer: allPositions(answer) })],
    message: `每個視窗的最大值是 ${answer.join("、")}。每個視窗都重新掃 ${k} 個數，一共看了 ${looked} 個數。`,
  });
  return frames;
}

function windowMaxQueue(nums: number[], k: number) {
  const frames: Frame[] = [];
  const windows = nums.length - k + 1;
  const answer = new Array<Cell>(windows).fill("");
  const queue: number[] = [];
  let moves = 0;

  frames.push({
    rows: [row("陣列", nums), row("佇列", [], { indexed: false }), row("答案", answer, { indexed: false })],
    message: "佇列裡放的是位置，畫成「位置:值」。對應的值由隊首到隊尾遞減，所以隊首永遠是目前視窗的最大值。",
  });

  for (let i = 0; i < nums.length; i++) {
    const num = nums[i];
    let popped = 0;
    while (queue.length > 0 && nums[queue[queue.length - 1]] <= num) {
      queue.pop();
      popped++;
    }
    queue.push(i);
    moves += popped + 1;

    let message = `位置 ${i} 的 ${num} 進來，不用彈出，直接放到佇列尾端。`;
    if (popped > 0) {
      message = `位置 ${i} 的 ${num} 進來，先從尾端彈出 ${popped} 個不比它大的數，再把它放到尾端。`;
    }

    if (queue[0] <= i - k) {
      message += `隊首的位置 ${queue[0]} 已經滑出視窗，從前端移除。`;
      queue.shift();
      moves++;
    }

    if (i >= k - 1) {
      answer[i - k + 1] = nums[queue[0]];
      message += `視窗最大值就是隊首的 ${nums[queue[0]]}。`;
    } else {
      message += `視窗還沒湊滿 ${k} 個。`;
    }

    frames.push({
      rows: [
        row("陣列", nums, { pointers: { 目前: i }, rangeStart: i - k + 1, rangeEnd: i }),
        row("佇列", indexCells(queue, nums), { indexed: false, pointers: { 隊首: 0 } }),
        row("答案", answer, { indexed: false }),
      ],
      message,
    });
  }

  frames.push({
    rows: [
      row("陣列", nums),
      row("佇列", indexCells(queue, nums), { indexed: false }),
      row("答案", answer, { indexed: false, answer: allPositions(answer) }),
    ],
    message: `每個視窗的最大值是 ${answer.join("、")}。每個數最多進出佇列各一次，一共只進出了 ${moves} 次。`,
  });
  return frames;
}

function decodeRescan(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  let looked = 0;
  let i = 0;

  while (i < letters.length) {
    looked++;

    if (letters[i] !== "]") {
      frames.push({
        rows: [row("字串", letters, { pointers: { 目前: i } })],
        message: `從頭找第一個 ]：位置 ${i} 的 ${letters[i]} 不是，看下一個。`,
      });
      i++;
      continue;
    }

    let open = i;
    while (letters[open] !== "[") {
      open--;
    }
    let start = open;
    while (start > 0 && isDigit(letters[start - 1])) {
      start--;
    }
    const repeat = Number(letters.slice(start, open).join(""));
    const inner = letters.slice(open + 1, i).join("");
    const expanded = inner.repeat(repeat);
    frames.push({
      rows: [row("字串", letters, { pointers: { 目前: i }, rangeStart: start, rangeEnd: i })],
      message: `位置 ${i} 是第一個 ]，往回找到它的 [ 和前面的數字，最內層是 ${repeat}[${inner}]。把它換成 ${expanded}，再回到開頭重新找。`,
    });
    letters.splice(start, i - start + 1, ...expanded);
    i = 0;
  }

  frames.push({
    rows: [row("字串", letters, { answer: allPositions(letters) })],
    message: `從頭到尾都沒有 ] 了，答案是 ${letters.join("")}。每展開一組就從頭再找，光是找 ] 就看了 ${looked} 個字元。`,
  });
  return frames;
}

function decodeStack(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const savedStrings: string[] = [];
  const savedCounts: number[] = [];
  let current = "";
  let count = 0;
  let looked = 0;

  for (let i = 0; i < letters.length; i++) {
    const ch = letters[i];
    let message = "";
    looked++;

    if (isDigit(ch)) {
      count = count * 10 + Number(ch);
      message = `${ch} 是數字，記下接下來這一層要重複 ${count} 次。`;
    } else if (ch === "[") {
      savedStrings.push(current);
      savedCounts.push(count);
      message = `[ 代表進入新的一層：把外層已經組好的字串 "${current}" 和次數 ${count} 存進堆疊，目前字串清空，重新開始組。`;
      current = "";
      count = 0;
    } else if (ch === "]") {
      const previous = savedStrings.pop() as string;
      const repeat = savedCounts.pop() as number;
      const inner = current;
      current = previous + inner.repeat(repeat);
      message = `] 代表這一層結束：從堆疊取回外層字串 "${previous}" 和次數 ${repeat}，外層字串接上 ${inner} 重複 ${repeat} 次，目前字串變成 ${current}。`;
    } else {
      current += ch;
      message = `${ch} 是字母，接到目前字串後面，變成 ${current}。`;
    }

    const saved = savedStrings.map((outer, index) => `"${outer}",${savedCounts[index]}`);
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 目前: i } }),
        stackRow("堆疊", saved),
        row("目前字串", [...current], { indexed: false }),
      ],
      message,
    });
  }

  const result = [...current];
  frames.push({
    rows: [
      row("字串", letters),
      stackRow("堆疊", []),
      row("目前字串", result, { indexed: false, answer: allPositions(result) }),
    ],
    message: `字串看完了，目前字串 ${current} 就是答案。不用回頭重找，每個字元只看一次，一共只看了 ${looked} 個字元。`,
  });
  return frames;
}

function nextGreaterScan(nums1: number[], nums2: number[]) {
  const frames: Frame[] = [];
  const answer: Cell[] = nums1.map(() => "");
  let compared = 0;

  for (let i = 0; i < nums1.length; i++) {
    const num = nums1[i];
    const query = row("陣列一", nums1, { pointers: { 甲: i } });
    const target = row("答案", answer, { pointers: { 甲: i } });

    let start = 0;
    while (nums2[start] !== num) {
      compared++;
      frames.push({
        rows: [query, row("陣列二", nums2, { pointers: { 乙: start } }), target],
        message: `先在陣列二裡找 ${num} 的位置：位置 ${start} 的 ${nums2[start]} 不是 ${num}，看下一個。`,
      });
      start++;
    }
    compared++;
    frames.push({
      rows: [query, row("陣列二", nums2, { pointers: { 乙: start }, rangeStart: start }), target],
      message: `在陣列二的位置 ${start} 找到 ${num} 了。接著從它的右邊一個一個找第一個比它大的數。`,
    });

    for (let j = start + 1; j < nums2.length; j++) {
      compared++;
      if (nums2[j] > num) {
        answer[i] = nums2[j];
        frames.push({
          rows: [
            query,
            row("陣列二", nums2, { pointers: { 乙: j }, rangeStart: start }),
            row("答案", answer, { pointers: { 甲: i } }),
          ],
          message: `位置 ${j} 的 ${nums2[j]} 比 ${num} 大，它就是 ${num} 的下一個更大元素，寫進答案。`,
        });
        break;
      }
      frames.push({
        rows: [query, row("陣列二", nums2, { pointers: { 乙: j }, rangeStart: start }), target],
        message: `往右找比 ${num} 大的數：位置 ${j} 的 ${nums2[j]} 沒有比 ${num} 大，看下一個。`,
      });
    }

    if (answer[i] === "") {
      answer[i] = -1;
      frames.push({
        rows: [query, row("陣列二", nums2, { rangeStart: start }), row("答案", answer, { pointers: { 甲: i } })],
        message: `${num} 的右邊都沒有比它大的數，答案寫 -1。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列一", nums1), row("陣列二", nums2), row("答案", answer, { answer: allPositions(answer) })],
    message: `答案是 ${answer.join("、")}。每個數都要先找位置、再往右找，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function nextGreaterStack(nums1: number[], nums2: number[]) {
  const frames: Frame[] = [];
  const nextGreaterOf = new Map<number, number>();
  const stack: number[] = [];
  let compared = 0;

  frames.push({
    rows: [row("陣列二", nums2), stackRow("堆疊", stack), row("雜湊表", [], { indexed: false })],
    message: `陣列一是 ${nums1.join("、")}，先放著。用堆疊把陣列二每個數的下一個更大元素都找出來，記進雜湊表，之後查表就好。`,
  });

  for (let i = 0; i < nums2.length; i++) {
    const num = nums2[i];
    const numbers = row("陣列二", nums2, { pointers: { 目前: i } });

    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      compared++;
      if (num <= top) {
        break;
      }
      stack.pop();
      nextGreaterOf.set(top, num);
      frames.push({
        rows: [numbers, stackRow("堆疊", stack), row("雜湊表", tableCells(nextGreaterOf), { indexed: false })],
        message: `${num} 比堆疊頂端的 ${top} 大，所以 ${top} 的下一個更大元素就是 ${num}。把 ${top} 彈出，把 ${top}→${num} 記進雜湊表。`,
      });
    }

    stack.push(num);
    frames.push({
      rows: [numbers, stackRow("堆疊", stack), row("雜湊表", tableCells(nextGreaterOf), { indexed: false })],
      message: `堆疊頂端沒有比 ${num} 小的數了，把 ${num} 放進堆疊，等右邊出現比它大的數。`,
    });
  }

  const keys = [...nextGreaterOf.keys()];
  const answer: number[] = [];
  const used: number[] = [];
  for (const num of nums1) {
    const found = nextGreaterOf.get(num);

    if (found === undefined) {
      answer.push(-1);
      frames.push({
        rows: [row("陣列二", nums2), stackRow("堆疊", stack), row("雜湊表", tableCells(nextGreaterOf), { indexed: false })],
        message: `查陣列一的 ${num}：雜湊表裡沒有它，代表它到最後都留在堆疊裡，右邊沒有更大的數，答案是 -1。`,
      });
    } else {
      const entry = keys.indexOf(num);
      answer.push(found);
      used.push(entry);
      frames.push({
        rows: [
          row("陣列二", nums2),
          stackRow("堆疊", stack),
          row("雜湊表", tableCells(nextGreaterOf), { indexed: false, pointers: { 目前: entry } }),
        ],
        message: `查陣列一的 ${num}：雜湊表裡有 ${num}→${found}，答案是 ${found}，查一次就知道。`,
      });
    }
  }

  const total = compared + nums1.length;
  frames.push({
    rows: [
      row("陣列二", nums2),
      stackRow("堆疊", stack),
      row("雜湊表", tableCells(nextGreaterOf), { indexed: false, answer: used }),
    ],
    message: `答案是 ${answer.join("、")}。陣列二只走一遍，比較 ${compared} 次，再查表 ${nums1.length} 次，一共只做了 ${total} 次。`,
  });
  return frames;
}

function asteroidsRescan(asteroids: number[]) {
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

function asteroidsStack(asteroids: number[]) {
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

function temperaturesScan(temps: number[]) {
  const frames: Frame[] = [];
  const answer: Cell[] = temps.map(() => "");
  let compared = 0;

  for (let day = 0; day < temps.length; day++) {
    const today = temps[day];

    for (let later = day + 1; later < temps.length; later++) {
      const days = row("陣列", temps, { pointers: { 甲: day, 乙: later }, rangeStart: day });
      compared++;

      if (temps[later] > today) {
        answer[day] = later - day;
        frames.push({
          rows: [days, row("答案", answer, { pointers: { 甲: day } })],
          message: `位置 ${later} 的 ${temps[later]} 比 ${today} 高，位置 ${day} 要等 ${later} - ${day} = ${later - day} 天，寫進答案。`,
        });
        break;
      }

      frames.push({
        rows: [days, row("答案", answer, { pointers: { 甲: day } })],
        message: `位置 ${day} 的 ${today} 往後一天一天找更高的氣溫：位置 ${later} 的 ${temps[later]} 沒有比較高，看下一天。`,
      });
    }

    if (answer[day] === "") {
      answer[day] = 0;
      frames.push({
        rows: [
          row("陣列", temps, { pointers: { 甲: day }, rangeStart: day }),
          row("答案", answer, { pointers: { 甲: day } }),
        ],
        message: `位置 ${day} 的 ${today} 後面都沒有更高的氣溫，答案寫 0。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", temps), row("答案", answer, { answer: allPositions(answer) })],
    message: `答案是 ${answer.join("、")}。每一天都往後一天一天找，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function temperaturesStack(temps: number[]) {
  const frames: Frame[] = [];
  const answer = temps.map(() => 0);
  const shown: Cell[] = temps.map(() => "");
  const stack: number[] = [];
  let compared = 0;

  frames.push({
    rows: [row("陣列", temps), stackRow("堆疊", stack), row("答案", shown)],
    message: "堆疊裡放「還沒等到更高氣溫」的位置，畫成「位置:氣溫」。每走到新的一天，就看它能不能讓堆疊頂端等到。",
  });

  for (let i = 0; i < temps.length; i++) {
    const days = row("陣列", temps, { pointers: { 目前: i } });

    while (stack.length > 0) {
      const previous = stack[stack.length - 1];
      compared++;
      if (temps[i] <= temps[previous]) {
        break;
      }
      stack.pop();
      answer[previous] = i - previous;
      shown[previous] = answer[previous];
      frames.push({
        rows: [days, stackRow("堆疊", indexCells(stack, temps)), row("答案", shown, { pointers: { 目前: previous } })],
        message: `位置 ${i} 的 ${temps[i]} 比堆疊頂端位置 ${previous} 的 ${temps[previous]} 高：位置 ${previous} 等了 ${i} - ${previous} = ${answer[previous]} 天，寫進答案，把它彈出。`,
      });
    }

    stack.push(i);
    frames.push({
      rows: [days, stackRow("堆疊", indexCells(stack, temps)), row("答案", shown)],
      message: `堆疊頂端沒有比 ${temps[i]} 低的了，把位置 ${i} 放進堆疊，等後面出現更高的氣溫。`,
    });
  }

  frames.push({
    rows: [
      row("陣列", temps),
      stackRow("堆疊", indexCells(stack, temps)),
      row("答案", answer, { answer: allPositions(answer) }),
    ],
    message: `答案是 ${answer.join("、")}，還留在堆疊裡的位置等不到，所以是 0。每個位置最多進出堆疊一次，一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function spanScan(prices: number[]) {
  const frames: Frame[] = [];
  const answer: Cell[] = prices.map(() => "");
  let compared = 0;

  for (let today = 0; today < prices.length; today++) {
    const price = prices[today];
    let span = 1;
    let day = today - 1;

    while (day >= 0) {
      compared++;
      if (prices[day] > price) {
        answer[today] = span;
        frames.push({
          rows: [
            row("價格", prices, { pointers: { 今天: today, 目前: day }, rangeStart: day + 1, rangeEnd: today }),
            row("答案", answer, { pointers: { 今天: today } }),
          ],
          message: `位置 ${day} 的 ${prices[day]} 比今天的 ${price} 高，停下來。今天的跨度是 ${span}，寫進答案。`,
        });
        break;
      }
      span++;
      frames.push({
        rows: [
          row("價格", prices, { pointers: { 今天: today, 目前: day }, rangeStart: day, rangeEnd: today }),
          row("答案", answer, { pointers: { 今天: today } }),
        ],
        message: `今天是位置 ${today} 的 ${price}，往前一天一天數：位置 ${day} 的 ${prices[day]} 沒有比它高，跨度變成 ${span}。`,
      });
      day--;
    }

    if (day < 0) {
      answer[today] = span;
      frames.push({
        rows: [
          row("價格", prices, { pointers: { 今天: today }, rangeEnd: today }),
          row("答案", answer, { pointers: { 今天: today } }),
        ],
        message: `今天是位置 ${today} 的 ${price}，往前已經沒有資料了，跨度就是 ${span}，寫進答案。`,
      });
    }
  }

  frames.push({
    rows: [row("價格", prices), row("答案", answer, { answer: allPositions(answer) })],
    message: `每天的跨度是 ${answer.join("、")}。每天都往前一天一天數，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function spanCells(stack: number[], spans: number[]) {
  return stack.map((price, index) => `${price}:${spans[index]}`);
}

function spanStack(prices: number[]) {
  const frames: Frame[] = [];
  const stack: number[] = [];
  const spans: number[] = [];
  const answer: Cell[] = prices.map(() => "");
  let compared = 0;

  frames.push({
    rows: [row("價格", prices, { rangeEnd: -1 }), stackRow("堆疊", []), row("答案", answer)],
    message: "堆疊每一格畫成「價格:跨度」，跨度是這個價格往前涵蓋了幾天。每天的新價格只和堆疊頂端比，不用一天一天數。",
  });

  for (let today = 0; today < prices.length; today++) {
    const price = prices[today];
    const priceRow = row("價格", prices, { pointers: { 今天: today }, rangeEnd: today });
    let span = 1;
    let reason = "堆疊是空的";

    while (stack.length > 0) {
      const top = stack[stack.length - 1];
      compared++;
      if (top > price) {
        reason = `堆疊頂端的 ${top} 比今天的 ${price} 高`;
        break;
      }
      stack.pop();
      const covered = spans.pop() as number;
      span += covered;
      frames.push({
        rows: [priceRow, stackRow("堆疊", spanCells(stack, spans)), row("答案", answer, { pointers: { 今天: today } })],
        message: `堆疊頂端的 ${top} 沒有比今天的 ${price} 高，它涵蓋的 ${covered} 天也一樣：整格彈出，跨度一次加 ${covered}，變成 ${span}。`,
      });
    }

    stack.push(price);
    spans.push(span);
    answer[today] = span;
    frames.push({
      rows: [priceRow, stackRow("堆疊", spanCells(stack, spans)), row("答案", answer, { pointers: { 今天: today } })],
      message: `${reason}，停下來。今天的跨度是 ${span}，寫進答案，再把 ${price} 和它的跨度 ${span} 放進堆疊。`,
    });
  }

  frames.push({
    rows: [
      row("價格", prices),
      stackRow("堆疊", spanCells(stack, spans)),
      row("答案", answer, { answer: allPositions(answer) }),
    ],
    message: `每天的跨度是 ${answer.join("、")}。每個價格最多進出堆疊各一次，一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function starsRescan(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  let looked = 0;
  let i = 0;

  while (i < letters.length) {
    looked++;

    if (letters[i] !== "*") {
      frames.push({
        rows: [row("字串", letters, { pointers: { 目前: i } })],
        message: `從頭找第一個星號：位置 ${i} 的 ${letters[i]} 不是星號，看下一個。`,
      });
      i++;
      continue;
    }

    frames.push({
      rows: [row("字串", letters, { pointers: { 目前: i }, rangeStart: i - 1, rangeEnd: i })],
      message: `位置 ${i} 是星號，把它和左邊的 ${letters[i - 1]} 一起刪掉，後面的字元往前補。然後回到開頭重新找。`,
    });
    letters.splice(i - 1, 2);
    i = 0;
  }

  frames.push({
    rows: [row("字串", letters, { answer: allPositions(letters) })],
    message: `從頭到尾都沒有星號了，答案是 ${letters.join("")}。每刪一次就從頭再找，一共看了 ${looked} 個字元。`,
  });
  return frames;
}

function starsStack(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const stack: string[] = [];
  let looked = 0;

  for (let i = 0; i < letters.length; i++) {
    const ch = letters[i];
    const textRow = row("字串", letters, { pointers: { 目前: i } });
    looked++;

    if (ch === "*") {
      const removed = stack.pop();
      frames.push({
        rows: [textRow, stackRow("堆疊", stack)],
        message: `遇到星號：堆疊頂端的 ${removed} 就是它左邊最近的字母，直接彈出，像按一次退格鍵。`,
      });
    } else {
      stack.push(ch);
      frames.push({
        rows: [textRow, stackRow("堆疊", stack)],
        message: `${ch} 是字母，放進堆疊。`,
      });
    }
  }

  frames.push({
    rows: [row("字串", letters), row("堆疊", stack, { indexed: false, answer: allPositions(stack) })],
    message: `字串看完了，堆疊裡由底到頂接起來就是答案 ${stack.join("")}。不用回頭重找，每個字元只看一次，一共只看了 ${looked} 個字元。`,
  });
  return frames;
}

const histogramHeights = [2, 3, 5, 6, 4, 5];
const rpnTokens = ["9", "6", "4", "2", "-", "*", "+"];
const minStackOps = ["放 5", "放 3", "放 4", "放 1", "取最小", "彈出", "看頂端", "取最小", "彈出", "取最小"];
const queueOps = ["放 1", "放 2", "看隊首", "取出", "放 3", "放 4", "取出", "取出"];
const windowNumbers = [6, 4, 2, 1, 3, 5, 2, 4];
const queryNumbers = [2, 5, 1, 3];
const sourceNumbers = [4, 1, 2, 6, 5, 3];
const asteroidSizes = [-2, 7, 5, 3, -3, 1, -4, -8];
const dayTemperatures = [76, 73, 71, 72, 69, 70, 75];
const dayPrices = [90, 50, 60, 55, 70, 65, 80, 85];

export const stage3: ProblemAnimation[] = [
  {
    problemId: 20,
    brute: bracketsDeletePairs("([{[()]}])"),
    efficient: bracketsStack("([{[()]}])"),
  },
  {
    problemId: 84,
    brute: rectangleBrute(histogramHeights),
    efficient: rectangleStack(histogramHeights),
  },
  {
    problemId: 150,
    brute: rpnRescan(rpnTokens),
    efficient: rpnStack(rpnTokens),
  },
  {
    problemId: 155,
    brute: minStackScan(minStackOps),
    efficient: minStackTwoStacks(minStackOps),
  },
  {
    problemId: 232,
    brute: queueMoveBack(queueOps),
    efficient: queueTwoStacks(queueOps),
  },
  {
    problemId: 239,
    brute: windowMaxScan(windowNumbers, 4),
    efficient: windowMaxQueue(windowNumbers, 4),
  },
  {
    problemId: 394,
    brute: decodeRescan("3[a2[c]]"),
    efficient: decodeStack("3[a2[c]]"),
  },
  {
    problemId: 496,
    brute: nextGreaterScan(queryNumbers, sourceNumbers),
    efficient: nextGreaterStack(queryNumbers, sourceNumbers),
  },
  {
    problemId: 735,
    brute: asteroidsRescan(asteroidSizes),
    efficient: asteroidsStack(asteroidSizes),
  },
  {
    problemId: 739,
    brute: temperaturesScan(dayTemperatures),
    efficient: temperaturesStack(dayTemperatures),
  },
  {
    problemId: 901,
    brute: spanScan(dayPrices),
    efficient: spanStack(dayPrices),
  },
  {
    problemId: 2390,
    brute: starsRescan("stack**r*y"),
    efficient: starsStack("stack**r*y"),
  },
];
