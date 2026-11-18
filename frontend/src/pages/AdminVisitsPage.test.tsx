import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import { clearToken, saveLogin } from "../lib/auth";
import AdminVisitsPage from "./AdminVisitsPage";

afterEach(() => {
  cleanup();
  clearToken();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function openStats() {
  const stats = { totalVisitors: 3, days: [{ date: "2026-11-18", visitors: 3 }] };
  const fetch = vi.fn<typeof window.fetch>().mockResolvedValueOnce(Response.json(stats));
  vi.stubGlobal("fetch", fetch);
  saveLogin("test-token", "admin");
  render(<MemoryRouter><AdminVisitsPage /></MemoryRouter>);
  const button = await screen.findByRole<HTMLButtonElement>("button", { name: "清空流量統計" });
  return { button, fetch };
}

test("取消清空時保留統計，不送出刪除請求", async () => {
  const { button, fetch } = await openStats();
  const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);

  fireEvent.click(button);

  expect(confirm).toHaveBeenCalledOnce();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(screen.getByText("2026-11-18")).toBeTruthy();
});

test("確認清空後只送一次管理者請求，等伺服器成功才歸零", async () => {
  const { button, fetch } = await openStats();
  vi.spyOn(window, "confirm").mockReturnValue(true);
  let finish!: (response: Response) => void;
  fetch.mockReturnValueOnce(new Promise<Response>((resolve) => { finish = resolve; }));

  fireEvent.click(button);
  expect(button.disabled).toBe(true);
  expect(screen.getByText("2026-11-18")).toBeTruthy();
  fireEvent.click(button);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch).toHaveBeenLastCalledWith(expect.stringMatching(/\/api\/visits$/), expect.objectContaining({
    method: "DELETE",
    headers: expect.objectContaining({ Authorization: "Bearer test-token" }),
  }));

  finish(new Response(null, { status: 204 }));
  await screen.findByText(/累計 0 位訪客/);
  expect(screen.queryByText("2026-11-18")).toBeNull();
  expect(button.disabled).toBe(true);
});

test("清空失敗時顯示錯誤並允許重試", async () => {
  const { button, fetch } = await openStats();
  vi.spyOn(window, "confirm").mockReturnValue(true);
  fetch.mockResolvedValueOnce(new Response(null, { status: 500 }));
  fireEvent.click(button);

  expect((await screen.findByRole("alert")).textContent).toContain("500");
  expect(screen.getByText("2026-11-18")).toBeTruthy();
  expect(button.disabled).toBe(false);

  fetch.mockResolvedValueOnce(new Response(null, { status: 204 }));
  fireEvent.click(button);
  await screen.findByText(/累計 0 位訪客/);
  expect(screen.queryByRole("alert")).toBeNull();
});
