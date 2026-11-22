import { Cell, Frame, Row, row } from "../types";
import { heapPop, heapPush, sortCount } from "./heapSteps";
import { treeCells } from "./treeRows";

type FoodEntry = { rating: number; food: string };
type Tweet = { time: number; id: number; user: string };
type FeedEntry = { time: number; user: string; index: number };

function allPositions(cells: Cell[]) {
  return cells.map((cell, index) => index);
}

function newer(a: { time: number }, b: { time: number }) {
  return a.time > b.time;
}

function tweetText(tweet: Tweet) {
  return `${tweet.user}:${tweet.id}`;
}

function tweetCells(users: string[], tweets: Record<string, Tweet[]>) {
  const cells: string[] = [];
  for (const user of users) {
    for (const tweet of tweets[user]) {
      cells.push(tweetText(tweet));
    }
  }
  return cells;
}

function followCells(users: string[], following: Record<string, string[]>) {
  const cells: string[] = [];
  for (const user of users) {
    if (following[user].length > 0) {
      cells.push(`${user}→${following[user].join(",")}`);
    }
  }
  return cells;
}

function applyTweetOp(op: string, time: number, tweets: Record<string, Tweet[]>, following: Record<string, string[]>) {
  const [user, name, target] = op.split(" ");

  if (name === "發") {
    tweets[user].push({ time, id: Number(target), user });
    return `${op}（postTweet）：把推文 ${target} 接到${user}自己那一串的最後面，同時記下發文時間。每個人的推文越右邊越新。`;
  }
  if (name === "追蹤") {
    following[user].push(target);
    return `${op}（follow）：在追蹤名單裡記下「${user}追蹤${target}」。`;
  }
  following[user].splice(following[user].indexOf(target), 1);
  return `${op}（unfollow）：把${target}從${user}的追蹤名單裡拿掉。`;
}

function tightOps(ops: string[]) {
  return ops.map((op) => op.split(" ").join(""));
}

export function twitterSortAll(users: string[], ops: string[], limit: number) {
  const frames: Frame[] = [];
  const opCells = tightOps(ops);
  const tweets: Record<string, Tweet[]> = {};
  const following: Record<string, string[]> = {};
  const results: string[] = [];
  let compared = 0;

  for (const user of users) {
    tweets[user] = [];
    following[user] = [];
  }

  function show(opRow: Row, collected: Tweet[], answer: number[], message: string) {
    frames.push({
      rows: [
        opRow,
        row("各人推文", tweetCells(users, tweets), { indexed: false }),
        row("追蹤", followCells(users, following), { indexed: false }),
        row("收集", collected.map(tweetText), { indexed: false, answer }),
      ],
      message,
    });
  }

  show(row("操作", opCells, { indexed: false }), [], [], `「各人推文」每格是「誰:推文編號」，編號照發文順序編，越大越新。題目的動態消息取最新 10 則，為了示範改成只取 ${limit} 則。`);

  for (let step = 0; step < ops.length; step++) {
    const [user, name] = ops[step].split(" ");
    const opRow = row("操作", opCells, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name !== "看動態") {
      const message = applyTweetOp(ops[step], step, tweets, following);
      show(opRow, [], [], message);
      continue;
    }

    const people = [user, ...following[user]];
    const collected: Tweet[] = [];
    for (const person of people) {
      collected.push(...tweets[person]);
    }
    show(opRow, collected, [], `${ops[step]}（getNewsFeed）：動態消息要看${people.join("、")}的推文。暴力解把這些人發過的推文全部收集起來，一共 ${collected.length} 則。`);

    const used = sortCount(collected, newer);
    const feed = collected.slice(0, limit).map((tweet) => tweet.id);
    compared += used;
    results.push(`[${feed.join(",")}]`);
    show(opRow, collected, allPositions(feed), `${ops[step]}（getNewsFeed）：把收集到的 ${collected.length} 則照發文時間由新到舊重新排序，比較了 ${used} 次。取最前面 ${feed.length} 則，回傳 ${feed.join("、")}。`);
  }

  show(row("操作", opCells, { indexed: false }), [], [], `${results.length} 次看動態依序回傳 ${results.join("、")}。每次都把相關的推文全部收集起來重新排序，一共比較了 ${compared} 次。`);
  return frames;
}

