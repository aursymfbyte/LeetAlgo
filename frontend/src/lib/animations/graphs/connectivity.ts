import { Frame, row } from "../types";
import { fromOne, listCells, positions } from "./rows";

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

export function provincesRelabel(matrix: number[][]) {
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

export function provincesDfs(matrix: number[][]) {
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

export function redundantSearch(edges: number[][]) {
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

export function redundantUnionFind(edges: number[][]) {
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
