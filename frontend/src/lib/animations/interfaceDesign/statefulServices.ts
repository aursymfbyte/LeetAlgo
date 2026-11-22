import { Cell, Frame, row } from "../types";

type CheckIn = { station: string; time: number };
type Trip = { route: string; spent: number };
type RouteTotal = { total: number; count: number };

function stackRow(label: string, cells: Cell[]) {
  if (cells.length === 0) {
    return row(label, cells, { indexed: false });
  }
  return row(label, cells, { indexed: false, pointers: { 頂: cells.length - 1 } });
}

function riderCells(checkIns: Record<string, CheckIn>) {
  const cells: string[] = [];
  for (const id of Object.keys(checkIns)) {
    const rider = checkIns[id];
    cells.push(`${id}→${rider.station},${rider.time}`);
  }
  return cells;
}

function tripCells(trips: Trip[]) {
  return trips.map((trip) => `${trip.route}:${trip.spent}`);
}

function routeCells(routes: Record<string, RouteTotal>) {
  const cells: string[] = [];
  for (const route of Object.keys(routes)) {
    const sum = routes[route];
    cells.push(`${route}→${sum.total}/${sum.count}`);
  }
  return cells;
}

export function subwayTripList(ops: string[]) {
  const frames: Frame[] = [];
  const checkIns: Record<string, CheckIn> = {};
  const trips: Trip[] = [];
  const results: number[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("車上", [], { indexed: false }), row("行程", [], { indexed: false })],
    message: "「進 1,A」是乘客 1 從 A 站進站，「平均 A,B」是問 A 到 B 平均花多久，第幾個操作就當作時間幾。「車上」記還沒出站的人，「行程」記每一趟。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    const time = step + 1;

    if (name === "進") {
      const [id, station] = text.split(",");
      checkIns[id] = { station, time };
      frames.push({
        rows: [opRow, row("車上", riderCells(checkIns), { indexed: false }), row("行程", tripCells(trips), { indexed: false })],
        message: `進 ${text}（checkIn）：乘客 ${id} 在時間 ${time} 從 ${station} 站進站，記進「車上」。`,
      });
    } else if (name === "出") {
      const [id, station] = text.split(",");
      const entry = checkIns[id];
      const spent = time - entry.time;
      const route = entry.station + station;
      delete checkIns[id];
      trips.push({ route, spent });
      frames.push({
        rows: [opRow, row("車上", riderCells(checkIns), { indexed: false }), row("行程", tripCells(trips), { indexed: false })],
        message: `出 ${text}（checkOut）：現在是時間 ${time}，乘客 ${id} 是時間 ${entry.time} 從 ${entry.station} 站進來的，花了 ${time} - ${entry.time} = ${spent}。把這一趟 ${route}:${spent} 接在行程後面。`,
      });
    } else {
      const [start, end] = text.split(",");
      const route = start + end;
      let total = 0;
      let count = 0;

      for (let i = 0; i < trips.length; i++) {
        const trip = trips[i];
        looked++;

        let result = `不是 ${route}，跳過。`;
        if (trip.route === route) {
          total += trip.spent;
          count++;
          result = `是 ${route}，總時間加到 ${total}，趟數加到 ${count}。`;
        }

        frames.push({
          rows: [
            opRow,
            row("車上", riderCells(checkIns), { indexed: false }),
            row("行程", tripCells(trips), { indexed: false, pointers: { 目前: i }, rangeStart: i }),
          ],
          message: `平均 ${text}（getAverageTime）：把所有行程從頭翻一遍。這一筆 ${trip.route}:${trip.spent} ${result}`,
        });
      }

      const average = total / count;
      results.push(average);
      frames.push({
        rows: [opRow, row("車上", riderCells(checkIns), { indexed: false }), row("行程", tripCells(trips), { indexed: false })],
        message: `平均 ${text}（getAverageTime）：${trips.length} 筆都看完了，${start} 到 ${end} 的平均是 ${total} ÷ ${count} = ${average}，回傳 ${average}。`,
      });
    }
  }

  frames.push({
    rows: [
      row("操作", ops, { indexed: false }),
      row("車上", riderCells(checkIns), { indexed: false }),
      row("行程", tripCells(trips), { indexed: false }),
    ],
    message: `${results.length} 次查平均依序回傳 ${results.join("、")}。每次都把所有行程翻一遍，一共看了 ${looked} 格。`,
  });
  return frames;
}

