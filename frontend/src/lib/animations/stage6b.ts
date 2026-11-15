import { Cell, Frame, ProblemAnimation, row } from "./types";

function climbRecursion(top: number) {
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

function climbTwoValues(top: number) {
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

type TrieNode = {
  children: Record<string, TrieNode>;
  isEnd: boolean;
};

function buildTrie(words: string[]) {
  const root: TrieNode = { children: {}, isEnd: false };

  for (const word of words) {
    let node = root;
    for (const letter of word) {
      if (!node.children[letter]) {
        node.children[letter] = { children: {}, isEnd: false };
      }
      node = node.children[letter];
    }
    node.isEnd = true;
  }

  return root;
}

function yesNo(flags: boolean[]) {
  const cells: string[] = [];
  for (const flag of flags) {
    if (flag) {
      cells.push("是");
    } else {
      cells.push("否");
    }
  }
  return cells;
}

function wordBreakBrute(text: string, words: string[]) {
  const frames: Frame[] = [];
  const letters = [...text];
  const count = letters.length;
  const times = letters.map(() => 0);
  const pieces: string[] = [];
  let tried = 0;

  frames.push({
    rows: [
      row("字串", letters),
      row("字典", words, { indexed: false }),
      row("切法", pieces, { indexed: false }),
      row("拆過幾次", times),
    ],
    message: "從開頭試字典裡的每個單字，對得上就切下來，剩下的再用同樣的方法拆。不記結果，同一個位置可能被重複拆很多次。",
  });

  function canBreak(start: number): boolean {
    if (start === count) {
      frames.push({
        rows: [
          row("字串", letters),
          row("字典", words, { indexed: false }),
          row("切法", pieces, { indexed: false }),
          row("拆過幾次", times),
        ],
        message: `切到字串結尾了，切法是 ${pieces.join("、")}，每一段都是字典裡的單字。`,
      });
      return true;
    }

    times[start]++;
    tried++;
    const fits: string[] = [];

    for (const word of words) {
      if (text.startsWith(word, start)) {
        fits.push(word);
        pieces.push(word);
        const done = canBreak(start + word.length);
        if (done) {
          return true;
        }
        pieces.pop();
      }
    }

    let reason = `剩下的 ${text.slice(start)} 沒有任何單字對得上`;
    if (fits.length > 0) {
      reason = `${fits.join("、")} 對得上，可是切掉之後剩下的都拆不完`;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 起點: start }, rangeStart: start }),
        row("字典", words, { indexed: false }),
        row("切法", pieces, { indexed: false }),
        row("拆過幾次", times, { pointers: { 起點: start } }),
      ],
      message: `從位置 ${start} 開始：${reason}，這條路不通。這是第 ${times[start]} 次從位置 ${start} 開始拆。`,
    });
    return false;
  }

  const answer = canBreak(0);
  let result = `每一種切法都試過了，${text} 拆不完，答案是 false。`;
  if (answer) {
    result = `${text} 可以拆成 ${pieces.join("、")}，答案是 true。`;
  }

  frames.push({
    rows: [
      row("字串", letters),
      row("字典", words, { indexed: false }),
      row("切法", pieces, { indexed: false }),
      row("拆過幾次", times),
    ],
    message: `${result}不記結果，同一個起點會重複試，一共試了 ${tried} 次起點。`,
  });
  return frames;
}

