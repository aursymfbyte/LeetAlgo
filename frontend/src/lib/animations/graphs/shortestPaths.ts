import { Cell, Frame, row } from "../types";
import { fromOne, positions } from "./rows";

function differByOne(first: string, second: string) {
  let different = 0;
  for (let position = 0; position < first.length; position++) {
    if (first[position] !== second[position]) {
      different++;
    }
  }
  return different === 1;
}

export function ladderAllPaths(begin: string, end: string, words: string[]) {
  const frames: Frame[] = [];
  const path = [begin];
  let best: string[] = [];
  let linked = 0;

  frames.push({
    rows: [row("字典", words, { indexed: false }), row("接龍", path, { indexed: false })],
    message: `要從 ${begin} 每次改一個字母接到 ${end}，中間的字都要在字典裡。不記哪些字走過，只要這條接龍還沒用過就接接看，每種接法都試。`,
  });

  function extend() {
    const last = path[path.length - 1];
    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      if (path.includes(word)) {
        continue;
      }
      if (!differByOne(last, word)) {
        continue;
      }

      path.push(word);
      linked++;
      let result = `接龍現在有 ${path.length} 個單字，再往下接，沒得接就退回去。`;
      if (word === end) {
        if (best.length === 0 || path.length < best.length) {
          best = [...path];
        }
        result = `接到目標了，這條有 ${path.length} 個單字，目前最短是 ${best.length}。退回去試別的接法。`;
      }
      frames.push({
        rows: [
          row("字典", words, { pointers: { 目前: index }, indexed: false }),
          row("接龍", path, { indexed: false }),
        ],
        message: `${last} 改一個字母可以變成 ${word}，接上去。${result}`,
      });

      if (word !== end) {
        extend();
      }
      path.pop();
    }
  }

  extend();

  let verdict = `最短的接龍有 ${best.length} 個單字，答案是 ${best.length}`;
  if (best.length === 0) {
    verdict = "沒有任何接法能接到目標，答案是 0";
  }
  frames.push({
    rows: [
      row("字典", words, { indexed: false }),
      row("接龍", best, { answer: positions(0, best.length - 1), indexed: false }),
    ],
    message: `每種接法都試過了，${verdict}。同一個字在不同的接法裡被重複走到，一共接了 ${linked} 次單字。`,
  });
  return frames;
}

export function ladderBfs(begin: string, end: string, words: string[]) {
  const frames: Frame[] = [];
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const unvisited = new Set(words);
  unvisited.delete(begin);
  const queue = [begin];
  let wordCount = 1;
  let linked = 0;

  frames.push({
    rows: [row("還沒走過", [...unvisited], { indexed: false }), row("佇列", queue, { indexed: false })],
    message: "一層一層往外找：佇列放這一層的單字，「還沒走過」是字典裡還沒用到的字。字一被接到就從集合移掉，之後不會再走第二次。",
  });

  while (queue.length > 0) {
    wordCount++;
    const size = queue.length;

    for (let count = 0; count < size; count++) {
      const word = queue[0];
      queue.shift();
      const found: string[] = [];

      for (let position = 0; position < word.length; position++) {
        for (const letter of letters) {
          const next = word.slice(0, position) + letter + word.slice(position + 1);
          if (!unvisited.has(next)) {
            continue;
          }
          linked++;

          if (next === end) {
            const left = [...unvisited];
            frames.push({
              rows: [
                row("還沒走過", left, { answer: [left.indexOf(end)], indexed: false }),
                row("佇列", queue, { indexed: false }),
              ],
              message: `拿出 ${word}，它是第 ${wordCount - 1} 個單字，換一個字母就是目標 ${end}，所以答案是 ${wordCount}。走過的字不再進佇列，一共只接了 ${linked} 次單字。`,
            });
            return frames;
          }

          unvisited.delete(next);
          queue.push(next);
          found.push(next);
        }
      }

      let result = "換出來的字都不在「還沒走過」裡，沒有新的字。";
      if (found.length > 0) {
        result = `換出來還沒走過的有 ${found.join("、")}，從集合移掉、放進佇列。`;
      }
      frames.push({
        rows: [
          row("還沒走過", [...unvisited], { indexed: false }),
          row("佇列", queue, { answer: positions(queue.length - found.length, queue.length - 1), indexed: false }),
        ],
        message: `拿出 ${word}，它是第 ${wordCount - 1} 個單字。每個位置換成 a 到 z，${result}`,
      });
    }
  }

  frames.push({
    rows: [row("還沒走過", [...unvisited], { indexed: false }), row("佇列", queue, { indexed: false })],
    message: `佇列空了還是接不到 ${end}，答案是 0。走過的字不再進佇列，一共只接了 ${linked} 次單字。`,
  });
  return frames;
}

function timeCells(distance: number[]) {
  const cells: Cell[] = ["－"];
  for (let node = 1; node < distance.length; node++) {
    if (distance[node] === Infinity) {
      cells.push("∞");
    } else {
      cells.push(distance[node]);
    }
  }
  return cells;
}

