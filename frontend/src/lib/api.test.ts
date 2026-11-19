import { afterEach, expect, test, vi } from "vitest";
import { deleteProblem, saveAnimationMessage, searchProblems, SearchResult } from "./api";

afterEach(() => vi.unstubAllGlobals());

test("後台顯示 API 回傳的欄位錯誤", async () => {
  const response = Response.json({ errors: { Text: ["動畫說明最多 300 個字。"] } }, {
    status: 400, headers: { "Content-Type": "application/problem+json" },
  });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
  await expect(saveAnimationMessage(1, { version: "brute", step: 0, text: "字".repeat(301) }))
    .rejects.toThrow("動畫說明最多 300 個字。");
});

test("刪除只送出清單當時看到的版本，遇到衝突不自動重試", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response("題目已變更", { status: 409 }));
  vi.stubGlobal("fetch", fetch);
  await expect(deleteProblem(1, "舊版本")).rejects.toThrow("題目已變更");
  expect(fetch).toHaveBeenCalledTimes(1);
  const [url, options] = fetch.mock.calls[0];
  expect(decodeURIComponent(url)).toMatch(/\/api\/admin\/problems\/1\?revision=舊版本$/);
  expect(options.method).toBe("DELETE");
});

test("伺服器錯誤顯示後端提供的查詢編號", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, {
    status: 500,
    headers: { "X-Trace-Id": "test-request-id" },
  })));

  await expect(searchProblems("return", "all")).rejects.toThrow("查詢編號 test-request-id");
});

function match(id: number, stage: string): SearchResult {
  return { id, title: `題目 ${id}`, stage, place: "cs", snippet: "return" };
}

test("新版搜尋直接使用伺服器的階段與截斷結果", async () => {
  const response = { results: [match(1, "階段 0")], truncated: true };
  const fetch = vi.fn().mockResolvedValue(Response.json(response));
  vi.stubGlobal("fetch", fetch);

  expect(await searchProblems("C++", "階段 0")).toEqual(response);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch.mock.calls[0][0]).toMatch(/\/api\/search\/v2\?keyword=C%2B%2B&stage=/);
});

test.each(["all", "階段 1"])("舊伺服器使用陣列搜尋並套用階段 %s", async (stage) => {
  const matches = [match(1, "階段 0"), match(2, "階段 1")];
  const fetch = vi.fn()
    .mockResolvedValueOnce(new Response(null, { status: 404 }))
    .mockResolvedValueOnce(Response.json(matches));
  vi.stubGlobal("fetch", fetch);

  const results = stage === "all" ? matches : [matches[1]];
  expect(await searchProblems("C++", stage)).toEqual({ results, truncated: false });
  expect(fetch.mock.calls[1][0]).toMatch(/\/api\/search\?keyword=C%2B%2B$/);
});

test("舊搜尋達到全站上限時，選取階段即使沒有結果也標示無法確認完整性", async () => {
  const matches = Array.from({ length: 50 }, (_, index) => match(index, "階段 0"));
  vi.stubGlobal("fetch", vi.fn()
    .mockResolvedValueOnce(new Response(null, { status: 404 }))
    .mockResolvedValueOnce(Response.json(matches)));

  expect(await searchProblems("return", "階段 1")).toEqual({ results: [], truncated: null });
});

test.each([429, 500])("新版搜尋回傳 %i 時保留錯誤", async (status) => {
  const fetch = vi.fn().mockResolvedValue(new Response(null, { status }));
  vi.stubGlobal("fetch", fetch);

  await expect(searchProblems("return", "all")).rejects.toThrow();
  expect(fetch).toHaveBeenCalledTimes(1);
});
