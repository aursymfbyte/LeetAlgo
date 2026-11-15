import { Frame, ProblemAnimation, row } from "./types";

function allPairs(numbers: number[], target: number) {
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

function twoPointers(numbers: number[], target: number) {
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

function shortestFrame(numbers: number[], target: number, bestStart: number, bestLength: number, summary: string) {
  if (bestLength === 0) {
    return {
      rows: [row("陣列", numbers, { rangeEnd: -1 })],
      message: `整個陣列加起來也不到 ${target}，沒有符合的子陣列。${summary}`,
    };
  }

  const bestEnd = bestStart + bestLength - 1;
  const answer: number[] = [];
  for (let index = bestStart; index <= bestEnd; index++) {
    answer.push(index);
  }
  return {
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer })],
    message: `總和至少是 ${target} 的最短子陣列，長度是 ${bestLength}。${summary}`,
  };
}

function allSubarrays(numbers: number[], target: number) {
  const frames: Frame[] = [];
  let bestStart = 0;
  let bestLength = 0;
  let added = 0;

  for (let start = 0; start < numbers.length; start++) {
    let sum = 0;
    for (let end = start; end < numbers.length; end++) {
      sum += numbers[end];
      added++;
      const cells = row("陣列", numbers, {
        pointers: { 起點: start, 終點: end },
        rangeStart: start,
        rangeEnd: end,
      });

      if (sum < target) {
        frames.push({
          rows: [cells],
          message: `從位置 ${start} 開始往右加：加到 ${numbers[end]}，總和是 ${sum}，還不到 ${target}。`,
        });
      } else {
        const length = end - start + 1;
        if (bestLength === 0 || length < bestLength) {
          bestLength = length;
          bestStart = start;
        }
        frames.push({
          rows: [cells],
          message: `從位置 ${start} 開始往右加：加到 ${numbers[end]}，總和是 ${sum}，達到 ${target} 了，長度是 ${length}，目前最短是 ${bestLength}。換下一個起點重新加。`,
        });
        break;
      }
    }
  }

  const summary = `每個起點都重新加一次，一共做了 ${added} 次加法。`;
  frames.push(shortestFrame(numbers, target, bestStart, bestLength, summary));
  return frames;
}

function slidingWindow(numbers: number[], target: number) {
  const frames: Frame[] = [];
  let left = 0;
  let sum = 0;
  let bestStart = 0;
  let bestLength = 0;
  let moves = 0;

  for (let right = 0; right < numbers.length; right++) {
    sum += numbers[right];
    moves++;
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
      message: `右邊界往右移，把 ${numbers[right]} 加進視窗，總和是 ${sum}。`,
    });

    while (sum >= target) {
      const length = right - left + 1;
      if (bestLength === 0 || length < bestLength) {
        bestLength = length;
        bestStart = left;
      }
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
        message: `總和 ${sum} 已經達到 ${target}，視窗長度是 ${length}，目前最短是 ${bestLength}。把左邊的 ${numbers[left]} 移出視窗，看能不能更短。`,
      });
      sum -= numbers[left];
      left++;
      moves++;
    }
  }

  const summary = `總和是邊移動邊更新的，不用重新加，兩個邊界一共只移動了 ${moves} 次。`;
  frames.push(shortestFrame(numbers, target, bestStart, bestLength, summary));
  return frames;
}

function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
}

function addLetter(count: Record<string, number>, letter: string, amount: number) {
  count[letter] = (count[letter] ?? 0) + amount;
}

function countLetters(text: string) {
  const count: Record<string, number> = {};
  for (const letter of text) {
    addLetter(count, letter, 1);
  }
  return count;
}

function countCells(count: Record<string, number>) {
  const cells: string[] = [];
  for (const letter of Object.keys(count).sort()) {
    if (count[letter] > 0) {
      cells.push(`${letter}→${count[letter]}`);
    }
  }
  return cells;
}

function sameCount(first: Record<string, number>, second: Record<string, number>) {
  const letters = [...Object.keys(first), ...Object.keys(second)];
  for (const letter of letters) {
    const firstTimes = first[letter] ?? 0;
    const secondTimes = second[letter] ?? 0;
    if (firstTimes !== secondTimes) {
      return false;
    }
  }
  return true;
}