export function twitterMergeHeap(users: string[], ops: string[], limit: number) {
  const frames: Frame[] = [];
  const opCells = tightOps(ops);
  const tweets: Record<string, Tweet[]> = {};
  const following: Record<string, string[]> = {};
  const results: string[] = [];
  let compared = 0;

  for (const user of users) {
    tweets[user] = [];
    following[user] = [];
  }

  function show(opRow: Row, heap: FeedEntry[], taken: number[], message: string) {
    const nodes = heap.map((entry) => tweetText(tweets[entry.user][entry.index]));
    frames.push({
      rows: [
        opRow,
        row("各人推文", tweetCells(users, tweets), { indexed: false, answer: [...taken] }),
        row("追蹤", followCells(users, following), { indexed: false }),
        row("最大堆", treeCells(nodes, 3), { shape: "tree" }),
      ],
      message,
    });
  }

  show(row("操作", opCells, { indexed: false }), [], [], `「各人推文」每格是「誰:推文編號」，編號越大越新。「最大堆」的堆頂是堆裡最新的一則。題目取最新 10 則，為了示範改成只取 ${limit} 則。`);

  for (let step = 0; step < ops.length; step++) {
    const [user, name] = ops[step].split(" ");
    const opRow = row("操作", opCells, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name !== "看動態") {
      const message = applyTweetOp(ops[step], step, tweets, following);
      show(opRow, [], [], message);
      continue;
    }

    const head = `${ops[step]}（getNewsFeed）：`;
    const people = [user, ...following[user]];
    const cells = tweetCells(users, tweets);
    const heap: FeedEntry[] = [];
    const feed: number[] = [];
    const taken: number[] = [];
    let used = 0;

    for (const person of people) {
      const last = tweets[person].length - 1;
      if (last >= 0) {
        const entry = { time: tweets[person][last].time, user: person, index: last };
        used += heapPush(heap, entry, newer);
      }
    }
    compared += used;
    show(opRow, heap, taken, `${head}要看${people.join("、")}的推文。每個人那一串已經照時間排好，只把各自最新的一則放進最大堆，比較了 ${used} 次。`);

    while (heap.length > 0 && feed.length < limit) {
      const top = heap[0];
      const tweet = tweets[top.user][top.index];
      let next = `${top.user}沒有更早的推文了。`;
      used = heapPop(heap, newer);
      feed.push(tweet.id);
      taken.push(cells.indexOf(tweetText(tweet)));

      if (top.index > 0) {
        const previous = tweets[top.user][top.index - 1];
        const entry = { time: previous.time, user: top.user, index: top.index - 1 };
        used += heapPush(heap, entry, newer);
        next = `再把${top.user}的前一則 ${previous.id} 放進堆。`;
      }
      compared += used;
      show(opRow, heap, taken, `${head}彈出堆頂的 ${tweet.id}，它是還沒拿的推文裡最新的，記進動態消息。${next}比較了 ${used} 次。`);
    }

    let reason = `收滿 ${limit} 則就停，更舊的推文不用再看`;
    if (feed.length < limit) {
      reason = "堆空了，沒有更多推文";
    }
    results.push(`[${feed.join(",")}]`);
    show(opRow, heap, taken, `${head}${reason}。回傳 ${feed.join("、")}。`);
  }

  show(row("操作", opCells, { indexed: false }), [], [], `${results.length} 次看動態依序回傳 ${results.join("、")}。每個人只拿最新的一則進堆，拿滿就停，不用全部排序，一共只比較了 ${compared} 次。`);
  return frames;
}

export function foodScanAll(foods: string[], cuisines: string[], start: number[], ops: string[]) {
  const frames: Frame[] = [];
  const ratings = [...start];
  const results: string[] = [];
  let compared = 0;

  function show(opRow: Row, pointers: Record<string, number>, message: string) {
    frames.push({
      rows: [
        opRow,
        row("食物", foods, { indexed: false, pointers }),
        row("料理", cuisines, { indexed: false }),
        row("評分", ratings, { indexed: false }),
      ],
      message,
    });
  }

  show(
    row("操作", ops, { indexed: false, pointers: { 目前: 0 } }),
    {},
    "建立：暴力解把食物、料理、評分照原樣存成三個陣列，上下同一格是同一道食物。之後每次查詢或改評分，都從第一格開始找。",
  );

  for (let step = 1; step < ops.length; step++) {
    const [name, text, value] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "改") {
      const position = foods.indexOf(text);
      const old = ratings[position];
      ratings[position] = Number(value);
      compared += position + 1;
      show(opRow, { 目前: position }, `${ops[step]}（changeRating）：從第一格開始一道一道找${text}，比較了 ${position + 1} 次找到它，把評分從 ${old} 改成 ${value}。`);
      continue;
    }

    let best = -1;
    for (let i = 0; i < foods.length; i++) {
      let note = `${foods[i]}是${cuisines[i]}，不是${text}，跳過。`;
      compared++;

      if (cuisines[i] === text && best === -1) {
        best = i;
        note = `${foods[i]}是${text}，${ratings[i]} 分，先當成最高。`;
      } else if (cuisines[i] === text) {
        const higher = ratings[i] > ratings[best];
        const tie = ratings[i] === ratings[best] && foods[i] < foods[best];
        compared++;
        note = `${foods[i]}是${text}，${ratings[i]} 分，沒有贏過目前最高的${foods[best]}（${ratings[best]} 分）。`;
        if (higher || tie) {
          note = `${foods[i]}是${text}，${ratings[i]} 分，贏過目前最高的${foods[best]}（${ratings[best]} 分），最高換成它。`;
          best = i;
        }
      }

      const pointers: Record<string, number> = { 目前: i };
      if (best !== -1) {
        pointers.最高 = best;
      }
      if (i === foods.length - 1) {
        results.push(foods[best]);
        note += `全部看完了，回傳${foods[best]}。`;
      }
      show(opRow, pointers, `${ops[step]}（highestRated）：${note}`);
    }
  }

  show(row("操作", ops, { indexed: false }), {}, `${results.length} 次查詢依序回傳${results.join("、")}。每次查詢都把全部食物看一遍，改評分也要從頭找，一共比較了 ${compared} 次。`);
  return frames;
}