function wordBreakTrie(text: string, words: string[]) {
  const frames: Frame[] = [];
  const letters = [...text];
  const count = letters.length;
  const root = buildTrie(words);
  const reachable = [true];
  for (let index = 0; index < count; index++) {
    reachable.push(false);
  }
  let starts = 0;

  frames.push({
    rows: [row("字串", letters), row("字典", words, { indexed: false }), row("能拆到", yesNo(reachable))],
    message: "先把字典的單字放進字典樹：開頭一樣的單字共用同一條路，從某個位置沿著樹往後走一趟，就同時比對了所有單字。",
  });
  frames.push({
    rows: [
      row("字串", letters),
      row("字典", words, { indexed: false }),
      row("能拆到", yesNo(reachable), { pointers: { 起點: 0 } }),
    ],
    message: "「能拆到」的位置 i 記錄前 i 個字元能不能剛好拆成單字。位置 0 是什麼都還沒拆，先記「是」。記「是」的位置才能當下一個單字的起點。",
  });

  for (let start = 0; start < count; start++) {
    if (!reachable[start]) {
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 起點: start }, rangeStart: start }),
          row("字典", words, { indexed: false }),
          row("能拆到", yesNo(reachable), { pointers: { 起點: start } }),
        ],
        message: `「能拆到」的位置 ${start} 是「否」，前面沒辦法剛好拆到這裡，不能當起點，跳過。`,
      });
      continue;
    }

    starts++;
    const found: string[] = [];
    const ends: number[] = [];
    let node = root;

    for (let index = start; index < count; index++) {
      const letter = letters[index];
      if (!node.children[letter]) {
        break;
      }
      node = node.children[letter];
      if (node.isEnd) {
        reachable[index + 1] = true;
        found.push(text.slice(start, index + 1));
        ends.push(index + 1);
      }
    }

    let message = `從位置 ${start} 沿字典樹往後走，還沒走到任何單字的結尾就沒有路了，從這裡拆不下去。`;
    if (found.length > 0) {
      message = `從位置 ${start} 沿字典樹往後走，途中走出的 ${found.join("、")} 是字典裡的單字，所以能拆到位置 ${ends.join("、")}，記成「是」。`;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 起點: start }, rangeStart: start }),
        row("字典", words, { indexed: false }),
        row("能拆到", yesNo(reachable), { pointers: { 起點: start } }),
      ],
      message,
    });
  }

  let result = `「能拆到」的位置 ${count} 是「否」，${text} 拆不完，答案是 false。`;
  if (reachable[count]) {
    result = `「能拆到」的位置 ${count} 是「是」，${text} 可以拆完，答案是 true。`;
  }

  frames.push({
    rows: [
      row("字串", letters),
      row("字典", words, { indexed: false }),
      row("能拆到", yesNo(reachable), { answer: [count] }),
    ],
    message: `${result}每個位置最多只當一次起點，一共只試了 ${starts} 次起點。`,
  });
  return frames;
}

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

