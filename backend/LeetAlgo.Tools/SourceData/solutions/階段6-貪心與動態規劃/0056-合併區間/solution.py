# 按左端點排序後，可以和目前區間重疊的區間一定緊接在它後面。
# 依序處理每個區間：如果它的左端點 ≤ 答案中最後一個區間的右端點，就重疊（端點相接也算），
# 把最後一個區間的右端點更新成兩者較大的那個；否則它和前面都不重疊，直接當成新區間加入答案。
# 時間 O(n log n)，空間 O(n)（排序用，不計答案）。
class Solution:
    def merge(self, intervals: list[list[int]]) -> list[list[int]]:
        intervals.sort(key=lambda interval: interval[0])
        merged = []
        for start, end in intervals:
            if merged and start <= merged[-1][1]:
                merged[-1][1] = max(merged[-1][1], end)
            else:
                merged.append([start, end])
        return merged