export function subwayRouteTotals(ops: string[]) {
  const frames: Frame[] = [];
  const checkIns: Record<string, CheckIn> = {};
  const routes: Record<string, RouteTotal> = {};
  const results: number[] = [];
  let looked = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("車上", [], { indexed: false }), row("路線", [], { indexed: false })],
    message: "第幾個操作就當作時間幾，「車上」一樣記還沒出站的人。差別是不存每一趟，改用雜湊表「路線」，每條路線只記「總時間/趟數」，例如 AB→8/2。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    const time = step + 1;

    if (name === "進") {
      const [id, station] = text.split(",");
      checkIns[id] = { station, time };
      frames.push({
        rows: [opRow, row("車上", riderCells(checkIns), { indexed: false }), row("路線", routeCells(routes), { indexed: false })],
        message: `進 ${text}（checkIn）：乘客 ${id} 在時間 ${time} 從 ${station} 站進站，記進「車上」。`,
      });
    } else if (name === "出") {
      const [id, station] = text.split(",");
      const entry = checkIns[id];
      const spent = time - entry.time;
      const route = entry.station + station;
      delete checkIns[id];
      if (routes[route] === undefined) {
        routes[route] = { total: 0, count: 0 };
      }
      routes[route].total += spent;
      routes[route].count++;
      frames.push({
        rows: [opRow, row("車上", riderCells(checkIns), { indexed: false }), row("路線", routeCells(routes), { indexed: false })],
        message: `出 ${text}（checkOut）：現在是時間 ${time}，乘客 ${id} 花了 ${time} - ${entry.time} = ${spent}。不存這一趟，只把路線 ${route} 的總時間加 ${spent}、趟數加 1。`,
      });
    } else {
      const [start, end] = text.split(",");
      const route = start + end;
      const sum = routes[route];
      const average = sum.total / sum.count;
      const position = Object.keys(routes).indexOf(route);
      results.push(average);
      looked++;
      frames.push({
        rows: [
          opRow,
          row("車上", riderCells(checkIns), { indexed: false }),
          row("路線", routeCells(routes), { indexed: false, answer: [position] }),
        ],
        message: `平均 ${text}（getAverageTime）：直接查路線 ${route} 那一格，總時間 ${sum.total} ÷ 趟數 ${sum.count} = ${average}，回傳 ${average}。`,
      });
    }
  }

  frames.push({
    rows: [
      row("操作", ops, { indexed: false }),
      row("車上", riderCells(checkIns), { indexed: false }),
      row("路線", routeCells(routes), { indexed: false }),
    ],
    message: `${results.length} 次查平均依序回傳 ${results.join("、")}。總時間和趟數出站時就加好了，查詢只看路線那一格，一共只看了 ${looked} 格。`,
  });
  return frames;
}

