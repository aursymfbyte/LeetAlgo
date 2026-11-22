export function positions(start: number, end: number) {
  const list: number[] = [];
  for (let index = start; index <= end; index++) {
    list.push(index);
  }
  return list;
}

export function orEmpty(text: string) {
  if (text === "") {
    return "空";
  }
  return text;
}
