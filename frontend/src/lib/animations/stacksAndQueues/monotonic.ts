import { Cell, Frame, row } from "../types";
import { allPositions, stackRow } from "./rows";

function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
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

export function rectangleBrute(heights: number[]) {
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

export function rectangleStack(heights: number[]) {
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

export function windowMaxScan(nums: number[], k: number) {
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

export function windowMaxQueue(nums: number[], k: number) {
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

export function nextGreaterScan(nums1: number[], nums2: number[]) {
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

export function nextGreaterStack(nums1: number[], nums2: number[]) {
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

export function temperaturesScan(temps: number[]) {
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

export function temperaturesStack(temps: number[]) {
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

export function spanScan(prices: number[]) {
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

export function spanStack(prices: number[]) {
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
