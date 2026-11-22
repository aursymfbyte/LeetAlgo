import { Frame, row } from "../types";

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

export function tradeBrute(prices: number[], rest: number, fee: number) {
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

export function cooldownStates(prices: number[]) {
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

export function feeStates(prices: number[], fee: number) {
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