function longestUniqueBrute(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  let bestStart = 0;
  let bestLength = 0;
  let checked = 0;

  for (let start = 0; start < letters.length; start++) {
    const seen: string[] = [];
    for (let end = start; end < letters.length; end++) {
      const letter = letters[end];
      const cells = row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end });
      checked++;

      if (seen.includes(letter)) {
        frames.push({
          rows: [cells],
          message: `從位置 ${start} 開始往右延伸：${letter} 在這一段裡已經出現過，不能再延伸。換下一個起點重新檢查。`,
        });
        break;
      }

      seen.push(letter);
      const length = end - start + 1;
      if (length > bestLength) {
        bestLength = length;
        bestStart = start;
      }
      frames.push({
        rows: [cells],
        message: `從位置 ${start} 開始往右延伸：加進 ${letter}，這一段沒有重複的字元，長度是 ${length}，目前最長是 ${bestLength}。`,
      });
    }
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `沒有重複字元的最長子字串是 ${best}，長度是 ${bestLength}。每個起點都重新檢查，一共檢查了 ${checked} 次。`,
  });
  return frames;
}

function longestUniqueWindow(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const count: Record<string, number> = {};
  let left = 0;
  let bestStart = 0;
  let bestLength = 0;
  let moves = 0;

  for (let right = 0; right < letters.length; right++) {
    const letter = letters[right];
    addLetter(count, letter, 1);
    moves++;
    let action = `右邊界往右移，${letter} 進視窗。`;

    while (count[letter] > 1) {
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
          row("雜湊表", countCells(count), { indexed: false }),
        ],
        message: `${action}雜湊表裡 ${letter} 的次數是 ${count[letter]}，重複了，要把左邊的字元移出視窗。`,
      });
      addLetter(count, letters[left], -1);
      action = `把左邊的 ${letters[left]} 移出視窗。`;
      left++;
      moves++;
    }

    const length = right - left + 1;
    if (length > bestLength) {
      bestLength = length;
      bestStart = left;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
        row("雜湊表", countCells(count), { indexed: false }),
      ],
      message: `${action}視窗裡沒有重複的字元，長度是 ${length}，目前最長是 ${bestLength}。`,
    });
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("雜湊表", countCells(count), { indexed: false }),
    ],
    message: `沒有重複字元的最長子字串是 ${best}，長度是 ${bestLength}。每個字元最多進出視窗各一次，兩個邊界一共只移動了 ${moves} 次。`,
  });
  return frames;
}

