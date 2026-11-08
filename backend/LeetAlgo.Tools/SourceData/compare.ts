export type Comparison = {
  id: number;
  readable: string;
  optimal: string;
};

export const comparisons: Comparison[] = [
  { id: 49, readable: "時間 O(n·k log k)，空間 O(n·k)，n 是字串數量，k 是最長字串的長度", optimal: "時間 O(n·(k + 26))，空間 O(n·(k + 26))，n 是字串數量，k 是最長字串的長度" },
  { id: 128, readable: "時間 O(n log n)，空間 O(log n)（排序用）", optimal: "時間 O(n)，空間 O(n)" },
  { id: 217, readable: "時間 O(n log n)，空間 O(log n)（排序用）", optimal: "時間 O(n)，空間 O(n)" },
  { id: 347, readable: "時間 O(n log n)，空間 O(n)", optimal: "時間 O(n)，空間 O(n)" },
  { id: 127, readable: "時間 O(N * L^2 * 26 * log N)，空間 O(N * L)，N 是字典大小、L 是單字長度", optimal: "時間 O(N * L^2 * 26)，空間 O(N * L)，N 是字典大小、L 是單字長度" },
  { id: 684, readable: "時間 O(n log n)，空間 O(n)", optimal: "時間 O(n·α(n))，空間 O(n)" },
  { id: 5, readable: "時間 O(n^2)，空間 O(1)（不算回傳的字串）", optimal: "時間 O(n)，空間 O(n)" },
  { id: 62, readable: "時間 O(mn)，空間 O(mn)", optimal: "時間 O(min(m, n))，空間 O(1)" },
  { id: 64, readable: "時間 O(mn)，空間 O(mn)", optimal: "時間 O(mn)，空間 O(n)" },
  { id: 70, readable: "時間 O(n)，空間 O(n)", optimal: "時間 O(n)，空間 O(1)" },
  { id: 72, readable: "時間 O(nm)，空間 O(nm)", optimal: "時間 O(nm)，空間 O(min(n, m))" },
  { id: 139, readable: "時間 O(n · D · L)，n 是 s 的長度、D 是單字數、L 是單字最大長度；空間 O(n)", optimal: "時間 O(n·L + D·L)，空間 O(n + D·L)" },
  { id: 198, readable: "時間 O(n)，空間 O(n)", optimal: "時間 O(n)，空間 O(1)" },
  { id: 213, readable: "時間 O(n)，空間 O(n)", optimal: "時間 O(n)，空間 O(1)" },
  { id: 300, readable: "時間 O(n^2)，空間 O(n)", optimal: "時間 O(n log n)，空間 O(n)" },
  { id: 516, readable: "時間 O(n^2)，空間 O(n^2)", optimal: "時間 O(n^2)，空間 O(n)" },
  { id: 746, readable: "時間 O(n)，空間 O(n)", optimal: "時間 O(n)，空間 O(1)" },
  { id: 1143, readable: "時間 O(nm)，空間 O(nm)", optimal: "時間 O(nm)，空間 O(min(n, m))" },
  { id: 470, readable: "每輪成功機率 40/49，期望呼叫 rand7() 約 2 * 49 / 40 ≈ 2.45 次；空間 O(1)", optimal: "期望呼叫 rand7() 約 2.19 次，時間期望 O(1)，空間 O(1)" },
  { id: 705, readable: "key 平均分散在各桶時，每次操作 O(n / 1009)，空間 O(n + 1009)，n 是集合大小", optimal: "每次操作期望均攤 O(1)，空間 O(n)，n 是同時存放過最多的 key 數" },
  { id: 706, readable: "key 平均分散在各桶時，每次操作 O(n / 1009)，空間 O(n + 1009)，n 是映射大小", optimal: "每次操作期望均攤 O(1)，空間 O(n)，n 是同時存放過最多的 key 數" },
];