export function delayRescan(times: number[][], n: number, k: number) {
  const frames: Frame[] = [];
  const edgeCells = times.map(([source, target, time]) => `${source}→${target}:${time}`);
  const distance: number[] = new Array(n + 1).fill(Infinity);
  distance[k] = 0;
  let looked = 0;
  let round = 0;
  let changed = true;

  frames.push({
    rows: [row("邊", edgeCells, { indexed: false }), row("距離", timeCells(distance), { pointers: { 起點: k } })],
    message: `「${edgeCells[0]}」代表訊號從節點 ${times[0][0]} 傳到 ${times[0][1]} 要 ${times[0][2]} 單位時間。從節點 ${k} 出發，距離先填 0，其他填 ∞。每一輪把所有的邊重掃，能更早到就更新。`,
  });

  while (changed) {
    changed = false;
    round++;

    for (let index = 0; index < times.length; index++) {
      const [source, target, time] = times[index];
      looked++;
      const arrive = distance[source] + time;
      if (arrive < distance[target]) {
        const old = timeCells(distance)[target];
        distance[target] = arrive;
        changed = true;
        frames.push({
          rows: [
            row("邊", edgeCells, { pointers: { 目前: index }, indexed: false }),
            row("距離", timeCells(distance), { answer: [target] }),
          ],
          message: `第 ${round} 輪，邊 ${source}→${target}：節點 ${source} 的 ${distance[source]} 加上 ${time} 是 ${arrive}，比節點 ${target} 現在的 ${old} 早，更新成 ${arrive}。`,
        });
      }
    }

    let ending = "這一輪沒有任何距離變短，可以停了。";
    if (changed) {
      ending = "這一輪有距離變短，別的節點可能跟著變短，要從頭再掃一輪。";
    }
    frames.push({
      rows: [row("邊", edgeCells, { indexed: false }), row("距離", timeCells(distance))],
      message: `第 ${round} 輪把 ${times.length} 條邊都看完了。${ending}`,
    });
  }

  const latest = Math.max(...distance.slice(1));
  frames.push({
    rows: [
      row("邊", edgeCells, { indexed: false }),
      row("距離", timeCells(distance), { answer: [distance.indexOf(latest)] }),
    ],
    message: `最晚收到訊號的節點要等 ${latest}，答案是 ${latest}。每一輪都把 ${times.length} 條邊重看一遍，一共看了 ${looked} 次。`,
  });
  return frames;
}

export function delayDijkstra(times: number[][], n: number, k: number) {
  const frames: Frame[] = [];
  const edgeCells = times.map(([source, target, time]) => `${source}→${target}:${time}`);
  const graph: number[][] = [];
  for (let node = 0; node <= n; node++) {
    graph.push(new Array(n + 1).fill(Infinity));
  }
  for (const [source, target, time] of times) {
    graph[source][target] = time;
  }
  const distance: number[] = new Array(n + 1).fill(Infinity);
  distance[k] = 0;
  const done: string[] = new Array(n + 1).fill("否");
  let looked = 0;

  frames.push({
    rows: [
      row("邊", edgeCells, { indexed: false }),
      row("距離", timeCells(distance), { pointers: { 起點: k } }),
      row("確定", fromOne(done)),
    ],
    message: "邊先存進矩陣，查「從誰到誰要多久」只要一步。每一輪從還沒確定的節點裡挑距離最小的，它的距離不會再變短，確定下來，再用它更新別人。",
  });

  for (let round = 1; round <= n; round++) {
    let closest = 0;
    for (let node = 1; node <= n; node++) {
      looked++;
      if (done[node] === "否" && (closest === 0 || distance[node] < distance[closest])) {
        closest = node;
      }
    }
    done[closest] = "是";

    const notes: string[] = [];
    const updated: number[] = [];
    for (let neighbor = 1; neighbor <= n; neighbor++) {
      looked++;
      const arrive = distance[closest] + graph[closest][neighbor];
      if (arrive < distance[neighbor]) {
        distance[neighbor] = arrive;
        notes.push(`節點 ${neighbor} 變成 ${arrive}`);
        updated.push(neighbor);
      }
    }

    const used: number[] = [];
    for (let index = 0; index < times.length; index++) {
      if (times[index][0] === closest) {
        used.push(index);
      }
    }
    let detail = "沒有節點變短。";
    if (notes.length > 0) {
      detail = `${notes.join("、")}。`;
    }
    frames.push({
      rows: [
        row("邊", edgeCells, { answer: used, indexed: false }),
        row("距離", timeCells(distance), { pointers: { 最近: closest }, answer: updated }),
        row("確定", fromOne(done), { pointers: { 最近: closest } }),
      ],
      message: `第 ${round} 輪：還沒確定的節點裡，節點 ${closest} 的距離 ${distance[closest]} 最小，確定下來。用它出發的邊更新距離：${detail}`,
    });
  }

  const latest = Math.max(...distance.slice(1));
  frames.push({
    rows: [
      row("邊", edgeCells, { indexed: false }),
      row("距離", timeCells(distance), { answer: [distance.indexOf(latest)] }),
      row("確定", fromOne(done)),
    ],
    message: `${n} 個節點都確定了，最晚收到訊號的節點要等 ${latest}，答案是 ${latest}。每輪挑一次最近的節點、更新一次距離，各看 ${n} 格，一共只看了 ${looked} 次。`,
  });
  return frames;
}
