export function readSetting(name: string, fallback: string): string {
  return localStorage.getItem(name) ?? fallback;
}

export function writeSetting(name: string, value: string): void {
  localStorage.setItem(name, value);
}
