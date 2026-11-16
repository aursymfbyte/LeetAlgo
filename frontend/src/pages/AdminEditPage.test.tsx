import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, test, vi } from "vitest";
import { createProblem } from "../lib/api";
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
