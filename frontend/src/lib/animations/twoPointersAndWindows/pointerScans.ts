import { Frame, row } from "../types";
import { positions } from "./rows";

export function allPairs(numbers: number[], target: number) {
  const frames: Frame[] = [];
  let tried = 0;

  for (let first = 0; first < numbers.length; first++) {
    for (let second = first + 1; second < numbers.length; second++) {
      const sum = numbers[first] + numbers[second];
      const cells = row("陣列", numbers, { pointers: { 甲: first, 乙: second }, rangeStart: first });
      tried++;

      if (sum === target) {
        frames.push({
          rows: [{ ...cells, answer: [first, second] }],
          message: `${numbers[first]} + ${numbers[second]} = ${sum}，等於 ${target}，找到了。一共試了 ${tried} 組。`,
        });
        return frames;
      }

      frames.push({
        rows: [cells],
        message: `要找兩個數加起來等於 ${target}。每一組都試：${numbers[first]} + ${numbers[second]} = ${sum}，不是，換下一組。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 })],
    message: `每一組都試過了，沒有兩個數加起來等於 ${target}。一共試了 ${tried} 組。`,
  });
  return frames;
}

export function twoPointers(numbers: number[], target: number) {
  const frames: Frame[] = [];
  let left = 0;
  let right = numbers.length - 1;
  let tried = 0;

  frames.push({
    rows: [row("陣列", numbers, { pointers: { 左: left, 右: right } })],
    message: `要找兩個數加起來等於 ${target}。陣列已經排序好，左指針從最小的數開始，右指針從最大的數開始。`,
  });

  while (left < right) {
    const sum = numbers[left] + numbers[right];
    const cells = row("陣列", numbers, {
      pointers: { 左: left, 右: right },
      rangeStart: left,
      rangeEnd: right,
    });
    tried++;

    if (sum === target) {
      frames.push({
        rows: [{ ...cells, answer: [left, right] }],
        message: `${numbers[left]} + ${numbers[right]} = ${sum}，等於 ${target}，找到了。一共只試了 ${tried} 組。`,
      });
      return frames;
    }

    if (sum < target) {
      frames.push({
        rows: [cells],
        message: `${numbers[left]} + ${numbers[right]} = ${sum}，比 ${target} 小。左指針往右移，換一個比較大的數。`,
      });
      left++;
    } else {
      frames.push({
        rows: [cells],
        message: `${numbers[left]} + ${numbers[right]} = ${sum}，比 ${target} 大。右指針往左移，換一個比較小的數。`,
      });
      right--;
    }
  }

  frames.push({
    rows: [row("陣列", numbers, { rangeEnd: -1 })],
    message: `兩個指針碰在一起了，沒有兩個數加起來等於 ${target}。一共只試了 ${tried} 組。`,
  });
  return frames;
}

export function containerBrute(heights: number[]) {
  const frames: Frame[] = [];
  let bestLeft = 0;
  let bestRight = 0;
  let bestArea = 0;
  let tried = 0;

  for (let first = 0; first < heights.length; first++) {
    for (let second = first + 1; second < heights.length; second++) {
      const width = second - first;
      const shorter = Math.min(heights[first], heights[second]);
      const area = width * shorter;
      tried++;
      if (area > bestArea) {
        bestArea = area;
        bestLeft = first;
        bestRight = second;
      }
      frames.push({
        rows: [row("陣列", heights, { pointers: { 甲: first, 乙: second }, rangeStart: first, rangeEnd: second })],
        message: `每兩條線都配一次：位置 ${first} 和 ${second}，寬度 ${width} × 較矮的高度 ${shorter} = ${area}，目前最大是 ${bestArea}。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", heights, { rangeStart: bestLeft, rangeEnd: bestRight, answer: [bestLeft, bestRight] })],
    message: `選位置 ${bestLeft} 和 ${bestRight} 這兩條線，最多能裝 ${bestArea}。每兩條線都配過一次，一共算了 ${tried} 次面積。`,
  });
  return frames;
}

export function containerTwoPointers(heights: number[]) {
  const frames: Frame[] = [];
  let left = 0;
  let right = heights.length - 1;
  let bestLeft = 0;
  let bestRight = 0;
  let bestArea = 0;
  let tried = 0;

  frames.push({
    rows: [row("陣列", heights, { pointers: { 左: left, 右: right } })],
    message: "左指針從最左邊、右指針從最右邊開始，這時候寬度最大。之後每算完一次面積，就移動比較矮的那一邊。",
  });

  while (left < right) {
    const width = right - left;
    const shorter = Math.min(heights[left], heights[right]);
    const area = width * shorter;
    const cells = row("陣列", heights, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right });
    tried++;
    if (area > bestArea) {
      bestArea = area;
      bestLeft = left;
      bestRight = right;
    }

    if (heights[left] < heights[right]) {
      frames.push({
        rows: [cells],
        message: `寬度 ${width} × 較矮的高度 ${shorter} = ${area}，目前最大是 ${bestArea}。左邊比較矮，它再配中間的線也不會更大，左指針往右移。`,
      });
      left++;
    } else {
      frames.push({
        rows: [cells],
        message: `寬度 ${width} × 較矮的高度 ${shorter} = ${area}，目前最大是 ${bestArea}。右邊沒有比左邊高，它再配中間的線也不會更大，右指針往左移。`,
      });
      right--;
    }
  }

  frames.push({
    rows: [row("陣列", heights, { rangeStart: bestLeft, rangeEnd: bestRight, answer: [bestLeft, bestRight] })],
    message: `選位置 ${bestLeft} 和 ${bestRight} 這兩條線，最多能裝 ${bestArea}。每次都排除一條線，一共只算了 ${tried} 次面積。`,
  });
  return frames;
}

export function threeSumBrute(numbers: number[]) {
  const frames: Frame[] = [];
  const answers: string[] = [];
  let sums = 0;

  for (let first = 0; first < numbers.length; first++) {
    for (let second = first + 1; second < numbers.length; second++) {
      for (let third = second + 1; third < numbers.length; third++) {
        const triple = [numbers[first], numbers[second], numbers[third]];
        const sum = triple[0] + triple[1] + triple[2];
        const text = `${triple.join("、")} 加起來是 ${sum}`;
        sums++;

        let result = "不是 0，換下一組。";
        if (sum === 0) {
          triple.sort((a, b) => a - b);
          const key = triple.join(",");
          if (answers.includes(key)) {
            result = `但排序後的 ${key} 已經在答案裡，不重複記。`;
          } else {
            answers.push(key);
            result = `把排序後的 ${key} 記進答案。`;
          }
        }

        frames.push({
          rows: [
            row("陣列", numbers, { pointers: { 甲: first, 乙: second, 丙: third }, rangeStart: first }),
            row("答案", answers, { indexed: false }),
          ],
          message: `三個數每一組都試：${text}，${result}`,
        });
      }
    }
  }

  frames.push({
    rows: [row("陣列", numbers), row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) })],
    message: `總和是 0 的三元組有 ${answers.length} 組。三層迴圈每一組都試，一共算了 ${sums} 次總和。`,
  });
  return frames;
}

