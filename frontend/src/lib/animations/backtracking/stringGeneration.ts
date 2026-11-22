import { Frame, row } from "../types";
import { orEmpty, positions } from "./rows";

const phoneLetters = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];

function keyCells(digits: string) {
  const cells: string[] = [];
  for (const digit of digits) {
    const letters = phoneLetters[Number(digit)];
    cells.push(`${digit}→${letters}`);
  }
  return cells;
}

export function lettersByRound(digits: string) {
  const frames: Frame[] = [];
  const keys = keyCells(digits);
  let oldList: string[] = [];
  let newList = [""];
  let added = 0;

  frames.push({
    rows: [
      row("數字", keys),
      row("舊清單", oldList, { indexed: false }),
      row("新清單", newList.map(orEmpty), { indexed: false }),
    ],
    message: "一次處理一個數字：把清單裡的每個字串拿出來，後面各接上這個數字的每個字母。一開始清單裡只有一個空字串。",
  });

  for (let index = 0; index < digits.length; index++) {
    const letters = phoneLetters[Number(digits[index])];
    oldList = newList;
    newList = [];

    for (let source = 0; source < oldList.length; source++) {
      for (const letter of letters) {
        const made = oldList[source] + letter;
        newList.push(made);
        added++;
        frames.push({
          rows: [
            row("數字", keys, { pointers: { 目前: index } }),
            row("舊清單", oldList.map(orEmpty), { pointers: { 來源: source }, indexed: false }),
            row("新清單", newList, { indexed: false }),
          ],
          message: `數字 ${digits[index]} 對應 ${letters}：把舊清單的 ${orEmpty(oldList[source])} 後面接上 ${letter}，得到 ${made}，放進新清單。`,
        });
      }
    }
  }

  frames.push({
    rows: [
      row("數字", keys),
      row("舊清單", oldList.map(orEmpty), { indexed: false }),
      row("新清單", newList, { indexed: false, answer: positions(0, newList.length - 1) }),
    ],
    message: `最後的新清單就是答案，一共 ${newList.length} 種組合。每接一個字母就多出一個新字串，一共接了 ${added} 次字母。`,
  });
  return frames;
}