function containerBrute(heights: number[]) {
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

function containerTwoPointers(heights: number[]) {
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

function threeSumBrute(numbers: number[]) {
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

function threeSumTwoPointers(numbers: number[]) {
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

function rainBrute(heights: number[]) {
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

function rainTwoPointers(heights: number[]) {
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

function needCells(need: Record<string, number>, target: string) {
  const cells: string[] = [];
  for (const letter of new Set(target)) {
    cells.push(`${letter}→${need[letter]}`);
  }
  return cells;
}

function minWindowBrute(text: string, target: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const kinds = new Set(target).size;
  let bestStart = 0;
  let bestLength = 0;
  let added = 0;

  frames.push({
    rows: [row("字串", letters), row("還缺", needCells(countLetters(target), target), { indexed: false })],
    message: `要找最短的一段，湊齊 ${target} 的每個字母。「還缺」記錄每種字母還差幾個，負數代表這一段裡有多的。`,
  });

  for (let start = 0; start < letters.length; start++) {
    const need = countLetters(target);
    let missing = kinds;

    for (let end = start; end < letters.length; end++) {
      const letter = letters[end];
      addLetter(need, letter, -1);
      if (need[letter] === 0) {
        missing--;
      }
      added++;
      const rows = [
        row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end }),
        row("還缺", needCells(need, target), { indexed: false }),
      ];

      if (missing === 0) {
        const length = end - start + 1;
        if (bestLength === 0 || length < bestLength) {
          bestLength = length;
          bestStart = start;
        }
        frames.push({
          rows,
          message: `從位置 ${start} 開始往右延伸：加進 ${letter}，字母都湊齊了，長度是 ${length}，目前最短是 ${bestLength}。換下一個起點重新數。`,
        });
        break;
      }

      frames.push({
        rows,
        message: `從位置 ${start} 開始往右延伸：加進 ${letter}，還有 ${missing} 種字母沒湊齊。`,
      });
    }
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  const need = countLetters(target);
  for (const letter of best) {
    addLetter(need, letter, -1);
  }
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("還缺", needCells(need, target), { indexed: false }),
    ],
    message: `湊齊 ${target} 的最短子字串是 ${best}，長度是 ${bestLength}。每個起點都重新數，一共加了 ${added} 次字母。`,
  });
  return frames;
}

function minWindowSliding(text: string, target: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const need = countLetters(target);
  let missing = new Set(target).size;
  let left = 0;
  let bestStart = 0;
  let bestLength = 0;
  let moves = 0;

  frames.push({
    rows: [row("字串", letters), row("還缺", needCells(need, target), { indexed: false })],
    message: `要找最短的一段，湊齊 ${target} 的每個字母。「還缺」記錄每種字母還差幾個，負數代表視窗裡有多的。`,
  });

  for (let right = 0; right < letters.length; right++) {
    const letter = letters[right];
    addLetter(need, letter, -1);
    if (need[letter] === 0) {
      missing--;
    }
    moves++;

    let status = `還有 ${missing} 種字母沒湊齊。`;
    if (missing === 0) {
      status = "字母都湊齊了。";
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
        row("還缺", needCells(need, target), { indexed: false }),
      ],
      message: `右邊界往右移，${letter} 進視窗。${status}`,
    });

    while (missing === 0) {
      const length = right - left + 1;
      if (bestLength === 0 || length < bestLength) {
        bestLength = length;
        bestStart = left;
      }
      const out = letters[left];
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
          row("還缺", needCells(need, target), { indexed: false }),
        ],
        message: `視窗湊齊了，長度是 ${length}，目前最短是 ${bestLength}。把左邊的 ${out} 移出視窗，看能不能更短。`,
      });
      if (need[out] === 0) {
        missing++;
      }
      addLetter(need, out, 1);
      left++;
      moves++;
    }
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("還缺", needCells(need, target), { indexed: false }),
    ],
    message: `湊齊 ${target} 的最短子字串是 ${best}，長度是 ${bestLength}。每個字母最多進出視窗各一次，兩個邊界一共只移動了 ${moves} 次。`,
  });
  return frames;
}

function stockBrute(prices: number[]) {
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

function stockLowestSoFar(prices: number[]) {
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

function palindromeReverse(text: string) {
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

function palindromeTwoPointers(text: string) {
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

function replaceBrute(text: string, limit: number) {
  const frames: Frame[] = [];
  const letters = [...text];
  let bestStart = 0;
  let bestLength = 0;
  let checked = 0;

  for (let start = 0; start < letters.length; start++) {
    const count: Record<string, number> = {};
    let most = 0;

    for (let end = start; end < letters.length; end++) {
      const letter = letters[end];
      addLetter(count, letter, 1);
      most = Math.max(most, count[letter]);
      checked++;
      const length = end - start + 1;
      const changes = length - most;
      const rows = [
        row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end }),
        row("計數", countCells(count), { indexed: false }),
      ];
      const detail = `從位置 ${start} 開始：加進 ${letter}，長度 ${length}，最多的字母有 ${most} 個，其餘 ${changes} 個要換掉`;

      if (changes > limit) {
        frames.push({
          rows,
          message: `${detail}，超過 ${limit} 個了。換下一個起點重新數。`,
        });
        break;
      }

      if (length > bestLength) {
        bestLength = length;
        bestStart = start;
      }
      frames.push({
        rows,
        message: `${detail}，沒超過 ${limit} 個，目前最長是 ${bestLength}。`,
      });
    }
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("計數", countCells(countLetters(best)), { indexed: false }),
    ],
    message: `最長是 ${bestLength}：位置 ${bestStart} 到 ${bestEnd} 的 ${best}，最多換 ${limit} 個字母就全部一樣。每個起點都重新數，一共檢查了 ${checked} 次。`,
  });
  return frames;
}