export function threeSumTwoPointers(numbers: number[]) {
  const frames: Frame[] = [];
  const answers: string[] = [];
  const sorted = [...numbers];
  sorted.sort((a, b) => a - b);
  const last = sorted.length - 1;
  let sums = 0;

  frames.push({
    rows: [row("陣列", numbers), row("答案", answers, { indexed: false })],
    message: "先把陣列由小到大排序。排序後固定第一個數，剩下兩個數就能用左右指針找。",
  });

  for (let current = 0; current < sorted.length - 2; current++) {
    const first = sorted[current];
    const fixed = row("陣列", sorted, { pointers: { 目前: current }, rangeStart: current });

    if (current > 0 && first === sorted[current - 1]) {
      frames.push({
        rows: [fixed, row("答案", answers, { indexed: false })],
        message: `第一個數 ${first} 和前一個數一樣，找出來的答案會重複，直接跳過。`,
      });
      continue;
    }

    const smallest = first + sorted[current + 1] + sorted[current + 2];
    sums++;
    if (smallest > 0) {
      frames.push({
        rows: [fixed, row("答案", answers, { indexed: false })],
        message: `第一個數 ${first} 加上後面最小的兩個數，總和是 ${smallest}，已經比 0 大，再往後只會更大，可以結束了。`,
      });
      break;
    }

    const largest = first + sorted[last - 1] + sorted[last];
    sums++;
    if (largest < 0) {
      frames.push({
        rows: [fixed, row("答案", answers, { indexed: false })],
        message: `第一個數 ${first} 加上最大的兩個數，總和是 ${largest}，還是比 0 小，不可能湊出 0，換下一個。`,
      });
      continue;
    }

    let left = current + 1;
    let right = last;
    while (left < right) {
      const sum = first + sorted[left] + sorted[right];
      const text = `${first}、${sorted[left]}、${sorted[right]} 加起來是 ${sum}`;
      const cells = row("陣列", sorted, {
        pointers: { 目前: current, 左: left, 右: right },
        rangeStart: left,
        rangeEnd: right,
      });
      sums++;

      if (sum > 0) {
        frames.push({
          rows: [cells, row("答案", answers, { indexed: false })],
          message: `第一個數固定是 ${first}：${text}，比 0 大。右指針往左移，換一個比較小的數。`,
        });
        right--;
      } else if (sum < 0) {
        frames.push({
          rows: [cells, row("答案", answers, { indexed: false })],
          message: `第一個數固定是 ${first}：${text}，比 0 小。左指針往右移，換一個比較大的數。`,
        });
        left++;
      } else {
        answers.push(`${first},${sorted[left]},${sorted[right]}`);
        frames.push({
          rows: [cells, row("答案", answers, { indexed: false })],
          message: `第一個數固定是 ${first}：${text}，記進答案。兩個指針都往中間移，並跳過和剛才一樣的數。`,
        });
        left++;
        while (left < right && sorted[left] === sorted[left - 1]) {
          left++;
        }
        right--;
        while (left < right && sorted[right] === sorted[right + 1]) {
          right--;
        }
      }
    }
  }

  frames.push({
    rows: [row("陣列", sorted), row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) })],
    message: `總和是 0 的三元組有 ${answers.length} 組。排序後用雙指針，加上跳過重複和提早結束，一共只算了 ${sums} 次總和。`,
  });
  return frames;
}