export function lettersBacktrack(digits: string) {
  const frames: Frame[] = [];
  const keys = keyCells(digits);
  const size = digits.length;
  const path: string[] = Array(size).fill("");
  const answers: string[] = [];
  let filled = 0;

  function fill(index: number, action: string) {
    if (index === size) {
      const text = path.join("");
      answers.push(text);
      frames.push({
        rows: [row("數字", keys), row("路徑", path), row("答案", answers, { indexed: false })],
        message: `${action}每一格都填好了，把 ${text} 記進答案。`,
      });
      return;
    }

    frames.push({
      rows: [
        row("數字", keys, { pointers: { 目前: index } }),
        row("路徑", path, { pointers: { 目前: index }, rangeEnd: index - 1 }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${action}接著替數字 ${digits[index]} 填路徑的位置 ${index}。`,
    });

    for (const letter of phoneLetters[Number(digits[index])]) {
      path[index] = letter;
      filled++;
      fill(index + 1, `位置 ${index} 填 ${letter}。`);
    }
  }

  fill(0, "路徑的每一格代表一個數字選的字母，一格一格試。新字母直接蓋掉舊的，不用另外清掉；灰色的格子還沒輪到。");
  frames.push({
    rows: [
      row("數字", keys),
      row("路徑", path, { rangeEnd: -1 }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `一共 ${answers.length} 種組合。只用一條路徑反覆覆蓋，不用複製字串，一共填了 ${filled} 次字母，次數和一輪一輪接的寫法一樣。`,
  });
  return frames;
}

export function parenthesesBrute(pairs: number) {
  const frames: Frame[] = [];
  const size = pairs * 2;
  const path: string[] = Array(size).fill("");
  const answers: string[] = [];
  let filled = 0;
  let listed = 0;

  function fill(position: number) {
    if (position === size) {
      const text = path.join("");
      listed++;

      let balance = 0;
      let broken = -1;
      for (let index = 0; index < size; index++) {
        if (path[index] === "(") {
          balance++;
        } else {
          balance--;
        }
        if (balance < 0) {
          broken = index;
          break;
        }
      }

      let pointers: Record<string, number> = {};
      let result = "";
      if (broken >= 0) {
        pointers = { 目前: broken };
        result = `讀到位置 ${broken} 時，右括號比左括號多，不合法，丟掉。`;
      } else if (balance > 0) {
        result = `讀完還有 ${balance} 個左括號沒配到右括號，不合法，丟掉。`;
      } else {
        answers.push(text);
        result = "每個右括號都配得到前面的左括號，合法，記進答案。";
      }

      frames.push({
        rows: [row("字串", path, { pointers }), row("答案", answers, { indexed: false })],
        message: `每一格都試左、右兩種括號，列出第 ${listed} 個字串 ${text}：${result}`,
      });
      return;
    }

    for (const mark of ["(", ")"]) {
      path[position] = mark;
      filled++;
      fill(position + 1);
    }
  }

  fill(0);
  frames.push({
    rows: [
      row("字串", path, { rangeEnd: -1 }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `合法的有 ${answers.length} 個。${size} 格每格都有兩種填法，一共填了 ${filled} 次括號，列出 ${listed} 個字串才挑出來。`,
  });
  return frames;
}

export function parenthesesBacktrack(pairs: number) {
  const frames: Frame[] = [];
  const path: string[] = Array(pairs * 2).fill("");
  const answers: string[] = [];
  let filled = 0;

  function fill(open: number, close: number, action: string) {
    const position = open + close;
    if (close === pairs) {
      const text = path.join("");
      answers.push(text);
      frames.push({
        rows: [row("字串", path), row("答案", answers, { indexed: false })],
        message: `${action}${pairs} 個右括號都放完了，${text} 一定合法，記進答案。`,
      });
      return;
    }

    let choices = "左括號還沒用完、右括號也比左括號少，兩種都能放，先試左括號。";
    if (close === open) {
      choices = "右括號沒有比左括號少，再放右括號會不合法，只能放左括號。";
    }
    if (open === pairs) {
      choices = "左括號用完了，只能放右括號。";
    }
    frames.push({
      rows: [
        row("字串", path, { pointers: { 目前: position }, rangeEnd: position - 1 }),
        row("答案", answers, { indexed: false }),
      ],
      message: `${action}現在左括號 ${open} 個、右括號 ${close} 個。${choices}`,
    });

    if (open < pairs) {
      path[position] = "(";
      filled++;
      fill(open + 1, close, `位置 ${position} 放左括號。`);
    }
    if (close < open) {
      let turn = `位置 ${position} 放右括號。`;
      if (open < pairs) {
        turn = `放左括號的路走完了，退回來，位置 ${position} 改放右括號。`;
      }
      path[position] = ")";
      filled++;
      fill(open, close + 1, turn);
    }
  }

  fill(0, 0, "邊填邊守規則，填出來的一定合法，不用事後檢查。灰色的格子還沒輪到，舊內容會被蓋掉。");
  frames.push({
    rows: [
      row("字串", path, { rangeEnd: -1 }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `合法的有 ${answers.length} 個。只往合法的方向填，每一條路都通到答案，一共只填了 ${filled} 次括號。`,
  });
  return frames;
}

function isPalindrome(text: string, left: number, right: number) {
  while (left < right) {
    if (text[left] !== text[right]) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}

export function partitionBrute(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const lastIndex = text.length - 1;
  const path: string[] = [];
  const answers: string[] = [];
  let cuts = 0;
  let listed = 0;

  frames.push({
    rows: [row("字串", letters), row("路徑", path, { indexed: false }), row("答案", answers, { indexed: false })],
    message: "要把字串切成幾段，每一段都要是回文。暴力解不管是不是回文先切再說，整個字串切完才一段一段檢查。",
  });

  function cut(start: number) {
    for (let end = start; end <= lastIndex; end++) {
      const part = text.slice(start, end + 1);
      path.push(part);
      cuts++;

      let result = "剩下的繼續切。";
      if (end === lastIndex) {
        listed++;
        let bad = "";
        for (const piece of path) {
          if (!isPalindrome(piece, 0, piece.length - 1)) {
            bad = piece;
            break;
          }
        }
        if (bad === "") {
          answers.push(path.join("|"));
          result = "整個字串切完了，這時才檢查：每一段都是回文，記進答案。";
        } else {
          result = `整個字串切完了，這時才檢查：${bad} 不是回文，這種切法作廢。`;
        }
      }
      frames.push({
        rows: [
          row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end }),
          row("路徑", path, { indexed: false }),
          row("答案", answers, { indexed: false }),
        ],
        message: `不管是不是回文，先切下 ${part}。${result}`,
      });

      if (end < lastIndex) {
        cut(end + 1);
      }
      path.pop();
    }
  }

  cut(0);
  frames.push({
    rows: [
      row("字串", letters),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `每一段都是回文的切法有 ${answers.length} 種。${listed} 種切法全部切完才檢查，一共切下了 ${cuts} 段。`,
  });
  return frames;
}

export function partitionBacktrack(text: string) {
  const frames: Frame[] = [];
  const letters = [...text];
  const size = text.length;
  const path: string[] = [];
  const answers: string[] = [];
  let cuts = 0;

  frames.push({
    rows: [row("字串", letters), row("路徑", path, { indexed: false }), row("答案", answers, { indexed: false })],
    message: "要把字串切成幾段，每一段都要是回文。切之前先檢查這一段是不是回文，不是就不切，也不用往下走。",
  });

  function cut(start: number) {
    if (start === size) {
      answers.push(path.join("|"));
      frames.push({
        rows: [row("字串", letters), row("路徑", path, { indexed: false }), row("答案", answers, { indexed: false })],
        message: `切到字串結尾了，路徑裡每一段都是回文，把 ${path.join("|")} 記進答案。`,
      });
      return;
    }

    for (let end = start; end < size; end++) {
      const part = text.slice(start, end + 1);
      if (isPalindrome(text, start, end)) {
        path.push(part);
        cuts++;
        frames.push({
          rows: [
            row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `從位置 ${start} 切到位置 ${end}：${part} 是回文，可以切，放進路徑。`,
        });
        cut(end + 1);
        path.pop();
      } else {
        frames.push({
          rows: [
            row("字串", letters, { pointers: { 起點: start, 終點: end }, rangeStart: start, rangeEnd: end }),
            row("路徑", path, { indexed: false }),
            row("答案", answers, { indexed: false }),
          ],
          message: `從位置 ${start} 切到位置 ${end}：${part} 不是回文，不切，這個方向不用往下走。`,
        });
      }
    }
  }

  cut(0);
  frames.push({
    rows: [
      row("字串", letters),
      row("路徑", path, { indexed: false }),
      row("答案", answers, { indexed: false, answer: positions(0, answers.length - 1) }),
    ],
    message: `每一段都是回文的切法有 ${answers.length} 種。切之前先檢查，不是回文就不往下切，一共只切下了 ${cuts} 段。`,
  });
  return frames;
}
