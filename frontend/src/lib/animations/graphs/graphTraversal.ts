import { fromOne, listCells, positions } from "./rows";
import { Frame, row } from "../types";

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

export function cloneList(graph: number[][]) {
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

export function cloneHashMap(graph: number[][]) {
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

function roomsVerdict(opened: string[]) {
  const total = opened.length;
  const locked = opened.filter((state) => state === "否").length;
  if (locked > 0) {
    return `還有 ${locked} 個房間進不去，答案是 false`;
  }
  return `${total} 個房間都進得去，答案是 true`;
}

export function roomsRescan(rooms: number[][]) {
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

export function roomsDfs(rooms: number[][]) {
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

export function reorderRescan(total: number, roads: number[][]) {
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

export function reorderBfs(total: number, roads: number[][]) {
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