export function rainBrute(heights: number[]) {
  const frames: Frame[] = [];
  const water: string[] = heights.map(() => "?");
  const last = heights.length - 1;
  let total = 0;
  let looked = 0;

  for (let current = 0; current <= last; current++) {
    let leftMax = 0;
    for (let index = 0; index <= current; index++) {
      leftMax = Math.max(leftMax, heights[index]);
      looked++;
    }
    frames.push({
      rows: [row("陣列", heights, { pointers: { 目前: current }, rangeEnd: current }), row("積水", water)],
      message: `算位置 ${current} 的積水：先從開頭看到自己，一共 ${current + 1} 格，左邊最高是 ${leftMax}。`,
    });

    let rightMax = 0;
    for (let index = current; index <= last; index++) {
      rightMax = Math.max(rightMax, heights[index]);
      looked++;
    }
    const level = Math.min(leftMax, rightMax);
    const amount = level - heights[current];
    total += amount;
    water[current] = String(amount);
    frames.push({
      rows: [row("陣列", heights, { pointers: { 目前: current }, rangeStart: current }), row("積水", water)],
      message: `再從自己看到結尾，一共 ${last - current + 1} 格，右邊最高是 ${rightMax}。水位是較矮的 ${level}，減掉自己的高度 ${heights[current]}，積水 ${amount}。`,
    });
  }

  frames.push({
    rows: [row("陣列", heights), row("積水", water)],
    message: `每一格的積水加起來，總共接了 ${total} 單位的雨水。每一格都要往左、往右各看一遍，一共看了 ${looked} 格。`,
  });
  return frames;
}

