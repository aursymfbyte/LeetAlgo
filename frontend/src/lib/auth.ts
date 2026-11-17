const TOKEN_KEY = "adminToken";
const USER_KEY = "adminUser";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUserName() {
  return localStorage.getItem(USER_KEY);
}

export function saveLogin(token: string, userName: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, userName);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
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
