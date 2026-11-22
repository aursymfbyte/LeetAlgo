import { Cell, Frame, row } from "../types";
import { positions } from "./rows";

export function maxSubarrayBrute(numbers: number[]) {
  const frames: Frame[] = [];
  let best = -Infinity;
  let bestStart = 0;
  let bestEnd = 0;
  let added = 0;

  for (let start = 0; start < numbers.length; start++) {
    let sum = 0;

    for (let end = start; end < numbers.length; end++) {
      sum += numbers[end];
      added++;
      if (sum > best) {
        best = sum;
        bestStart = start;
        bestEnd = end;
      }
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end })],
        message: `從位置 ${start} 開始往右加：加到 ${numbers[end]}，總和是 ${sum}，目前最大是 ${best}。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `總和最大的是位置 ${bestStart} 到 ${bestEnd} 這一段，總和是 ${best}。每個起點都重新加一次，一共做了 ${added} 次加法。`,
  });
  return frames;
}

export function maxSubarrayKadane(numbers: number[]) {
  const frames: Frame[] = [];
  const sums: Cell[] = numbers.map(() => "?");
  let current = 0;
  let start = 0;
  let best = -Infinity;
  let bestStart = 0;
  let bestEnd = 0;
  let added = 0;

  for (let index = 0; index < numbers.length; index++) {
    const number = numbers[index];
    let action = `前面累積的總和 ${current} 大於 0，把 ${number} 接上去`;
    if (current <= 0) {
      action = `前面累積的總和 ${current} 沒有大於 0，接上去不會變大，改從 ${number} 重新開始`;
      current = 0;
      start = index;
    }
    if (index === 0) {
      action = `第一個數前面沒有東西，直接從 ${number} 開始`;
    }

    current += number;
    added++;
    sums[index] = current;
    if (current > best) {
      best = current;
      bestStart = start;
      bestEnd = index;
    }
    frames.push({
      rows: [
        row("陣列", numbers, { pointers: { 目前: index }, rangeStart: start, rangeEnd: index }),
        row("結尾最大和", sums, { pointers: { 目前: index } }),
      ],
      message: `${action}，以 ${number} 結尾的最大總和是 ${current}，目前最大是 ${best}。`,
    });
  }

  frames.push({
    rows: [
      row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("結尾最大和", sums, { answer: [bestEnd] }),
    ],
    message: `總和最大的是位置 ${bestStart} 到 ${bestEnd} 這一段，總和是 ${best}。只記以前一個數結尾的最大總和，一共只做了 ${added} 次加法。`,
  });
  return frames;
}

export function stockChoicesBrute(prices: number[]) {
  const frames: Frame[] = [];
  const days = prices.length;
  const choices = prices.map(() => "不動");
  let best = -Infinity;
  let bestChoices: string[] = [];
  let compared = 0;

  function choose(day: number, holding: boolean, profit: number) {
    if (day < days) {
      choices[day] = "不動";
      choose(day + 1, holding, profit);
      if (holding) {
        choices[day] = "賣";
        choose(day + 1, false, profit + prices[day]);
      } else {
        choices[day] = "買";
        choose(day + 1, true, profit - prices[day]);
      }
      return;
    }

    let ending = "";
    if (holding) {
      ending = "最後股票沒賣掉，";
    }
    compared++;
    if (profit > best) {
      best = profit;
      bestChoices = [...choices];
    }
    frames.push({
      rows: [row("價格", prices), row("選擇", choices)],
      message: `每天可以不動，也可以買進或賣出，每一種選法都算一次：這一種${ending}利潤是 ${profit}，目前最多賺 ${best}。`,
    });
  }

  choose(0, false, 0);

  frames.push({
    rows: [row("價格", prices), row("選擇", bestChoices, { answer: positions(0, days - 1) })],
    message: `最多賺 ${best}。每天都有兩種選擇，${days} 天就有 ${compared} 種選法，每一種的利潤都要比，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function stockStates(prices: number[]) {
  const frames: Frame[] = [];
  const emptyHand: Cell[] = prices.map(() => "?");
  const withStock: Cell[] = prices.map(() => "?");
  let notHold = 0;
  let hold = -prices[0];
  let compared = 0;

  emptyHand[0] = notHold;
  withStock[0] = hold;
  frames.push({
    rows: [
      row("價格", prices, { pointers: { 今天: 0 } }),
      row("沒股票", emptyHand, { pointers: { 今天: 0 } }),
      row("有股票", withStock, { pointers: { 今天: 0 } }),
    ],
    message: `兩列分別記每天結束時「手上沒股票」和「手上有股票」的最大利潤。第 0 天：沒股票是 0，有股票就是用 ${prices[0]} 買進，利潤是 ${hold}。`,
  });

  for (let day = 1; day < prices.length; day++) {
    const price = prices[day];
    const yesterday = day - 1;

    const sell = hold + price;
    const newNotHold = Math.max(notHold, sell);
    compared++;
    emptyHand[day] = newNotHold;
    frames.push({
      rows: [
        row("價格", prices, { pointers: { 今天: day } }),
        row("沒股票", emptyHand, { pointers: { 昨天: yesterday, 今天: day } }),
        row("有股票", withStock, { pointers: { 昨天: yesterday } }),
      ],
      message: `第 ${day} 天沒股票：昨天就沒有是 ${notHold}，昨天有、今天用 ${price} 賣掉是 ${hold} + ${price} = ${sell}，取較大的 ${newNotHold}。`,
    });

    const buy = notHold - price;
    const newHold = Math.max(hold, buy);
    compared++;
    withStock[day] = newHold;
    frames.push({
      rows: [
        row("價格", prices, { pointers: { 今天: day } }),
        row("沒股票", emptyHand, { pointers: { 昨天: yesterday } }),
        row("有股票", withStock, { pointers: { 昨天: yesterday, 今天: day } }),
      ],
      message: `第 ${day} 天有股票：昨天就有是 ${hold}，昨天沒有、今天用 ${price} 買進是 ${notHold} - ${price} = ${buy}，取較大的 ${newHold}。`,
    });

    notHold = newNotHold;
    hold = newHold;
  }

  const lastDay = prices.length - 1;
  frames.push({
    rows: [row("價格", prices), row("沒股票", emptyHand, { answer: [lastDay] }), row("有股票", withStock)],
    message: `最後一天手上沒股票的利潤就是答案，最多賺 ${notHold}。每天只算兩個狀態，一共只比較了 ${compared} 次。`,
  });
  return frames;
}