export function rainTwoPointers(heights: number[]) {
  const frames: Frame[] = [];
  const water: string[] = heights.map(() => "?");
  let left = 0;
  let right = heights.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let total = 0;
  let moves = 0;

  frames.push({
    rows: [row("陣列", heights, { pointers: { 左: left, 右: right } }), row("積水", water)],
    message: "左右指針從兩端往中間走，邊走邊記住左邊看過的最高和右邊看過的最高，哪一邊比較矮就先算哪一邊。",
  });

  while (left < right) {
    leftMax = Math.max(leftMax, heights[left]);
    rightMax = Math.max(rightMax, heights[right]);
    const highest = `左邊看過最高 ${leftMax}，右邊看過最高 ${rightMax}。`;
    moves++;

    if (leftMax < rightMax) {
      const amount = leftMax - heights[left];
      total += amount;
      water[left] = String(amount);
      frames.push({
        rows: [
          row("陣列", heights, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
          row("積水", water),
        ],
        message: `${highest}左邊比較矮，位置 ${left} 的水位由左邊決定，積水 ${leftMax} - ${heights[left]} = ${amount}。左指針往右移。`,
      });
      left++;
    } else {
      const amount = rightMax - heights[right];
      total += amount;
      water[right] = String(amount);
      frames.push({
        rows: [
          row("陣列", heights, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
          row("積水", water),
        ],
        message: `${highest}右邊沒有比左邊高，位置 ${right} 的水位由右邊決定，積水 ${rightMax} - ${heights[right]} = ${amount}。右指針往左移。`,
      });
      right--;
    }
  }

  water[left] = "0";
  frames.push({
    rows: [row("陣列", heights, { pointers: { 左: left, 右: right } }), row("積水", water)],
    message: `兩個指針在位置 ${left} 碰面，這裡是最高的柱子，不會積水。總共接了 ${total} 單位的雨水，兩個指針一共只移動了 ${moves} 次。`,
  });
  return frames;
}

export function stockBrute(prices: number[]) {
  const frames: Frame[] = [];
  let bestBuy = 0;
  let bestSell = 0;
  let bestProfit = 0;
  let compared = 0;

  for (let buy = 0; buy < prices.length; buy++) {
    for (let sell = buy + 1; sell < prices.length; sell++) {
      const profit = prices[sell] - prices[buy];
      compared++;
      if (profit > bestProfit) {
        bestProfit = profit;
        bestBuy = buy;
        bestSell = sell;
      }
      frames.push({
        rows: [row("陣列", prices, { pointers: { 買: buy, 賣: sell }, rangeStart: buy })],
        message: `每一組買賣日都試：位置 ${buy} 用 ${prices[buy]} 買、位置 ${sell} 用 ${prices[sell]} 賣，價差是 ${profit}，目前最多賺 ${bestProfit}。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", prices, { pointers: { 買: bestBuy, 賣: bestSell }, answer: [bestBuy, bestSell] })],
    message: `位置 ${bestBuy} 用 ${prices[bestBuy]} 買、位置 ${bestSell} 用 ${prices[bestSell]} 賣，最多賺 ${bestProfit}。每一組買賣日都試過，一共比較了 ${compared} 次。`,
  });
  return frames;
}

export function stockLowestSoFar(prices: number[]) {
  const frames: Frame[] = [];
  let lowest = 0;
  let bestBuy = 0;
  let bestSell = 0;
  let bestProfit = 0;
  let compared = 0;

  for (let today = 0; today < prices.length; today++) {
    const profit = prices[today] - prices[lowest];
    compared++;
    if (profit > bestProfit) {
      bestProfit = profit;
      bestBuy = lowest;
      bestSell = today;
    }
    const cells = row("陣列", prices, { pointers: { 最低: lowest, 目前: today }, rangeEnd: today });
    const text = `今天的價格 ${prices[today]} 減掉之前的最低價 ${prices[lowest]}，價差是 ${profit}，目前最多賺 ${bestProfit}。`;

    if (prices[today] < prices[lowest]) {
      frames.push({
        rows: [cells],
        message: `${text}今天比最低價還低，把最低價換成 ${prices[today]}。`,
      });
      lowest = today;
    } else {
      frames.push({
        rows: [cells],
        message: `${text}最低價不用換。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", prices, { pointers: { 買: bestBuy, 賣: bestSell }, answer: [bestBuy, bestSell] })],
    message: `位置 ${bestBuy} 用 ${prices[bestBuy]} 買、位置 ${bestSell} 用 ${prices[bestSell]} 賣，最多賺 ${bestProfit}。每天只和之前的最低價比一次，一共只比較了 ${compared} 次。`,
  });
  return frames;
}

function isLetterOrDigit(letter: string) {
  return /[A-Za-z0-9]/.test(letter);
}

export function palindromeReverse(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const cleaned: string[] = [];
  let steps = 0;

  for (let index = 0; index < letters.length; index++) {
    const letter = letters[index];
    steps++;

    let result = `${letter} 不是字母也不是數字，丟掉。`;
    if (isLetterOrDigit(letter)) {
      cleaned.push(letter.toLowerCase());
      result = `${letter} 是字母或數字，轉成小寫後接到新字串後面。`;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 目前: index }, rangeStart: index }),
        row("新字串", cleaned),
        row("反轉", []),
      ],
      message: `先整理出一個新字串：${result}`,
    });
  }

  const reversed = [...cleaned];
  reversed.reverse();
  steps += cleaned.length;
  frames.push({
    rows: [row("字串", letters), row("新字串", cleaned), row("反轉", reversed)],
    message: `再把新字串反轉成另一個字串，又要走過 ${cleaned.length} 個字元。`,
  });

  for (let index = 0; index < cleaned.length; index++) {
    const rows = [
      row("字串", letters),
      row("新字串", cleaned, { pointers: { 目前: index } }),
      row("反轉", reversed, { pointers: { 目前: index } }),
    ];
    steps++;

    if (cleaned[index] !== reversed[index]) {
      frames.push({
        rows,
        message: `位置 ${index}：新字串是 ${cleaned[index]}，反轉後是 ${reversed[index]}，不一樣，所以不是回文。整理、反轉、比較一共做了 ${steps} 步。`,
      });
      return frames;
    }

    frames.push({
      rows,
      message: `新字串和反轉後的字串逐一比較：位置 ${index} 都是 ${cleaned[index]}，一樣。`,
    });
  }

  frames.push({
    rows: [row("字串", letters), row("新字串", cleaned), row("反轉", reversed)],
    message: `每個位置都一樣，是回文。整理、反轉、比較一共做了 ${steps} 步，還多用了兩個新字串的空間。`,
  });
  return frames;
}

