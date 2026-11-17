import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { test, vi } from "vitest";
import { searchProblems } from "../lib/api";
import ContentMatches from "./ContentMatches";

vi.mock("../lib/api", () => ({
  searchProblems: vi.fn(),
}));

test("搜尋失敗時顯示提示，而不是當成沒有結果", async () => {
  vi.mocked(searchProblems).mockRejectedValue(new Error("讀取失敗"));

  render(
    <MemoryRouter>
      <ContentMatches keyword="return" stage="all" />
    </MemoryRouter>,
  );

  await screen.findByText("內文和程式碼的搜尋暫時無法使用，請稍後再試。");
});