function higherRated(a: FoodEntry, b: FoodEntry) {
  if (a.rating !== b.rating) {
    return a.rating > b.rating;
  }
  return a.food < b.food;
}

function entryText(entry: FoodEntry) {
  return `${entry.food}:${entry.rating}`;
}

export function foodHeaps(foods: string[], cuisines: string[], start: number[], ops: string[]) {
  const frames: Frame[] = [];
  const ratingOf: Record<string, number> = {};
  const cuisineOf: Record<string, string> = {};
  const heaps: Record<string, FoodEntry[]> = {};
  const results: string[] = [];
  let compared = 0;

  for (const cuisine of cuisines) {
    heaps[cuisine] = [];
  }

  function show(opRow: Row, marked: string, options: Partial<Row>, message: string) {
    const table = Object.keys(ratingOf).map((food) => `${food}→${ratingOf[food]}`);
    const rows = [opRow, row("評分表", table, { indexed: false })];

    for (const cuisine of Object.keys(heaps)) {
      const cells = treeCells(heaps[cuisine].map(entryText), 7);
      if (cuisine === marked) {
        rows.push(row(`${cuisine}的堆`, cells, { shape: "tree", ...options }));
      } else {
        rows.push(row(`${cuisine}的堆`, cells, { shape: "tree" }));
      }
    }
    frames.push({ rows, message });
  }

  const buildRow = row("操作", ops, { indexed: false, pointers: { 目前: 0 } });
  show(buildRow, "", {}, "建立：「評分表」是雜湊表，記每道食物現在的評分。每種料理各有一個最大堆，節點寫成「食物:評分」，堆頂是評分最高的，同分時名稱字典序小的在上面。");

  for (let i = 0; i < foods.length; i++) {
    const food = foods[i];
    const cuisine = cuisines[i];
    const entry = { rating: start[i], food };
    ratingOf[food] = start[i];
    cuisineOf[food] = cuisine;
    const used = heapPush(heaps[cuisine], entry, higherRated);
    compared += used;
    show(buildRow, cuisine, { pointers: { 新: heaps[cuisine].indexOf(entry) } }, `建立：${food}是${cuisine}，${start[i]} 分。記進評分表，也記下它屬於${cuisine}，再放進${cuisine}的堆往上浮，比較了 ${used} 次。`);
  }

  for (let step = 1; step < ops.length; step++) {
    const [name, text, value] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "改") {
      const cuisine = cuisineOf[text];
      const old = ratingOf[text];
      const entry = { rating: Number(value), food: text };
      ratingOf[text] = entry.rating;
      const used = heapPush(heaps[cuisine], entry, higherRated);
      compared += used;
      show(opRow, cuisine, { pointers: { 新: heaps[cuisine].indexOf(entry) } }, `${ops[step]}（changeRating）：評分表改成 ${value}。不去堆裡找舊的，直接再放一筆「${text}:${value}」，比較了 ${used} 次。舊的「${text}:${old}」留在堆裡，變成過期資料。`);
      continue;
    }

    const head = `${ops[step]}（highestRated）：`;
    const heap = heaps[text];
    compared++;
    while (heap[0].rating !== ratingOf[heap[0].food]) {
      const stale = heap[0];
      show(opRow, text, { pointers: { 過期: 0 } }, `${head}堆頂是「${entryText(stale)}」，但評分表裡${stale.food}現在是 ${ratingOf[stale.food]} 分，對不上，這筆過期了，把它彈掉。`);
      compared += heapPop(heap, higherRated);
      compared++;
    }

    const top = heap[0];
    results.push(top.food);
    show(opRow, text, { answer: [0] }, `${head}堆頂是「${entryText(top)}」，和評分表裡的 ${top.rating} 分對得上，是有效的。它就是${text}評分最高的，回傳${top.food}。`);
  }

  show(row("操作", ops, { indexed: false }), "", {}, `${results.length} 次查詢依序回傳${results.join("、")}。查詢只看堆頂，過期的才彈掉，連建立時放進堆的都算，一共只比較了 ${compared} 次。`);
  return frames;
}