export function palindromeTwoPointers(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  let left = 0;
  let right = letters.length - 1;
  let steps = 0;

  frames.push({
    rows: [row("字串", letters, { pointers: { 左: left, 右: right } })],
    message: "不另外建新字串，左右指針直接在原字串上從兩端往中間比，遇到不是字母或數字的字元就跳過。",
  });

  while (left < right) {
    const cells = row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right });
    steps++;

    if (!isLetterOrDigit(letters[left])) {
      frames.push({
        rows: [cells],
        message: `左邊的 ${letters[left]} 不是字母也不是數字，跳過它，左指針往右移。`,
      });
      left++;
    } else if (!isLetterOrDigit(letters[right])) {
      frames.push({
        rows: [cells],
        message: `右邊的 ${letters[right]} 不是字母也不是數字，跳過它，右指針往左移。`,
      });
      right--;
    } else if (letters[left].toLowerCase() !== letters[right].toLowerCase()) {
      frames.push({
        rows: [cells],
        message: `左邊的 ${letters[left]} 和右邊的 ${letters[right]} 轉成小寫後不一樣，所以不是回文。兩個指針一共只走了 ${steps} 步。`,
      });
      return frames;
    } else {
      frames.push({
        rows: [cells],
        message: `左邊的 ${letters[left]} 和右邊的 ${letters[right]} 轉成小寫後一樣，兩個指針都往中間移。`,
      });
      left++;
      right--;
    }
  }

  frames.push({
    rows: [row("字串", letters, { pointers: { 左: left, 右: right } })],
    message: `兩個指針碰面了，一路上都沒有不一樣的字元，是回文。不用建新字串，兩個指針一共只走了 ${steps} 步。`,
  });
  return frames;
}
