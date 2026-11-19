import { readStoredValue, writeStoredValue } from "./storage";

const TOKEN_KEY = "adminToken";
const USER_KEY = "adminUser";

export function getToken() {
  return readStoredValue(TOKEN_KEY);
}

export function getUserName() {
  return readStoredValue(USER_KEY);
}

export function saveLogin(token: string, userName: string) {
  if (!writeStoredValue(USER_KEY, userName) || !writeStoredValue(TOKEN_KEY, token)) {
    clearToken();
    throw new Error("無法儲存登入狀態。請允許這個網站使用瀏覽器儲存空間後再登入。");
  }
}

export function clearToken() {
  writeStoredValue(TOKEN_KEY, null);
  writeStoredValue(USER_KEY, null);
}

function readExpireTime(token: string): number | null {
  try {
    const payloadText = token.split(".")[1].replaceAll("-", "+").replaceAll("_", "/");
    const payload = JSON.parse(atob(payloadText));
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  const token = getToken();
  if (token === null) {
    return false;
  }

  const expireTime = readExpireTime(token);
  if (expireTime === null) {
    clearToken();
    return false;
  }
  return Date.now() < expireTime;
}
