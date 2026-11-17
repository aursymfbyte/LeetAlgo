import { beforeEach, expect, test } from "vitest";
import { getToken, isLoggedIn, saveLogin } from "./auth";

beforeEach(() => {
  localStorage.clear();
});

test("格式錯誤的登入資料會被清除，視為未登入", () => {
  saveLogin("broken", "admin");

  expect(isLoggedIn()).toBe(false);
  expect(getToken()).toBeNull();
});

test("還沒過期的登入資料視為已登入", () => {
  const oneHourLater = Math.floor(Date.now() / 1000) + 3600;
  const payload = btoa(JSON.stringify({ exp: oneHourLater }));
  saveLogin(`header.${payload}.signature`, "admin");

  expect(isLoggedIn()).toBe(true);
});
