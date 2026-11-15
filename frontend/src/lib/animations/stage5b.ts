import { Cell, Frame, ProblemAnimation, row } from "./types";

function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
}

function listCells(lists: number[][]) {
  const cells: string[] = [];
  for (const list of lists) {
    if (list.length === 0) {
      cells.push("無");
    } else {
      cells.push(list.join(","));
    }
  }
  return cells;
}

function fromOne(values: Cell[]) {
  const cells = [...values];
  cells[0] = "－";
  return cells;
}

function differByOne(first: string, second: string) {
  let different = 0;
  for (let position = 0; position < first.length; position++) {
    if (first[position] !== second[position]) {
      different++;
    }
  }
  return different === 1;
}

function ladderAllPaths(begin: string, end: string, words: string[]) {
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

function ladderBfs(begin: string, end: string, words: string[]) {
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

function copyCells(size: number, nodes: number[], copies: number[][]) {
  const cells: string[] = ["－"];
  for (let node = 1; node <= size; node++) {
    cells.push("？");
  }
  const texts = listCells(copies);
  for (let index = 0; index < nodes.length; index++) {
    cells[nodes[index]] = texts[index];
  }
  return cells;
}

function pairCells(nodes: number[]) {
  return nodes.map((node) => `${node}→新${node}`);
}

function cloneLead(node: number, from: number, current: number) {
  if (from === 0) {
    return `從節點 ${node} 開始：`;
  }
  if (from !== current) {
    return `退回節點 ${from}，它的鄰居 ${node}：`;
  }
  return `節點 ${from} 的鄰居 ${node}：`;
}

function cloneList(graph: number[][]) {
  const frames: Frame[] = [];
  const size = graph.length - 1;
  const neighborCells = fromOne(listCells(graph));
  const list: number[] = [];
  const copies: number[][] = [];
  let current = 0;
  let lookups = 0;
  let compared = 0;

  frames.push({
    rows: [
      row("鄰居", neighborCells),
      row("複本", copyCells(size, list, copies)),
      row("清單", [], { indexed: false }),
    ],
    message: "「鄰居」是原圖，「複本」是新圖每個節點目前接好的鄰居，？代表還沒建立。複製過的節點記在清單裡，要查就從清單開頭一個一個比。",
  });

  function clone(node: number, from: number, fromCopy: number[]) {
    const lead = cloneLead(node, from, current);
    lookups++;

    for (let index = 0; index < list.length; index++) {
      compared++;
      if (list[index] === node) {
        fromCopy.push(node);
        frames.push({
          rows: [
            row("鄰居", neighborCells, { pointers: { 目前: node } }),
            row("複本", copyCells(size, list, copies), { answer: [from] }),
            row("清單", pairCells(list), { pointers: { 目前: index }, rangeEnd: index, indexed: false }),
          ],
          message: `${lead}清單第 ${index + 1} 個就是它，已經複製過，直接把新 ${node} 接到新 ${from} 的鄰居後面。`,
        });
        current = from;
        return;
      }
      frames.push({
        rows: [
          row("鄰居", neighborCells, { pointers: { 目前: node } }),
          row("複本", copyCells(size, list, copies)),
          row("清單", pairCells(list), { pointers: { 目前: index }, rangeEnd: index, indexed: false }),
        ],
        message: `${lead}從清單開頭一個一個比，第 ${index + 1} 個是 ${list[index]}，不是 ${node}，看下一個。`,
      });
    }

    let searched = `清單裡的 ${list.length} 個都比過了，沒有它`;
    if (list.length === 0) {
      searched = "清單還是空的";
    }
    const copy: number[] = [];
    list.push(node);
    copies.push(copy);
    frames.push({
      rows: [
        row("鄰居", neighborCells, { pointers: { 目前: node } }),
        row("複本", copyCells(size, list, copies), { answer: [node] }),
        row("清單", pairCells(list), { answer: [list.length - 1], indexed: false }),
      ],
      message: `${lead}${searched}，還沒複製。建立新 ${node}，記到清單最後面，再去複製它的鄰居。`,
    });
    current = node;

    for (const neighbor of graph[node]) {
      clone(neighbor, node, copy);
    }
    fromCopy.push(node);
  }

  clone(1, 0, []);

  frames.push({
    rows: [
      row("鄰居", neighborCells),
      row("複本", copyCells(size, list, copies), { answer: positions(1, size) }),
      row("清單", pairCells(list), { indexed: false }),
    ],
    message: `每個節點都複製好了，複本的鄰居和原圖一模一樣。同樣是查 ${lookups} 次，每次都從清單開頭一個一個比，一共比對了 ${compared} 次。`,
  });
  return frames;
}

function cloneHashMap(graph: number[][]) {
  const frames: Frame[] = [];
  const size = graph.length - 1;
  const neighborCells = fromOne(listCells(graph));
  const copies = new Map<number, number[]>();
  let current = 0;
  let lookups = 0;

  frames.push({
    rows: [
      row("鄰居", neighborCells),
      row("複本", copyCells(size, [], [])),
      row("雜湊表", [], { indexed: false }),
    ],
    message: "「鄰居」是原圖，「複本」是新圖每個節點目前接好的鄰居，？代表還沒建立。複製過的節點記在雜湊表裡，用節點一查就知道複本是誰。",
  });

  function clone(node: number, from: number, fromCopy: number[]) {
    const lead = cloneLead(node, from, current);
    lookups++;

    if (copies.has(node)) {
      fromCopy.push(node);
      const nodes = [...copies.keys()];
      frames.push({
        rows: [
          row("鄰居", neighborCells, { pointers: { 目前: node } }),
          row("複本", copyCells(size, nodes, [...copies.values()]), { answer: [from] }),
          row("雜湊表", pairCells(nodes), { answer: [nodes.indexOf(node)], indexed: false }),
        ],
        message: `${lead}雜湊表一查就有 ${node}→新${node}，已經複製過，直接把新 ${node} 接到新 ${from} 的鄰居後面。`,
      });
      current = from;
      return;
    }

    const copy: number[] = [];
    copies.set(node, copy);
    const nodes = [...copies.keys()];
    frames.push({
      rows: [
        row("鄰居", neighborCells, { pointers: { 目前: node } }),
        row("複本", copyCells(size, nodes, [...copies.values()]), { answer: [node] }),
        row("雜湊表", pairCells(nodes), { answer: [nodes.length - 1], indexed: false }),
      ],
      message: `${lead}雜湊表裡沒有 ${node}，還沒複製。建立新 ${node}，先記進雜湊表，再去複製它的鄰居。`,
    });
    current = node;

    for (const neighbor of graph[node]) {
      clone(neighbor, node, copy);
    }
    fromCopy.push(node);
  }

  clone(1, 0, []);

  const nodes = [...copies.keys()];
  frames.push({
    rows: [
      row("鄰居", neighborCells),
      row("複本", copyCells(size, nodes, [...copies.values()]), { answer: positions(1, size) }),
      row("雜湊表", pairCells(nodes), { indexed: false }),
    ],
    message: `每個節點都複製好了，複本的鄰居和原圖一模一樣。每次查雜湊表都是一步到位，一共只查了 ${lookups} 次。`,
  });
  return frames;
}

function rescanCourses(total: number, conditions: number[][]) {
  const frames: Frame[] = [];
  const conditionCells = conditions.map(([course, before]) => `${before}→${course}`);
  const state: string[] = new Array(total).fill("未修");
  const order: number[] = [];
  let looked = 0;
  let round = 0;
  let changed = true;

  const [firstCourse, firstBefore] = conditions[0];
  frames.push({
    rows: [
      row("先修條件", conditionCells, { indexed: false }),
      row("狀態", state),
      row("修完順序", order, { indexed: false }),
    ],
    message: `「${conditionCells[0]}」代表先修完課程 ${firstBefore} 才能修課程 ${firstCourse}。不另外建表，每一輪把還沒修的課一門一門拿出來，把所有先修條件掃一遍，看它能不能修。`,
  });

  while (changed) {
    changed = false;
    round++;

    for (let course = 0; course < total; course++) {
      if (state[course] === "修完") {
        continue;
      }

      const mine: number[] = [];
      const waiting: number[] = [];
      for (let index = 0; index < conditions.length; index++) {
        const [target, before] = conditions[index];
        looked++;
        if (target !== course) {
          continue;
        }
        mine.push(index);
        if (state[before] === "未修") {
          waiting.push(before);
        }
      }

      let result = `要先修的課程 ${waiting.join("、")} 還沒修完，這一輪不能修。`;
      if (waiting.length === 0) {
        state[course] = "修完";
        order.push(course);
        changed = true;
        result = "它沒有還沒修完的先修課，可以修，標成修完。";
      }
      frames.push({
        rows: [
          row("先修條件", conditionCells, { answer: mine, indexed: false }),
          row("狀態", state, { pointers: { 目前: course } }),
          row("修完順序", order, { indexed: false }),
        ],
        message: `第 ${round} 輪，課程 ${course}：把 ${conditions.length} 條先修條件掃一遍，${result}`,
      });
    }
  }

  let answer: number[] = [];
  if (order.length === total) {
    answer = positions(0, total - 1);
  }
  const rows = [
    row("先修條件", conditionCells, { indexed: false }),
    row("狀態", state),
    row("修完順序", order, { answer, indexed: false }),
  ];
  return { frames, rows, order, looked };
}

function kahnCourses(total: number, conditions: number[][]) {
  const frames: Frame[] = [];
  const nextCourses: number[][] = [];
  const inDegree: number[] = [];
  for (let course = 0; course < total; course++) {
    nextCourses.push([]);
    inDegree.push(0);
  }
  let looked = 0;
  for (const [course, before] of conditions) {
    nextCourses[before].push(course);
    inDegree[course]++;
    looked++;
  }
  const nextCells = listCells(nextCourses);
  const queue: number[] = [];
  const order: number[] = [];

  frames.push({
    rows: [
      row("後續課程", nextCells),
      row("入度", inDegree),
      row("佇列", queue, { indexed: false }),
      row("修完順序", order, { indexed: false }),
    ],
    message: `先建兩張表：「後續課程」是修完這門課才能修的課，「入度」是這門課還有幾門先修課沒修完。每條先修條件看一次，共 ${looked} 次。`,
  });

  for (let course = 0; course < total; course++) {
    if (inDegree[course] === 0) {
      queue.push(course);
    }
  }
  frames.push({
    rows: [
      row("後續課程", nextCells),
      row("入度", inDegree),
      row("佇列", queue, { indexed: false }),
      row("修完順序", order, { indexed: false }),
    ],
    message: `入度是 0 的課沒有先修課要等，先放進佇列：課程 ${queue.join("、")}。之後每修完一門課，就把它的後續課程入度減一。`,
  });

  while (queue.length > 0) {
    const course = queue[0];
    queue.shift();
    order.push(course);

    const notes: string[] = [];
    for (const next of nextCourses[course]) {
      inDegree[next]--;
      looked++;
      if (inDegree[next] === 0) {
        queue.push(next);
        notes.push(`課程 ${next} 的入度減成 0，放進佇列`);
      } else {
        notes.push(`課程 ${next} 的入度減成 ${inDegree[next]}，還要等`);
      }
    }

    let detail = "它沒有後續課程。";
    if (notes.length > 0) {
      detail = `後續的${notes.join("；")}。`;
    }
    frames.push({
      rows: [
        row("後續課程", nextCells, { pointers: { 目前: course } }),
        row("入度", inDegree, { answer: nextCourses[course] }),
        row("佇列", queue, { indexed: false }),
        row("修完順序", order, { indexed: false }),
      ],
      message: `從佇列拿出課程 ${course}，修完。${detail}`,
    });
  }

  let answer: number[] = [];
  if (order.length === total) {
    answer = positions(0, total - 1);
  }
  const rows = [
    row("後續課程", nextCells),
    row("入度", inDegree),
    row("佇列", queue, { indexed: false }),
    row("修完順序", order, { answer, indexed: false }),
  ];
  return { frames, rows, order, looked };
}

function canFinishBrute(total: number, conditions: number[][]) {
  const run = rescanCourses(total, conditions);
  const left = total - run.order.length;

  let verdict = `${total} 門課都修完了，答案是 true`;
  if (left > 0) {
    verdict = `再掃一輪也沒有課能修了，還有 ${left} 門課修不了，答案是 false`;
  }
  run.frames.push({
    rows: run.rows,
    message: `${verdict}。每一輪都把先修條件重掃，一共看了 ${run.looked} 次先修條件。`,
  });
  return run.frames;
}

function canFinishKahn(total: number, conditions: number[][]) {
  const run = kahnCourses(total, conditions);
  const left = total - run.order.length;

  let verdict = `${total} 門課都修完了，答案是 true`;
  if (left > 0) {
    verdict = `只修完 ${run.order.length} 門，剩下 ${left} 門的入度一直不是 0，代表它們互相等對方，答案是 false`;
  }
  run.frames.push({
    rows: run.rows,
    message: `佇列空了，${verdict}。建表和減入度時各看一次，一共只看了 ${run.looked} 次先修條件。`,
  });
  return run.frames;
}

function findOrderBrute(total: number, conditions: number[][]) {
  const run = rescanCourses(total, conditions);

  let verdict = `${total} 門課都修完了，修課順序是 ${run.order.join("、")}`;
  if (run.order.length < total) {
    verdict = "再掃一輪也沒有課能修了，有課修不了，回傳空陣列";
  }
  run.frames.push({
    rows: run.rows,
    message: `${verdict}。每一輪都把先修條件重掃，一共看了 ${run.looked} 次先修條件。`,
  });
  return run.frames;
}

function findOrderKahn(total: number, conditions: number[][]) {
  const run = kahnCourses(total, conditions);

  let verdict = `${total} 門課都修完了，修課順序是 ${run.order.join("、")}`;
  if (run.order.length < total) {
    verdict = "還有課的入度一直不是 0，修不完，回傳空陣列";
  }
  run.frames.push({
    rows: run.rows,
    message: `佇列空了，${verdict}。建表和減入度時各看一次，一共只看了 ${run.looked} 次先修條件。`,
  });
  return run.frames;
}

function linkLists(matrix: number[][]) {
  const lists: number[][] = [];
  for (let city = 0; city < matrix.length; city++) {
    const list: number[] = [];
    for (let other = 0; other < matrix.length; other++) {
      if (other !== city && matrix[city][other] === 1) {
        list.push(other);
      }
    }
    lists.push(list);
  }
  return lists;
}

function provincesRelabel(matrix: number[][]) {
  const frames: Frame[] = [];
  const n = matrix.length;
  const linkCells = listCells(linkLists(matrix));
  const labels = positions(0, n - 1);
  let looked = 0;
  let round = 0;
  let changed = true;

  frames.push({
    rows: [row("相連", linkCells), row("矩陣列", []), row("編號", labels)],
    message: "「相連」是每座城市直接連到誰。先給每座城市不同的編號，再一輪一輪把矩陣一列一列讀過，相連的兩座城市編號不同，就都改成比較小的。",
  });

  while (changed) {
    changed = false;
    round++;

    for (let city = 0; city < n; city++) {
      const notes: string[] = [];
      const updated: number[] = [];

      for (let other = 0; other < n; other++) {
        looked++;
        if (other === city) {
          continue;
        }
        if (matrix[city][other] === 0) {
          continue;
        }
        if (labels[city] === labels[other]) {
          notes.push(`城市 ${other} 的編號一樣是 ${labels[city]}`);
          continue;
        }

        const smaller = Math.min(labels[city], labels[other]);
        notes.push(`城市 ${other} 是 ${labels[other]}、自己是 ${labels[city]}，都改成 ${smaller}`);
        labels[city] = smaller;
        labels[other] = smaller;
        updated.push(city, other);
        changed = true;
      }

      let detail = "它只和自己相連，沒有要改的。";
      if (notes.length > 0) {
        detail = `${notes.join("；")}。`;
      }
      frames.push({
        rows: [
          row("相連", linkCells, { pointers: { 目前: city } }),
          row("矩陣列", matrix[city]),
          row("編號", labels, { pointers: { 目前: city }, answer: updated }),
        ],
        message: `第 ${round} 輪，讀城市 ${city} 那一列：${detail}`,
      });
    }
  }

  const kinds = new Set(labels).size;
  frames.push({
    rows: [row("相連", linkCells), row("矩陣列", []), row("編號", labels)],
    message: `第 ${round} 輪整輪都沒有改到編號，停下來。編號剩下 ${kinds} 種，所以有 ${kinds} 個省份。每一輪都把整個矩陣重讀，一共看了 ${looked} 格。`,
  });
  return frames;
}

function provincesDfs(matrix: number[][]) {
  const frames: Frame[] = [];
  const n = matrix.length;
  const links = linkLists(matrix);
  const linkCells = listCells(links);
  const visited: string[] = new Array(n).fill("否");
  let members: number[] = [];
  let provinces = 0;
  let looked = 0;

  frames.push({
    rows: [row("相連", linkCells), row("矩陣列", []), row("走過", visited)],
    message: "「相連」是每座城市直接連到誰。依序看每座城市，還沒走過就是新的省份，從它出發沿著相連的城市一路走進去，把整個省份都標成走過。",
  });

  function visit(city: number, lead: string) {
    visited[city] = "是";
    members.push(city);

    const fresh = links[city].filter((other) => visited[other] === "否");
    let detail = `相連的城市 ${links[city].join("、")} 都走過了，退回去。`;
    if (links[city].length === 0) {
      detail = "它只和自己相連，這個省份只有它。";
    }
    if (fresh.length > 0) {
      detail = `相連的城市 ${fresh[0]} 還沒走過，接著走進去。`;
    }
    frames.push({
      rows: [
        row("相連", linkCells, { pointers: { 目前: city } }),
        row("矩陣列", matrix[city]),
        row("走過", visited, { pointers: { 目前: city }, answer: [...members] }),
      ],
      message: `${lead}標成走過，讀它那一列 ${n} 格：${detail}`,
    });

    for (let other = 0; other < n; other++) {
      looked++;
      if (matrix[city][other] === 1 && visited[other] === "否") {
        visit(other, `從城市 ${city} 走進城市 ${other}，`);
      }
    }
  }

  for (let city = 0; city < n; city++) {
    if (visited[city] === "否") {
      provinces++;
      members = [];
      visit(city, `城市 ${city} 還沒走過，是第 ${provinces} 個省份。`);
    }
  }

  frames.push({
    rows: [row("相連", linkCells), row("矩陣列", []), row("走過", visited)],
    message: `每座城市都走過了，一共有 ${provinces} 個省份。每座城市只走進去一次，它那一列也只讀一次，一共只看了 ${looked} 格。`,
  });
  return frames;
}

function redundantSearch(edges: number[][]) {
  const frames: Frame[] = [];
  const n = edges.length;
  const edgeCells = edges.map(([a, b]) => `${a}-${b}`);
  const nobody: string[] = new Array(n + 1).fill("否");
  let looked = 0;

  frames.push({
    rows: [row("邊", edgeCells, { indexed: false }), row("走得到", fromOne(nobody))],
    message: "照順序一條一條加邊。每加一條之前，先從它的一端出發重新搜尋：把已經加入的邊一輪一輪重掃，看另一端是不是早就走得到。",
  });

  for (let index = 0; index < n; index++) {
    const [a, b] = edges[index];
    const reach = [...nobody];
    reach[a] = "是";
    let round = 0;
    let changed = true;

    while (changed) {
      changed = false;
      round++;
      const fresh: number[] = [];

      for (let added = 0; added < index; added++) {
        const [first, second] = edges[added];
        looked++;
        if (reach[first] === reach[second]) {
          continue;
        }
        let other = second;
        if (reach[first] === "否") {
          other = first;
        }
        reach[other] = "是";
        fresh.push(other);
        changed = true;
      }

      if (changed) {
        frames.push({
          rows: [
            row("邊", edgeCells, { pointers: { 目前: index }, rangeEnd: index, indexed: false }),
            row("走得到", fromOne(reach), { pointers: { 甲: a, 乙: b }, answer: fresh }),
          ],
          message: `加邊 ${a}-${b} 之前，從 ${a} 出發：第 ${round} 輪把已經加入的 ${index} 條邊掃一遍，新走到 ${fresh.join("、")}，可能還能走更遠，再掃一輪。`,
        });
      }
    }

    const rows = [
      row("邊", edgeCells, { pointers: { 目前: index }, rangeEnd: index, indexed: false }),
      row("走得到", fromOne(reach), { pointers: { 甲: a, 乙: b } }),
    ];
    const lead = `加邊 ${a}-${b} 之前，從 ${a} 出發：第 ${round} 輪把已經加入的 ${index} 條邊掃一遍，沒有新走到的節點。`;

    if (reach[b] === "是") {
      frames.push({
        rows,
        message: `${lead}${b} 早就走得到，兩端已經連通，再加這條邊會圍出環。`,
      });
      frames.push({
        rows: [
          row("邊", edgeCells, { rangeEnd: index, answer: [index], indexed: false }),
          row("走得到", fromOne(reach)),
        ],
        message: `多餘的邊是 ${a}-${b}，答案是 [${a},${b}]。每加一條邊就把整張圖重新搜尋一次，一共看了 ${looked} 次邊。`,
      });
      return frames;
    }

    frames.push({
      rows,
      message: `${lead}${b} 走不到，兩端還沒連通，可以加。`,
    });
  }
  return frames;
}

function climbText(path: number[]) {
  const node = path[0];
  const root = path[path.length - 1];
  if (path.length === 1) {
    return `${node} 自己就是老大`;
  }
  if (path.length === 2) {
    return `${node} 的老大是 ${root}`;
  }
  const between = path.slice(1, -1);
  return `${node} 往上經過 ${between.join("、")} 才到老大 ${root}，順手把路上的節點都直接接到 ${root}`;
}

function redundantUnionFind(edges: number[][]) {
  const frames: Frame[] = [];
  const n = edges.length;
  const edgeCells = edges.map(([a, b]) => `${a}-${b}`);
  const parent = positions(0, n);
  const size: number[] = new Array(n + 1).fill(1);
  let path: number[] = [];
  let looked = 0;

  frames.push({
    rows: [row("邊", edgeCells, { indexed: false }), row("老大", fromOne(parent)), row("大小", fromOne(size))],
    message: "「老大」記每個節點往上接到誰，接到自己的就是集合的老大。「大小」只看老大那一格，是它的集合有幾個節點。照順序一條一條加邊。",
  });

  function find(node: number): number {
    path.push(node);
    looked++;
    if (parent[node] !== node) {
      parent[node] = find(parent[node]);
    }
    return parent[node];
  }

  for (let index = 0; index < n; index++) {
    const [a, b] = edges[index];
    const before = [...parent];

    path = [];
    const rootA = find(a);
    const textA = climbText(path);
    path = [];
    const rootB = find(b);
    const textB = climbText(path);
    const lead = `加邊 ${a}-${b}：${textA}；${textB}。`;

    if (rootA === rootB) {
      frames.push({
        rows: [
          row("邊", edgeCells, { pointers: { 目前: index }, rangeEnd: index, indexed: false }),
          row("老大", fromOne(parent), { pointers: { 甲: a, 乙: b } }),
          row("大小", fromOne(size)),
        ],
        message: `${lead}老大一樣，兩端早就在同一個集合，再加這條邊會圍出環。`,
      });
      frames.push({
        rows: [
          row("邊", edgeCells, { rangeEnd: index, answer: [index], indexed: false }),
          row("老大", fromOne(parent)),
          row("大小", fromOne(size)),
        ],
        message: `多餘的邊是 ${a}-${b}，答案是 [${a},${b}]。不用重新搜尋，每條邊只要往上找兩次老大，一共只看了 ${looked} 次節點。`,
      });
      return frames;
    }

    let result = `老大不同，可以加：把 ${rootB} 的集合接到 ${rootA} 底下。`;
    if (size[rootA] < size[rootB]) {
      parent[rootA] = rootB;
      size[rootB] += size[rootA];
      result = `老大不同，可以加：${rootA} 的集合比較小，接到 ${rootB} 底下。`;
    } else {
      parent[rootB] = rootA;
      size[rootA] += size[rootB];
    }

    const moved: number[] = [];
    for (let node = 1; node <= n; node++) {
      if (parent[node] !== before[node]) {
        moved.push(node);
      }
    }
    frames.push({
      rows: [
        row("邊", edgeCells, { pointers: { 目前: index }, rangeEnd: index, indexed: false }),
        row("老大", fromOne(parent), { pointers: { 甲: a, 乙: b }, answer: moved }),
        row("大小", fromOne(size)),
      ],
      message: `${lead}${result}`,
    });
  }
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

function delayRescan(times: number[][], n: number, k: number) {
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

function delayDijkstra(times: number[][], n: number, k: number) {
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

function roomsVerdict(opened: string[]) {
  const total = opened.length;
  const locked = opened.filter((state) => state === "否").length;
  if (locked > 0) {
    return `還有 ${locked} 個房間進不去，答案是 false`;
  }
  return `${total} 個房間都進得去，答案是 true`;
}

function roomsRescan(rooms: number[][]) {
  const frames: Frame[] = [];
  const keyCells = listCells(rooms);
  const opened: string[] = rooms.map(() => "否");
  opened[0] = "是";
  let looked = 0;
  let round = 0;
  let changed = true;

  frames.push({
    rows: [row("鑰匙", keyCells), row("進得去", opened)],
    message: "「鑰匙」是每個房間裡放了哪些房間的鑰匙，一開始只有房間 0 進得去。每一輪把所有房間掃一遍，進得去的就把鑰匙拿出來試，鎖著的先跳過。",
  });

  while (changed) {
    changed = false;
    round++;

    for (let room = 0; room < rooms.length; room++) {
      if (opened[room] === "否") {
        continue;
      }

      const fresh: number[] = [];
      for (const key of rooms[room]) {
        looked++;
        if (opened[key] === "否") {
          opened[key] = "是";
          fresh.push(key);
          changed = true;
        }
      }

      let result = `把鑰匙 ${rooms[room].join("、")} 拿出來試，這些房間早就開了，沒有新進展。`;
      if (rooms[room].length === 0) {
        result = "裡面沒有鑰匙。";
      }
      if (fresh.length > 0) {
        result = `把鑰匙 ${rooms[room].join("、")} 拿出來試，房間 ${fresh.join("、")} 原本鎖著，現在打開了。`;
      }
      frames.push({
        rows: [
          row("鑰匙", keyCells, { pointers: { 目前: room } }),
          row("進得去", opened, { pointers: { 目前: room }, answer: fresh }),
        ],
        message: `第 ${round} 輪，房間 ${room} 進得去：${result}`,
      });
    }
  }

  frames.push({
    rows: [row("鑰匙", keyCells), row("進得去", opened)],
    message: `第 ${round} 輪沒有新的房間打開，停下來。${roomsVerdict(opened)}。每一輪都把拿過的鑰匙重看一遍，一共看了 ${looked} 把鑰匙。`,
  });
  return frames;
}

function roomsDfs(rooms: number[][]) {
  const frames: Frame[] = [];
  const keyCells = listCells(rooms);
  const visited: string[] = rooms.map(() => "否");
  let looked = 0;

  frames.push({
    rows: [row("鑰匙", keyCells), row("去過", visited)],
    message: "「鑰匙」是每個房間裡放了哪些房間的鑰匙。從房間 0 出發，拿到鑰匙就走進還沒去過的房間，去過的房間不再進去第二次。",
  });

  function visit(room: number, lead: string) {
    visited[room] = "是";

    let detail = "裡面沒有鑰匙，退回去。";
    if (rooms[room].length > 0) {
      detail = `裡面的鑰匙是 ${rooms[room].join("、")}，還沒去過的房間就接著進去。`;
    }
    frames.push({
      rows: [
        row("鑰匙", keyCells, { pointers: { 目前: room } }),
        row("去過", visited, { pointers: { 目前: room } }),
      ],
      message: `${lead}標成去過。${detail}`,
    });

    for (const key of rooms[room]) {
      looked++;
      if (visited[key] === "否") {
        visit(key, `用房間 ${room} 的鑰匙走進房間 ${key}，`);
      }
    }
  }

  visit(0, "房間 0 沒上鎖，直接走進去，");

  frames.push({
    rows: [row("鑰匙", keyCells), row("去過", visited)],
    message: `能去的房間都去過了，${roomsVerdict(visited)}。每個房間只進去一次，每把鑰匙只看一次，一共只看了 ${looked} 把鑰匙。`,
  });
  return frames;
}

function reorderRescan(total: number, roads: number[][]) {
  const frames: Frame[] = [];
  const roadCells = roads.map(([start, end]) => `${start}→${end}`);
  const reach: string[] = new Array(total).fill("否");
  reach[0] = "是";
  const reversed: number[] = [];
  let looked = 0;
  let round = 0;
  let changed = true;

  frames.push({
    rows: [row("路", roadCells, { indexed: false }), row("接通", reach)],
    message: "「接通」記每座城市是不是已經確定能開到城市 0，一開始只有 0 自己。每一輪把所有的路掃一遍，找只有一端接通的路，看它的方向要不要反轉。",
  });

  while (changed) {
    changed = false;
    round++;

    for (let index = 0; index < roads.length; index++) {
      const [start, end] = roads[index];
      looked++;

      let result = "兩端都還沒接通，先跳過。";
      if (reach[start] === "是" && reach[end] === "是") {
        result = "兩端都已經接通，不用再處理。";
      } else if (reach[end] === "是") {
        reach[start] = "是";
        changed = true;
        result = `城市 ${end} 已經接通，這條路正好開向 ${end}，不用反轉。城市 ${start} 也接通了。`;
      } else if (reach[start] === "是") {
        reach[end] = "是";
        reversed.push(index);
        changed = true;
        result = `城市 ${start} 已經接通，這條路卻是從 ${start} 開出去，要反轉，累計 ${reversed.length} 條。城市 ${end} 也接通了。`;
      }
      frames.push({
        rows: [
          row("路", roadCells, { pointers: { 目前: index }, answer: [...reversed], indexed: false }),
          row("接通", reach),
        ],
        message: `第 ${round} 輪，路 ${roadCells[index]}：${result}`,
      });
    }
  }

  frames.push({
    rows: [row("路", roadCells, { answer: reversed, indexed: false }), row("接通", reach)],
    message: `第 ${round} 輪整輪都沒有變化，停下來。最少要反轉 ${reversed.length} 條路。每一輪都把 ${roads.length} 條路重看，一共看了 ${looked} 次路。`,
  });
  return frames;
}

function reorderBfs(total: number, roads: number[][]) {
  const frames: Frame[] = [];
  const neighbors: number[][][] = [];
  for (let city = 0; city < total; city++) {
    neighbors.push([]);
  }
  let looked = 0;
  for (const [start, end] of roads) {
    neighbors[start].push([end, 1]);
    neighbors[end].push([start, 0]);
    looked++;
  }

  const neighborCells: string[] = [];
  for (const list of neighbors) {
    const texts: string[] = [];
    for (const [next, needsReverse] of list) {
      if (needsReverse === 1) {
        texts.push(`→${next}`);
      } else {
        texts.push(`←${next}`);
      }
    }
    neighborCells.push(texts.join(","));
  }

  const visited: string[] = new Array(total).fill("否");
  visited[0] = "是";
  const queue = [0];
  let changes = 0;

  frames.push({
    rows: [row("鄰居", neighborCells), row("走過", visited), row("佇列", queue, { indexed: false })],
    message: "每條路在兩端各記一筆：「→1」是原本從這裡開往 1，「←5」是原本從 5 開過來。從城市 0 往外走，走到「→」的路就是背向 0，要反轉。",
  });

  while (queue.length > 0) {
    const city = queue[0];
    queue.shift();

    const notes: string[] = [];
    const fresh: number[] = [];
    for (const [next, needsReverse] of neighbors[city]) {
      looked++;
      if (visited[next] === "是") {
        notes.push(`城市 ${next} 走過了，跳過`);
        continue;
      }
      visited[next] = "是";
      changes += needsReverse;
      queue.push(next);
      fresh.push(next);
      if (needsReverse === 1) {
        notes.push(`往城市 ${next}：原本的路是 ${city}→${next}，背向 0，要反轉，累計 ${changes} 條`);
      } else {
        notes.push(`往城市 ${next}：原本的路是 ${next}→${city}，朝向 0，不用反轉`);
      }
    }

    frames.push({
      rows: [
        row("鄰居", neighborCells, { pointers: { 目前: city } }),
        row("走過", visited, { pointers: { 目前: city }, answer: fresh }),
        row("佇列", queue, { indexed: false }),
      ],
      message: `從佇列拿出城市 ${city}。${notes.join("；")}。`,
    });
  }

  frames.push({
    rows: [row("鄰居", neighborCells), row("走過", visited), row("佇列", queue, { indexed: false })],
    message: `佇列空了，每座城市都走到了，最少要反轉 ${changes} 條路。建表時每條路看一次，往外走時兩端各看一次，一共只看了 ${looked} 次路。`,
  });
  return frames;
}

const ladderWords = ["hot", "dot", "dog", "lot", "log", "cog"];
const cloneNeighbors = [[], [2, 4], [1, 3], [2, 4], [1, 3]];
const cycleCourses = [
  [1, 2],
  [0, 1],
  [3, 1],
  [3, 5],
  [4, 3],
  [5, 4],
];
const orderCourses = [
  [0, 3],
  [1, 3],
  [2, 0],
  [2, 1],
  [4, 2],
  [3, 5],
];
const cityLinks = [
  [1, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 0, 0],
  [0, 0, 1, 0, 0, 1],
  [0, 1, 0, 1, 1, 0],
  [1, 0, 0, 1, 1, 0],
  [0, 0, 1, 0, 0, 1],
];
const treeEdges = [
  [1, 2],
  [3, 4],
  [2, 3],
  [4, 5],
  [5, 6],
  [2, 6],
];
const delayTimes = [
  [3, 4, 1],
  [2, 3, 1],
  [1, 2, 1],
  [1, 3, 5],
  [1, 4, 9],
  [2, 4, 4],
  [2, 1, 2],
  [3, 1, 3],
  [4, 1, 1],
  [3, 2, 2],
  [4, 2, 3],
];
const roomKeys = [[4, 5], [2], [], [1, 0], [3, 5], [4]];
const cityRoads = [
  [3, 4],
  [3, 2],
  [1, 2],
  [5, 0],
  [0, 1],
];

export const stage5b: ProblemAnimation[] = [
  {
    problemId: 127,
    brute: ladderAllPaths("hit", "cog", ladderWords),
    efficient: ladderBfs("hit", "cog", ladderWords),
  },
  {
    problemId: 133,
    brute: cloneList(cloneNeighbors),
    efficient: cloneHashMap(cloneNeighbors),
  },
  {
    problemId: 207,
    brute: canFinishBrute(6, cycleCourses),
    efficient: canFinishKahn(6, cycleCourses),
  },
  {
    problemId: 210,
    brute: findOrderBrute(6, orderCourses),
    efficient: findOrderKahn(6, orderCourses),
  },
  {
    problemId: 547,
    brute: provincesRelabel(cityLinks),
    efficient: provincesDfs(cityLinks),
  },
  {
    problemId: 684,
    brute: redundantSearch(treeEdges),
    efficient: redundantUnionFind(treeEdges),
  },
  {
    problemId: 743,
    brute: delayRescan(delayTimes, 4, 1),
    efficient: delayDijkstra(delayTimes, 4, 1),
  },
  {
    problemId: 841,
    brute: roomsRescan(roomKeys),
    efficient: roomsDfs(roomKeys),
  },
  {
    problemId: 1466,
    brute: reorderRescan(6, cityRoads),
    efficient: reorderBfs(6, cityRoads),
  },
];
