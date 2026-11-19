export function readStoredValue(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    if (error instanceof DOMException && error.name === "SecurityError") return null;
    throw error;
  }
}

export function writeStoredValue(key: string, value: string | null) {
  try {
    if (value === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
    return true;
  } catch (error) {
    if (error instanceof DOMException && (error.name === "SecurityError" || error.name === "QuotaExceededError")) {
      return false;
    }
    throw error;
  }
}
