import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import { createProblem, getProblemForEdit, ProblemEdit, updateProblem } from "../lib/api";
import AdminEditPage from "./AdminEditPage";

const { reload } = vi.hoisted(() => ({ reload: vi.fn() }));

vi.mock("../lib/api", () => ({
  createProblem: vi.fn(),
  updateProblem: vi.fn(),
  getProblemForEdit: vi.fn(),
}));

vi.mock("../lib/catalog", () => ({
  useCatalog: () => ({ stages: [{ code: "階段 0", name: "陣列" }], problems: [], reload }),
}));

afterEach(cleanup);

function savedProblem(id: number): ProblemEdit {
  return {
    id,
    title: `第 ${id} 題的題名`,
    stage: "階段 0",
    difficulty: "簡單",
    link: "https://leetcode.com",
    statement: "題目內文",
    complexity: "時間 O(n)",
    complexityAnalysis: "複雜度說明",
    optimal: { cs: "", py: "", c: "", cpp: "" },
    readable: {},
    comparison: null,
  };
}

test("儲存成功但清單更新失敗時，只重新載入清單，不會再儲存一次", async () => {
  vi.mocked(createProblem).mockResolvedValue(undefined);
  reload.mockRejectedValueOnce(new Error("讀取失敗")).mockResolvedValueOnce(undefined);

  const { container } = render(
    <MemoryRouter initialEntries={["/admin/problems/new"]}>
      <Routes>
        <Route path="/admin/problems/new" element={<AdminEditPage />} />
        <Route path="/problem/:id" element={<p>題目頁</p>} />
      </Routes>
    </MemoryRouter>,
  );

  fireEvent.submit(container.querySelector("form")!);

  await screen.findByText(/已儲存，但題目清單更新失敗/);
  expect(screen.queryByRole("button", { name: "儲存" })).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "重新載入清單" }));

  await screen.findByText("題目頁");
  expect(createProblem).toHaveBeenCalledTimes(1);
});

test("編輯送出原始版本，遇到衝突時保留未儲存的草稿", async () => {
  const problem = { ...savedProblem(1), revision: "40368688-bece-42d1-90b9-cde30de4732e" };
  vi.mocked(getProblemForEdit).mockResolvedValueOnce(problem);
  vi.mocked(updateProblem).mockRejectedValueOnce(new Error("這份草稿的版本已過期。"));
  const { container } = render(
    <MemoryRouter initialEntries={["/admin/problems/1/edit"]}>
      <Routes>
        <Route path="/admin/problems/:id/edit" element={<AdminEditPage />} />
      </Routes>
    </MemoryRouter>,
  );

  const input = await screen.findByDisplayValue(problem.title);
  fireEvent.change(input, { target: { value: "我的草稿" } });
  fireEvent.submit(container.querySelector("form")!);

  await screen.findByText("這份草稿的版本已過期。");
  expect(updateProblem).toHaveBeenCalledWith({ ...problem, title: "我的草稿" });
  expect(screen.getByDisplayValue("我的草稿")).toBe(input);
});

test("從第 1 題的編輯頁換到第 2 題時，表單換成第 2 題的內容", async () => {
  vi.mocked(getProblemForEdit).mockImplementation(async (id) => savedProblem(id));

  render(
    <MemoryRouter initialEntries={["/admin/problems/1/edit"]}>
      <Link to="/admin/problems/2/edit">換到第 2 題</Link>
      <Routes>
        <Route path="/admin/problems/:id/edit" element={<AdminEditPage />} />
      </Routes>
    </MemoryRouter>,
  );

  await screen.findByDisplayValue("第 1 題的題名");
  fireEvent.click(screen.getByRole("link", { name: "換到第 2 題" }));

  await screen.findByDisplayValue("第 2 題的題名");
  expect(screen.queryByDisplayValue("第 1 題的題名")).toBeNull();
});