function robBrute(nums: number[]) {
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

function robTwoValues(nums: number[]) {
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

function robCircleBrute(nums: number[]) {
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

function robCircleTwoTrips(nums: number[]) {
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

function lisCompareAll(nums: number[]) {
  const frames: Frame[] = [];
  const lengths = nums.map(() => 1);
  const shown: Cell[] = nums.map(() => "?");
  let compared = 0;

  shown[0] = 1;
  frames.push({
    rows: [row("陣列", nums, { pointers: { 目前: 0 }, rangeEnd: 0 }), row("結尾長度", shown, { pointers: { 目前: 0 } })],
    message: `「結尾長度」記錄以每個數結尾的最長遞增子序列有多長。位置 0 的 ${nums[0]} 前面沒有數，長度是 1。接著每個數都和前面所有的數比。`,
  });

  for (let current = 1; current < nums.length; current++) {
    const num = nums[current];
    shown[current] = 1;

    for (let before = 0; before < current; before++) {
      const earlier = nums[before];
      const longest = lengths[current];
      let result = `沒有比它小，不能接在後面，長度維持 ${longest}。`;
      compared++;

      if (earlier < num) {
        const longer = lengths[before] + 1;
        result = `比它小，可以接，長度 ${lengths[before]} + 1 = ${longer}，沒有比目前的 ${longest} 長，不更新。`;
        if (longer > longest) {
          lengths[current] = longer;
          shown[current] = longer;
          result = `比它小，可以接，長度 ${lengths[before]} + 1 = ${longer}，比目前的 ${longest} 長，更新。`;
        }
      }

      frames.push({
        rows: [
          row("陣列", nums, { pointers: { 前面: before, 目前: current }, rangeEnd: current }),
          row("結尾長度", shown, { pointers: { 前面: before, 目前: current } }),
        ],
        message: `算位置 ${current} 的 ${num}：位置 ${before} 的 ${earlier} ${result}`,
      });
    }
  }

  let best = 0;
  let bestEnd = 0;
  for (let index = 0; index < lengths.length; index++) {
    if (lengths[index] > best) {
      best = lengths[index];
      bestEnd = index;
    }
  }

  frames.push({
    rows: [row("陣列", nums), row("結尾長度", shown, { answer: [bestEnd] })],
    message: `「結尾長度」裡最大的是 ${best}，所以最長遞增子序列的長度是 ${best}。每個數都和前面所有的數比，一共比較了 ${compared} 次。`,
  });
  return frames;
}

function lisBinarySearch(nums: number[]) {
  const frames: Frame[] = [];
  const tails: number[] = [];
  let compared = 0;

  frames.push({
    rows: [row("陣列", nums), row("最小結尾", tails)],
    message: "「最小結尾」的位置 0 放長度 1 的遞增子序列最小能用什麼數結尾，位置 1 放長度 2 的，依此類推。它一定由小到大，可以二分搜尋。",
  });

  for (let current = 0; current < nums.length; current++) {
    const num = nums[current];
    const numbers = row("陣列", nums, { pointers: { 目前: current }, rangeStart: current });
    let left = 0;
    let right = tails.length;

    while (left < right) {
      const middle = Math.floor((left + right) / 2);
      const tail = tails[middle];
      const candidates = row("最小結尾", tails, { pointers: { 中: middle }, rangeStart: left, rangeEnd: right - 1 });
      compared++;

      if (tail < num) {
        frames.push({
          rows: [numbers, candidates],
          message: `替 ${num} 找第一個不比它小的結尾：中間的 ${tail} 比 ${num} 小，要找的在它右邊。`,
        });
        left = middle + 1;
      } else {
        frames.push({
          rows: [numbers, candidates],
          message: `替 ${num} 找第一個不比它小的結尾：中間的 ${tail} 沒有比 ${num} 小，要找的在它這裡或左邊。`,
        });
        right = middle;
      }
    }

    let message = `「最小結尾」裡沒有不比 ${num} 小的數，把 ${num} 放到最後一格，最長的遞增子序列變成長度 ${left + 1}。`;
    if (left < tails.length) {
      message = `第一個不比 ${num} 小的是位置 ${left} 的 ${tails[left]}，用 ${num} 換掉它：長度 ${left + 1} 的遞增子序列，結尾越小越容易往後接。`;
    }
    tails[left] = num;

    frames.push({
      rows: [numbers, row("最小結尾", tails, { pointers: { 放入: left } })],
      message,
    });
  }

  const all = tails.map((tail, index) => index);
  frames.push({
    rows: [row("陣列", nums), row("最小結尾", tails, { answer: all })],
    message: `「最小結尾」有 ${tails.length} 格，所以最長遞增子序列的長度是 ${tails.length}。每個數只做一次二分搜尋，一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function tradePlans(days: number, rest: number) {
  const plans: string[][] = [];
  const actions: string[] = [];

  function choose(day: number, holding: boolean, wait: number) {
    if (day === days) {
      plans.push([...actions]);
      return;
    }

    if (wait > 0) {
      actions.push("冷凍");
      choose(day + 1, false, wait - 1);
      actions.pop();
      return;
    }

    actions.push("不動");
    choose(day + 1, holding, 0);
    actions.pop();

    if (holding) {
      actions.push("賣");
      choose(day + 1, false, rest);
    } else {
      actions.push("買");
      choose(day + 1, true, 0);
    }
    actions.pop();
  }

  choose(0, false, 0);
  return plans;
}

function planProfit(prices: number[], plan: string[], fee: number) {
  let profit = 0;
  for (let day = 0; day < prices.length; day++) {
    if (plan[day] === "買") {
      profit -= prices[day];
    }
    if (plan[day] === "賣") {
      profit += prices[day] - fee;
    }
  }
  return profit;
}

function tradeText(prices: number[], plan: string[]) {
  const trades: string[] = [];
  for (let day = 0; day < prices.length; day++) {
    if (plan[day] === "買" || plan[day] === "賣") {
      trades.push(`用 ${prices[day]} ${plan[day]}`);
    }
  }
  if (trades.length === 0) {
    return "完全不買賣";
  }
  return trades.join("、");
}

function tradeBrute(prices: number[], rest: number, fee: number) {
  const frames: Frame[] = [];
  const plans = tradePlans(prices.length, rest);
  let best = -Infinity;
  let bestPlan: string[] = [];
  let compared = 0;
  let charge = "";
  if (fee > 0) {
    charge = `每賣一次扣手續費 ${fee}，`;
  }

  for (const plan of plans) {
    const profit = planProfit(prices, plan, fee);
    compared++;
    if (profit > best) {
      best = profit;
      bestPlan = plan;
    }
    frames.push({
      rows: [row("陣列", prices), row("動作", plan)],
      message: `每天買、賣或不動，所有走法一種一種試。第 ${compared} 種：${tradeText(prices, plan)}，${charge}利潤是 ${profit}，目前最多是 ${best}。`,
    });
  }

  const traded: number[] = [];
  for (let day = 0; day < bestPlan.length; day++) {
    if (bestPlan[day] === "買" || bestPlan[day] === "賣") {
      traded.push(day);
    }
  }

  frames.push({
    rows: [row("陣列", prices, { answer: traded }), row("動作", bestPlan, { answer: traded })],
    message: `照「動作」這一列買賣，最多能賺 ${best}。所有走法全部試過，一共有 ${plans.length} 種，比較了 ${compared} 次。`,
  });
  return frames;
}

function cooldownStates(prices: number[]) {
  const frames: Frame[] = [];
  let prevNotHold = 0;
  let notHold = 0;
  let hold = -prices[0];
  let compared = 0;
  let before = row("前天", [], { indexed: false });
  let yesterday = row("昨天", [`沒持有→${prevNotHold}`], { indexed: false });

  frames.push({
    rows: [
      row("陣列", prices, { pointers: { 今天: 0 }, rangeEnd: 0 }),
      before,
      yesterday,
      row("今天", [`沒持有→${notHold}`, `持有→${hold}`], { indexed: false }),
    ],
    message: `每天結束時記兩個最大利潤：「沒持有」股票的和「持有」股票的。第 0 天：沒持有是 0；用 ${prices[0]} 買進就是持有，是 ${hold}。還沒開始的昨天當成沒持有的 0。`,
  });

  for (let day = 1; day < prices.length; day++) {
    const price = prices[day];
    const numbers = row("陣列", prices, { pointers: { 今天: day }, rangeEnd: day });
    before = row("前天", [`沒持有→${prevNotHold}`], { indexed: false });
    yesterday = row("昨天", [`沒持有→${notHold}`, `持有→${hold}`], { indexed: false });

    const sold = hold + price;
    const newNotHold = Math.max(notHold, sold);
    compared++;
    frames.push({
      rows: [
        numbers,
        before,
        yesterday,
        row("今天", [`沒持有→${newNotHold}`, "持有→?"], { pointers: { 目前: 0 }, indexed: false }),
      ],
      message: `今天價格 ${price}。今天沒持有：昨天就沒持有是 ${notHold}；昨天持有、今天賣掉是 ${hold} + ${price} = ${sold}。取大的 ${newNotHold}。`,
    });

    const bought = prevNotHold - price;
    const newHold = Math.max(hold, bought);
    compared++;
    frames.push({
      rows: [
        numbers,
        before,
        yesterday,
        row("今天", [`沒持有→${newNotHold}`, `持有→${newHold}`], { pointers: { 目前: 1 }, indexed: false }),
      ],
      message: `今天持有：昨天就持有是 ${hold}；今天才買，因為賣出隔天不能買，要用前天沒持有的 ${prevNotHold} - ${price} = ${bought}。取大的 ${newHold}。`,
    });

    prevNotHold = notHold;
    notHold = newNotHold;
    hold = newHold;
  }

  frames.push({
    rows: [
      row("陣列", prices),
      before,
      yesterday,
      row("今天", [`沒持有→${notHold}`, `持有→${hold}`], { answer: [0], indexed: false }),
    ],
    message: `最後一天結束時「沒持有」的利潤就是答案：最多能賺 ${notHold}。每天兩個狀態各比較一次，一共只比較了 ${compared} 次。`,
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

function robTreeBrute(tree: Cell[]) {
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

function robTreeOnce(tree: Cell[]) {
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

function feeStates(prices: number[], fee: number) {
  const frames: Frame[] = [];
  let notHold = 0;
  let hold = -prices[0];
  let compared = 0;
  let yesterday = row("昨天", [], { indexed: false });

  frames.push({
    rows: [
      row("陣列", prices, { pointers: { 今天: 0 }, rangeEnd: 0 }),
      yesterday,
      row("今天", [`沒持有→${notHold}`, `持有→${hold}`], { indexed: false }),
    ],
    message: `每天結束時記兩個最大利潤：「沒持有」股票的和「持有」股票的。第 0 天：沒持有是 0；用 ${prices[0]} 買進就是持有，是 ${hold}。手續費 ${fee} 等賣出時再扣。`,
  });

  for (let day = 1; day < prices.length; day++) {
    const price = prices[day];
    const numbers = row("陣列", prices, { pointers: { 今天: day }, rangeEnd: day });
    yesterday = row("昨天", [`沒持有→${notHold}`, `持有→${hold}`], { indexed: false });

    const sold = hold + price - fee;
    const newNotHold = Math.max(notHold, sold);
    compared++;
    frames.push({
      rows: [
        numbers,
        yesterday,
        row("今天", [`沒持有→${newNotHold}`, "持有→?"], { pointers: { 目前: 0 }, indexed: false }),
      ],
      message: `今天價格 ${price}。今天沒持有：昨天就沒持有是 ${notHold}；昨天持有、今天賣掉再扣手續費是 ${hold} + ${price} - ${fee} = ${sold}。取大的 ${newNotHold}。`,
    });

    const bought = notHold - price;
    const newHold = Math.max(hold, bought);
    compared++;
    frames.push({
      rows: [
        numbers,
        yesterday,
        row("今天", [`沒持有→${newNotHold}`, `持有→${newHold}`], { pointers: { 目前: 1 }, indexed: false }),
      ],
      message: `今天持有：昨天就持有是 ${hold}；昨天沒持有、今天買進是 ${notHold} - ${price} = ${bought}。取大的 ${newHold}。`,
    });

    notHold = newNotHold;
    hold = newHold;
  }

  frames.push({
    rows: [
      row("陣列", prices),
      yesterday,
      row("今天", [`沒持有→${notHold}`, `持有→${hold}`], { answer: [0], indexed: false }),
    ],
    message: `最後一天結束時「沒持有」的利潤就是答案：最多能賺 ${notHold}。每天兩個狀態各比較一次，一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function minCostRecursion(cost: number[]) {
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

function minCostTwoValues(cost: number[]) {
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

const houseMoney = [2, 7, 9, 3, 1, 8];
const circleMoney = [5, 1, 2, 7, 3, 8];
const risingNumbers = [10, 9, 2, 5, 3, 7, 18];
const cooldownPrices = [1, 2, 3, 0, 2];
const treeMoney: Cell[] = [3, 4, 5, 1, 3, "", 1, 6, "", "", "", "", "", "", ""];
const feePrices = [1, 4, 3, 8];
const stairCosts = [10, 15, 20, 5, 30];

export const stage6b: ProblemAnimation[] = [
  {
    problemId: 70,
    brute: climbRecursion(5),
    efficient: climbTwoValues(5),
  },
  {
    problemId: 139,
    brute: wordBreakBrute("aaaab", ["a", "aa", "aaa"]),
    efficient: wordBreakTrie("aaaab", ["a", "aa", "aaa"]),
  },
  {
    problemId: 198,
    brute: robBrute(houseMoney),
    efficient: robTwoValues(houseMoney),
  },
  {
    problemId: 213,
    brute: robCircleBrute(circleMoney),
    efficient: robCircleTwoTrips(circleMoney),
  },
  {
    problemId: 300,
    brute: lisCompareAll(risingNumbers),
    efficient: lisBinarySearch(risingNumbers),
  },
  {
    problemId: 309,
    brute: tradeBrute(cooldownPrices, 1, 0),
    efficient: cooldownStates(cooldownPrices),
  },
  {
    problemId: 337,
    brute: robTreeBrute(treeMoney),
    efficient: robTreeOnce(treeMoney),
  },
  {
    problemId: 714,
    brute: tradeBrute(feePrices, 0, 2),
    efficient: feeStates(feePrices, 2),
  },
  {
    problemId: 746,
    brute: minCostRecursion(stairCosts),
    efficient: minCostTwoValues(stairCosts),
  },
];
