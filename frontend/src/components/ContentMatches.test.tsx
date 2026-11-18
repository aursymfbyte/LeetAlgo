import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, test, vi } from "vitest";
import { searchProblems } from "../lib/api";
import ContentMatches from "./ContentMatches";

vi.mock("../lib/api", () => ({
  searchProblems: vi.fn(),
}));

afterEach(cleanup);

test("舊搜尋達到上限時，階段內零筆結果也顯示範圍提示", async () => {
  vi.mocked(searchProblems).mockResolvedValue({ results: [], truncated: null });
  render(
    <MemoryRouter>
      <ContentMatches keyword="return" stage="階段 1" />
    </MemoryRouter>,
  );

  await screen.findByText("舊版搜尋只提供全站前 50 題，可能還有其他符合的題目。");
});

test("搜尋失敗時顯示提示，而不是當成沒有結果", async () => {
  vi.mocked(searchProblems).mockRejectedValue(new Error("讀取失敗"));

  render(
    <MemoryRouter>
      <ContentMatches keyword="return" stage="all" />
    </MemoryRouter>,
  );

  await screen.findByText("內文和程式碼的搜尋暫時無法使用。讀取失敗");
});