function replaceWindow(text: string, limit: number) {
  const frames: Frame[] = [];
  const letters = [...text];
  const count: Record<string, number> = {};
  let most = 0;
  let left = 0;
  let bestStart = 0;
  let bestLength = 0;
  let moves = 0;

  frames.push({
    rows: [row("字串", letters), row("視窗計數", [], { indexed: false })],
    message: `視窗裡出現最多的字母留著，其他的都換掉。所以「視窗長度減掉最多個數」不超過 ${limit}，這個視窗就換得完。`,
  });

  for (let right = 0; right < letters.length; right++) {
    const letter = letters[right];
    addLetter(count, letter, 1);
    most = Math.max(most, count[letter]);
    moves++;
    let action = `右邊界往右移，${letter} 進視窗。`;

    while (right - left + 1 - most > limit) {
      const length = right - left + 1;
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
          row("視窗計數", countCells(count), { indexed: false }),
        ],
        message: `${action}長度 ${length} 減掉最多個數 ${most} 是 ${length - most}，超過 ${limit} 了，要把左邊的字母移出視窗。`,
      });
      addLetter(count, letters[left], -1);
      action = `把左邊的 ${letters[left]} 移出視窗。最多個數沿用記錄過的 ${most}，不重算，因為視窗沒有變長，不會影響答案。`;
      left++;
      moves++;
    }

    const length = right - left + 1;
    if (length > bestLength) {
      bestLength = length;
      bestStart = left;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
        row("視窗計數", countCells(count), { indexed: false }),
      ],
      message: `${action}長度 ${length} 減掉最多個數 ${most} 是 ${length - most}，沒超過 ${limit}，目前最長是 ${bestLength}。`,
    });
  }

  const bestEnd = bestStart + bestLength - 1;
  const best = text.slice(bestStart, bestEnd + 1);
  frames.push({
    rows: [
      row("字串", letters, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) }),
      row("視窗計數", countCells(countLetters(best)), { indexed: false }),
    ],
    message: `最長是 ${bestLength}：位置 ${bestStart} 到 ${bestEnd} 的 ${best}，最多換 ${limit} 個字母就全部一樣。兩個邊界一共只移動了 ${moves} 次。`,
  });
  return frames;
}