export function browserStepByStep(homepage: string, ops: string[]) {
  const frames: Frame[] = [];
  const history = [homepage];
  const results: string[] = [];
  let current = 0;
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("紀錄", history, { pointers: { 目前: current } })],
    message: `一開始停在首頁 ${homepage}。「去 a」是前往網頁 a，「退 3」是往回走 3 步，「進 2」是往前走 2 步。「紀錄」依序放瀏覽過的網頁。`,
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "去") {
      const removed = history.length - 1 - current;
      while (history.length > current + 1) {
        history.pop();
        moved++;
      }
      history.push(text);
      current++;

      let message = `去 ${text}（visit）：把 ${text} 接在紀錄後面，並走到這一頁。`;
      if (removed > 0) {
        message = `去 ${text}（visit）：先把目前頁面後面的 ${removed} 頁一格一格刪掉，再把 ${text} 接在後面並走過去。刪了 ${removed} 次。`;
      }
      frames.push({
        rows: [opRow, row("紀錄", history, { pointers: { 目前: current } })],
        message,
      });
      continue;
    }

    let steps = Number(text);
    let walked = 0;

    if (name === "退") {
      while (steps > 0 && current > 0) {
        current--;
        steps--;
        walked++;
        moved++;
        frames.push({
          rows: [opRow, row("紀錄", history, { pointers: { 目前: current } })],
          message: `退 ${text}（back）：一步一步往回走，第 ${walked} 步走到 ${history[current]}。`,
        });
      }
    } else {
      while (steps > 0 && current < history.length - 1) {
        current++;
        steps--;
        walked++;
        moved++;
        frames.push({
          rows: [opRow, row("紀錄", history, { pointers: { 目前: current } })],
          message: `進 ${text}（forward）：一步一步往前走，第 ${walked} 步走到 ${history[current]}。`,
        });
      }
    }

    let note = "";
    if (steps > 0) {
      note = `已經到底了，剩下的 ${steps} 步不走。`;
    }
    const page = history[current];
    results.push(page);
    frames.push({
      rows: [opRow, row("紀錄", history, { pointers: { 目前: current }, answer: [current] })],
      message: `${name} ${text}：走了 ${walked} 步。${note}停在 ${page}，回傳 ${page}。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("紀錄", history, { pointers: { 目前: current } })],
    message: `回傳值依序是 ${results.join("、")}。往回往前都一步一步走，前往新網頁還要一格一格刪，一共動了 ${moved} 次。`,
  });
  return frames;
}

export function browserJump(homepage: string, ops: string[]) {
  const frames: Frame[] = [];
  const history = [homepage];
  const results: string[] = [];
  let current = 0;
  let last = 0;
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("紀錄", history, { pointers: { 目前: current, 最後: last } })],
    message: `一開始停在首頁 ${homepage}。除了「目前」的位置，再多記一個「最後」：還能往前走到的最後一頁。超過「最後」的舊紀錄會變灰，留著但走不到。`,
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, text] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "去") {
      current++;
      let message = `去 ${text}（visit）：把 ${text} 寫在目前的下一格，「目前」和「最後」都移到這裡。`;
      if (current === history.length) {
        history.push(text);
      } else {
        message = `去 ${text}（visit）：把 ${text} 寫在目前的下一格，蓋掉舊的 ${history[current]}，「最後」也移到這裡。後面的舊紀錄不用刪，反正走不到。`;
        history[current] = text;
      }
      last = current;
      frames.push({
        rows: [opRow, row("紀錄", history, { pointers: { 目前: current, 最後: last }, rangeEnd: last })],
        message,
      });
      continue;
    }

    const steps = Number(text);
    let message = "";

    if (name === "退") {
      const wanted = current - steps;
      let note = "";
      if (wanted < 0) {
        note = "不能小於 0，取 0，";
      }
      message = `退 ${text}（back）：不用一步一步走，直接算 ${current} - ${steps} = ${wanted}，${note}`;
      current = Math.max(0, wanted);
    } else {
      const wanted = current + steps;
      let note = "";
      if (wanted > last) {
        note = `不能超過「最後」的 ${last}，取 ${last}，`;
      }
      message = `進 ${text}（forward）：不用一步一步走，直接算 ${current} + ${steps} = ${wanted}，${note}`;
      current = Math.min(last, wanted);
    }

    const page = history[current];
    results.push(page);
    moved++;
    frames.push({
      rows: [opRow, row("紀錄", history, { pointers: { 目前: current, 最後: last }, rangeEnd: last, answer: [current] })],
      message: `${message}跳到位置 ${current} 的 ${page}，回傳 ${page}。`,
    });
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), row("紀錄", history, { pointers: { 目前: current, 最後: last }, rangeEnd: last })],
    message: `回傳值依序是 ${results.join("、")}。每次都直接算出位置跳過去，舊紀錄也不用刪，一共只動了 ${moved} 次。`,
  });
  return frames;
}

function textRow(text: string[], cursor: number) {
  const cells = [...text];
  cells.splice(cursor, 0, "|");
  return row("文字", cells, { indexed: false, pointers: { 游標: cursor } });
}

function beforeCursor(letters: string[]) {
  const shown = letters.slice(-10).join("");
  if (shown === "") {
    return "空字串";
  }
  return shown;
}

export function editorOneArray(ops: string[]) {
  const frames: Frame[] = [];
  const text: string[] = [];
  const results: string[] = [];
  let cursor = 0;
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), textRow(text, cursor)],
    message: "所有字元放在同一個陣列，「|」是游標。「打 xy」是在游標處打字，「刪 1」是刪掉游標左邊 1 個字，「左 4」「右 2」是移動游標。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, word] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });
    const right = text.length - cursor;

    if (name === "打") {
      const letters = [...word];
      text.splice(cursor, 0, ...letters);
      cursor += letters.length;
      moved += right;

      let message = `打 ${word}（addText）：游標在最後面，直接把 ${word} 接上去，不用搬任何字元。`;
      if (right > 0) {
        message = `打 ${word}（addText）：游標右邊的 ${right} 個字元要先往後挪出空位，才能把 ${word} 放進去。搬了 ${right} 個字元。`;
      }
      frames.push({ rows: [opRow, textRow(text, cursor)], message });
      continue;
    }

    const k = Number(word);

    if (name === "刪") {
      const deleted = Math.min(k, cursor);
      text.splice(cursor - deleted, deleted);
      cursor -= deleted;
      moved += right;
      results.push(String(deleted));
      frames.push({
        rows: [opRow, textRow(text, cursor)],
        message: `刪 ${k}（deleteText）：游標左邊最多刪 ${k} 個，實際刪掉 ${deleted} 個，回傳 ${deleted}。右邊的 ${right} 個字元要往前挪補上空位，搬了 ${right} 個字元。`,
      });
    } else if (name === "左") {
      cursor = Math.max(0, cursor - k);
      const shown = beforeCursor(text.slice(0, cursor));
      results.push(shown);
      frames.push({
        rows: [opRow, textRow(text, cursor)],
        message: `左 ${k}（cursorLeft）：只是把游標的位置改成 ${cursor}，不用搬字元。回傳游標左邊的字（最多 10 個）：${shown}。`,
      });
    } else {
      cursor = Math.min(text.length, cursor + k);
      const shown = beforeCursor(text.slice(0, cursor));
      results.push(shown);
      frames.push({
        rows: [opRow, textRow(text, cursor)],
        message: `右 ${k}（cursorRight）：只是把游標的位置改成 ${cursor}，不用搬字元。回傳游標左邊的字（最多 10 個）：${shown}。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), textRow(text, cursor)],
    message: `回傳值依序是 ${results.join("、")}。每次在中間打字或刪除，游標右邊的字元都要整排挪動，一共搬了 ${moved} 個字元。`,
  });
  return frames;
}