function anagramsBrute(text: string, pattern: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const size = pattern.length;
  const targetCount = countLetters(pattern);
  const answers: number[] = [];
  let counted = 0;

  for (let start = 0; start + size <= letters.length; start++) {
    const end = start + size - 1;
    const count: Record<string, number> = {};

    for (let index = start; index <= end; index++) {
      addLetter(count, letters[index], 1);
      counted++;
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 起點: start, 目前: index }, rangeStart: start, rangeEnd: end }),
          row("計數", countCells(count), { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `從位置 ${start} 取長度 ${size} 的一段，從頭數一次字母：數到 ${letters[index]}。`,
      });
    }

    let result = `這一段的計數和 ${pattern} 不一樣，不是異位詞。換下一個起點，全部重數。`;
    if (sameCount(count, targetCount)) {
      answers.push(start);
      result = `這一段的計數和 ${pattern} 一樣，是異位詞，把起點 ${start} 記進答案。換下一個起點，全部重數。`;
    }
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 起點: start }, rangeStart: start, rangeEnd: end }),
        row("計數", countCells(count), { indexed: false }),
        row("答案", answers, { indexed: false }),
      ],
      message: result,
    });
  }

  frames.push({
    rows: [
      row("字串", letters, { answer: answers }),
      row("計數", countCells(targetCount), { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `異位詞的起點是位置 ${answers.join("、")}。每個起點都重新數 ${size} 個字母，一共數了 ${counted} 次。`,
  });
  return frames;
}

function anagramsWindow(text: string, pattern: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const size = pattern.length;
  const targetCount = countLetters(pattern);
  const count: Record<string, number> = {};
  const answers: number[] = [];
  let updates = 0;

  frames.push({
    rows: [
      row("字串", letters),
      row("視窗計數", [], { indexed: false }),
      row("答案", answers, { indexed: false }),
    ],
    message: `異位詞就是字母計數一樣。用長度固定是 ${size} 的視窗往右滑，只維護視窗裡的字母計數，再和 ${pattern} 的計數比。`,
  });

  for (let right = 0; right < letters.length; right++) {
    addLetter(count, letters[right], 1);
    updates++;
    const left = right - size + 1;

    if (left < 0) {
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 右: right }, rangeEnd: right }),
          row("視窗計數", countCells(count), { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `${letters[right]} 進視窗，計數加一。視窗長度還不到 ${size}，繼續往右。`,
      });
      continue;
    }

    let result = `視窗計數和 ${pattern} 不一樣。`;
    if (sameCount(count, targetCount)) {
      answers.push(left);
      result = `視窗計數和 ${pattern} 一樣，把左邊界的位置 ${left} 記進答案。`;
    }
    const out = letters[left];
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
        row("視窗計數", countCells(count), { indexed: false }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${letters[right]} 進視窗，計數加一。${result}接著把左邊的 ${out} 移出視窗，計數減一。`,
    });
    addLetter(count, out, -1);
    updates++;
  }

  frames.push({
    rows: [
      row("字串", letters, { answer: answers }),
      row("視窗計數", countCells(count), { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `異位詞的起點是位置 ${answers.join("、")}。視窗每滑一格只加一個、減一個字母，一共只更新了 ${updates} 次計數。`,
  });
  return frames;
}

function permutations(letters: string) {
  if (letters.length === 1) {
    return [letters];
  }

  const list: string[] = [];
  for (let index = 0; index < letters.length; index++) {
    const rest = letters.slice(0, index) + letters.slice(index + 1);
    for (const tail of permutations(rest)) {
      list.push(letters[index] + tail);
    }
  }
  return list;
}

function permutationBrute(pattern: string, text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const size = pattern.length;
  const orders = permutations(pattern);
  let compared = 0;

  for (let current = 0; current < orders.length; current++) {
    const order = orders[current];

    for (let start = 0; start + size <= letters.length; start++) {
      const end = start + size - 1;
      const part = text.slice(start, end + 1);
      compared++;

      if (part === order) {
        frames.push({
          rows: [
            row("字串", letters, { rangeStart: start, rangeEnd: end, answer: positions(start, end) }),
            row("排列", orders, { pointers: { 目前: current }, rangeStart: current, answer: [current], indexed: false }),
          ],
          message: `排列 ${order} 和位置 ${start} 開始的 ${part} 一樣，找到了。${size} 個字母就有 ${orders.length} 種排列，一共比對了 ${compared} 次。`,
        });
        return frames;
      }

      frames.push({
        rows: [
          row("字串", letters, { pointers: { 起點: start }, rangeStart: start, rangeEnd: end }),
          row("排列", orders, { pointers: { 目前: current }, rangeStart: current, indexed: false }),
        ],
        message: `先列出 ${pattern} 的所有排列，一種一種拿去字串裡找：${order} 和位置 ${start} 開始的 ${part} 不一樣。`,
      });
    }
  }

  frames.push({
    rows: [row("字串", letters, { rangeEnd: -1 }), row("排列", orders, { rangeEnd: -1, indexed: false })],
    message: `每一種排列都找過了，字串裡都沒有。${size} 個字母就有 ${orders.length} 種排列，一共比對了 ${compared} 次。`,
  });
  return frames;
}

function permutationWindow(pattern: string, text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const size = pattern.length;
  const targetCount = countLetters(pattern);
  const count: Record<string, number> = {};
  let updates = 0;

  frames.push({
    rows: [row("字串", letters), row("視窗計數", [], { indexed: false })],
    message: `排列只是順序不同，字母計數一定一樣。用長度固定是 ${size} 的視窗往右滑，比對視窗和 ${pattern} 的字母計數就好。`,
  });

  for (let right = 0; right < letters.length; right++) {
    addLetter(count, letters[right], 1);
    updates++;
    const left = right - size + 1;

    if (left < 0) {
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 右: right }, rangeEnd: right }),
          row("視窗計數", countCells(count), { indexed: false }),
        ],
        message: `${letters[right]} 進視窗，計數加一。視窗長度還不到 ${size}，繼續往右。`,
      });
      continue;
    }

    if (sameCount(count, targetCount)) {
      const part = text.slice(left, right + 1);
      frames.push({
        rows: [
          row("字串", letters, { rangeStart: left, rangeEnd: right, answer: positions(left, right) }),
          row("視窗計數", countCells(count), { indexed: false }),
        ],
        message: `${letters[right]} 進視窗，視窗計數和 ${pattern} 一樣，${part} 就是它的一種排列，找到了。不用列出排列，一共只更新了 ${updates} 次計數。`,
      });
      return frames;
    }

    const out = letters[left];
    frames.push({
      rows: [
        row("字串", letters, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right }),
        row("視窗計數", countCells(count), { indexed: false }),
      ],
      message: `${letters[right]} 進視窗，計數加一。視窗計數和 ${pattern} 不一樣，把左邊的 ${out} 移出視窗，計數減一。`,
    });
    addLetter(count, out, -1);
    updates++;
  }

  frames.push({
    rows: [row("字串", letters, { rangeEnd: -1 }), row("視窗計數", countCells(count), { indexed: false })],
    message: `視窗滑到底了，沒有一段的字母計數和 ${pattern} 一樣。一共只更新了 ${updates} 次計數。`,
  });
  return frames;
}

function averageBrute(numbers: number[], size: number) {
  const frames: Frame[] = [];
  let bestStart = 0;
  let bestSum = -Infinity;
  let added = 0;

  for (let start = 0; start + size <= numbers.length; start++) {
    const end = start + size - 1;
    let sum = 0;

    for (let index = start; index <= end; index++) {
      sum += numbers[index];
      added++;
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 起點: start, 目前: index }, rangeStart: start, rangeEnd: end })],
        message: `從位置 ${start} 開始，重新加 ${size} 個數：加到 ${numbers[index]}，總和是 ${sum}。`,
      });
    }

    if (sum > bestSum) {
      bestSum = sum;
      bestStart = start;
    }
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 起點: start }, rangeStart: start, rangeEnd: end })],
      message: `這 ${size} 個數的總和是 ${sum}，目前最大總和是 ${bestSum}。換下一個起點，全部重新加。`,
    });
  }

  const bestEnd = bestStart + size - 1;
  frames.push({
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `最大總和是 ${bestSum}，平均是 ${bestSum} ÷ ${size} = ${bestSum / size}。每個起點都重新加 ${size} 個數，一共做了 ${added} 次加法。`,
  });
  return frames;
}

function averageWindow(numbers: number[], size: number) {
  const frames: Frame[] = [];
  let sum = 0;
  let bestStart = 0;
  let bestSum = -Infinity;
  let changes = 0;

  for (let right = 0; right < numbers.length; right++) {
    sum += numbers[right];
    changes++;
    const left = right - size + 1;

    if (left < 0) {
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 右: right }, rangeEnd: right })],
        message: `把 ${numbers[right]} 加進視窗，總和是 ${sum}。視窗長度還不到 ${size}，繼續往右。`,
      });
      continue;
    }

    if (sum > bestSum) {
      bestSum = sum;
      bestStart = left;
    }
    const out = numbers[left];
    const rest = sum - out;
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
      message: `把 ${numbers[right]} 加進視窗，總和是 ${sum}，目前最大總和是 ${bestSum}。再把最左邊的 ${out} 減掉，總和剩 ${rest}。`,
    });
    sum = rest;
    changes++;
  }

  const bestEnd = bestStart + size - 1;
  frames.push({
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `最大總和是 ${bestSum}，平均是 ${bestSum} ÷ ${size} = ${bestSum / size}。視窗每滑一格只加一個數、減一個數，一共只做了 ${changes} 次加減。`,
  });
  return frames;
}

function productBrute(numbers: number[], limit: number) {
  const frames: Frame[] = [];
  let found = 0;
  let multiplied = 0;

  for (let start = 0; start < numbers.length; start++) {
    let product = 1;

    for (let end = start; end < numbers.length; end++) {
      product *= numbers[end];
      multiplied++;
      const cells = row("陣列", numbers, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end });

      if (product >= limit) {
        frames.push({
          rows: [cells],
          message: `從位置 ${start} 開始往右乘：乘到 ${numbers[end]}，乘積是 ${product}，沒有小於 ${limit}，再乘只會更大。換下一個起點重新乘。`,
        });
        break;
      }

      found++;
      frames.push({
        rows: [cells],
        message: `從位置 ${start} 開始往右乘：乘到 ${numbers[end]}，乘積是 ${product}，小於 ${limit}，找到一個，目前有 ${found} 個。`,
      });
    }
  }

  frames.push({
    rows: [row("陣列", numbers)],
    message: `乘積小於 ${limit} 的子陣列一共有 ${found} 個。每個起點都重新乘一次，一共做了 ${multiplied} 次乘法。`,
  });
  return frames;
}

function productWindow(numbers: number[], limit: number) {
  const frames: Frame[] = [];
  let left = 0;
  let product = 1;
  let found = 0;
  let moves = 0;

  for (let right = 0; right < numbers.length; right++) {
    product *= numbers[right];
    moves++;
    let action = `右邊界往右移，把 ${numbers[right]} 乘進視窗，乘積是 ${product}。`;

    while (product >= limit) {
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
        message: `${action}沒有小於 ${limit}，要把左邊的數除掉。`,
      });
      product /= numbers[left];
      action = `把左邊的 ${numbers[left]} 除掉，乘積變成 ${product}。`;
      left++;
      moves++;
    }

    const count = right - left + 1;
    found += count;
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
      message: `${action}小於 ${limit}，以位置 ${right} 結尾的子陣列一次算進 ${count} 個，目前有 ${found} 個。`,
    });
  }

  frames.push({
    rows: [row("陣列", numbers)],
    message: `乘積小於 ${limit} 的子陣列一共有 ${found} 個。乘積是邊移動邊更新的，兩個邊界一共只移動了 ${moves} 次。`,
  });
  return frames;
}

function onesBrute(numbers: number[], flips: number) {
  const frames: Frame[] = [];
  let bestStart = 0;
  let bestLength = 0;
  let checked = 0;

  for (let start = 0; start < numbers.length; start++) {
    let zeros = 0;

    for (let end = start; end < numbers.length; end++) {
      if (numbers[end] === 0) {
        zeros++;
      }
      checked++;
      const cells = row("陣列", numbers, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end });

      if (zeros > flips) {
        frames.push({
          rows: [cells],
          message: `從位置 ${start} 開始往右延伸：加進 ${numbers[end]}，這一段有 ${zeros} 個 0，超過 ${flips} 個，翻不完。換下一個起點重新數。`,
        });
        break;
      }

      const length = end - start + 1;
      if (length > bestLength) {
        bestLength = length;
        bestStart = start;
      }
      frames.push({
        rows: [cells],
        message: `從位置 ${start} 開始往右延伸：加進 ${numbers[end]}，這一段有 ${zeros} 個 0，沒超過 ${flips} 個，長度是 ${length}，目前最長是 ${bestLength}。`,
      });
    }
  }

  const bestEnd = bestStart + bestLength - 1;
  frames.push({
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `最長是 ${bestLength}：把位置 ${bestStart} 到 ${bestEnd} 裡的 0 翻成 1，就是一段連續的 1。每個起點都重新數，一共檢查了 ${checked} 次。`,
  });
  return frames;
}

function onesWindow(numbers: number[], flips: number) {
  const frames: Frame[] = [];
  let left = 0;
  let zeros = 0;
  let bestStart = 0;
  let bestLength = 0;
  let moves = 0;

  for (let right = 0; right < numbers.length; right++) {
    if (numbers[right] === 0) {
      zeros++;
    }
    moves++;
    let action = `右邊界往右移，${numbers[right]} 進視窗，視窗裡有 ${zeros} 個 0。`;

    while (zeros > flips) {
      frames.push({
        rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
        message: `${action}超過 ${flips} 個，翻不完，要把左邊的數移出視窗。`,
      });
      if (numbers[left] === 0) {
        zeros--;
      }
      action = `把左邊的 ${numbers[left]} 移出視窗，視窗裡剩 ${zeros} 個 0。`;
      left++;
      moves++;
    }

    const length = right - left + 1;
    if (length > bestLength) {
      bestLength = length;
      bestStart = left;
    }
    frames.push({
      rows: [row("陣列", numbers, { pointers: { 左: left, 右: right }, rangeStart: left, rangeEnd: right })],
      message: `${action}沒超過 ${flips} 個，視窗長度是 ${length}，目前最長是 ${bestLength}。`,
    });
  }

  const bestEnd = bestStart + bestLength - 1;
  frames.push({
    rows: [row("陣列", numbers, { rangeStart: bestStart, rangeEnd: bestEnd, answer: positions(bestStart, bestEnd) })],
    message: `最長是 ${bestLength}：把位置 ${bestStart} 到 ${bestEnd} 裡的 0 翻成 1，就是一段連續的 1。兩個邊界一共只移動了 ${moves} 次。`,
  });
  return frames;
}

const pairNumbers = [1, 2, 4, 6, 8, 11, 15];
const windowNumbers = [2, 3, 1, 2, 4, 3];
const containerHeights = [3, 8, 6, 2, 5, 9, 4];
const threeSumNumbers = [-1, 0, 3, 1, -1, -5];
const rainHeights = [1, 0, 2, 0, 4, 0, 3, 1];
const stockPrices = [7, 1, 5, 3, 6, 4];
const averageNumbers = [1, 12, -5, -6, 50, 3, -8];
const productNumbers = [10, 5, 2, 6, 3, 4];
const onesNumbers = [1, 0, 1, 1, 0, 1, 1];

export const stage1: ProblemAnimation[] = [
  {
    problemId: 3,
    brute: longestUniqueBrute("abcbdea"),
    efficient: longestUniqueWindow("abcbdea"),
  },
  {
    problemId: 11,
    brute: containerBrute(containerHeights),
    efficient: containerTwoPointers(containerHeights),
  },
  {
    problemId: 15,
    brute: threeSumBrute(threeSumNumbers),
    efficient: threeSumTwoPointers(threeSumNumbers),
  },
  {
    problemId: 42,
    brute: rainBrute(rainHeights),
    efficient: rainTwoPointers(rainHeights),
  },
  {
    problemId: 76,
    brute: minWindowBrute("ADBCBA", "ABC"),
    efficient: minWindowSliding("ADBCBA", "ABC"),
  },
  {
    problemId: 121,
    brute: stockBrute(stockPrices),
    efficient: stockLowestSoFar(stockPrices),
  },
  {
    problemId: 125,
    brute: palindromeReverse("Top-spot!"),
    efficient: palindromeTwoPointers("Top-spot!"),
  },
  {
    problemId: 167,
    brute: allPairs(pairNumbers, 19),
    efficient: twoPointers(pairNumbers, 19),
  },
  {
    problemId: 209,
    brute: allSubarrays(windowNumbers, 7),
    efficient: slidingWindow(windowNumbers, 7),
  },
  {
    problemId: 424,
    brute: replaceBrute("AABABBA", 1),
    efficient: replaceWindow("AABABBA", 1),
  },
  {
    problemId: 438,
    brute: anagramsBrute("cbaebac", "abc"),
    efficient: anagramsWindow("cbaebac", "abc"),
  },
  {
    problemId: 567,
    brute: permutationBrute("abc", "eicbao"),
    efficient: permutationWindow("abc", "eicbao"),
  },
  {
    problemId: 643,
    brute: averageBrute(averageNumbers, 4),
    efficient: averageWindow(averageNumbers, 4),
  },
  {
    problemId: 713,
    brute: productBrute(productNumbers, 100),
    efficient: productWindow(productNumbers, 100),
  },
  {
    problemId: 1004,
    brute: onesBrute(onesNumbers, 1),
    efficient: onesWindow(onesNumbers, 1),
  },
];