export function editorTwoStacks(ops: string[]) {
  const frames: Frame[] = [];
  const left: string[] = [];
  const right: string[] = [];
  const results: string[] = [];
  let moved = 0;

  frames.push({
    rows: [row("操作", ops, { indexed: false }), stackRow("左堆疊", left), stackRow("右堆疊", right)],
    message: "以游標為界分成兩個堆疊：左堆疊放游標左邊的字，右堆疊倒著放游標右邊的字，所以兩邊的頂端都緊貼著游標。",
  });

  for (let step = 0; step < ops.length; step++) {
    const [name, word] = ops[step].split(" ");
    const opRow = row("操作", ops, { indexed: false, pointers: { 目前: step }, rangeStart: step });

    if (name === "打") {
      const letters = [...word];
      left.push(...letters);
      frames.push({
        rows: [opRow, stackRow("左堆疊", left), stackRow("右堆疊", right)],
        message: `打 ${word}（addText）：把 ${word} 一個一個推進左堆疊，頂端就是游標的位置。右堆疊完全不用動。`,
      });
      continue;
    }

    let k = Number(word);

    if (name === "刪") {
      const deleted = Math.min(k, left.length);
      for (let i = 0; i < deleted; i++) {
        left.pop();
      }
      results.push(String(deleted));
      frames.push({
        rows: [opRow, stackRow("左堆疊", left), stackRow("右堆疊", right)],
        message: `刪 ${k}（deleteText）：從左堆疊頂端最多彈出 ${k} 個，實際彈出 ${deleted} 個，回傳 ${deleted}。右堆疊完全不用動。`,
      });
    } else if (name === "左") {
      let carried = 0;
      while (k > 0 && left.length > 0) {
        right.push(left.pop() as string);
        k--;
        carried++;
      }
      moved += carried;
      const shown = beforeCursor(left);
      results.push(shown);
      frames.push({
        rows: [opRow, stackRow("左堆疊", left), stackRow("右堆疊", right)],
        message: `左 ${word}（cursorLeft）：把左堆疊頂端的字元一個一個搬到右堆疊，最多 ${word} 個，實際搬了 ${carried} 個。回傳左堆疊頂端最多 10 個字：${shown}。`,
      });
    } else {
      let carried = 0;
      while (k > 0 && right.length > 0) {
        left.push(right.pop() as string);
        k--;
        carried++;
      }
      moved += carried;
      const shown = beforeCursor(left);
      results.push(shown);
      frames.push({
        rows: [opRow, stackRow("左堆疊", left), stackRow("右堆疊", right)],
        message: `右 ${word}（cursorRight）：把右堆疊頂端的字元一個一個搬回左堆疊，最多 ${word} 個，實際搬了 ${carried} 個。回傳左堆疊頂端最多 10 個字：${shown}。`,
      });
    }
  }

  frames.push({
    rows: [row("操作", ops, { indexed: false }), stackRow("左堆疊", left), stackRow("右堆疊", right)],
    message: `回傳值依序是 ${results.join("、")}。打字和刪除只動左堆疊的頂端，只有移動游標才要搬，一共只搬了 ${moved} 個字元。`,
  });
  return frames;
}
