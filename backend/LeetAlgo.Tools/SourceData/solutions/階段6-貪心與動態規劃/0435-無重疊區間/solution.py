# 反過來想：最少移除幾個 = 總數 - 最多能保留幾個互不重疊的區間。
# 按右端點排序，每次都保留「右端點最小」且不和上一個保留區間重疊的區間，
# 右端點越小，留給後面區間的空間越大，這樣保留的數量最多。
# 左端點 ≥ 上一個保留區間的右端點就不重疊（端點相接不算重疊）。
# 時間 O(n log n)，空間 O(n)（排序用）。
class Solution:
    def eraseOverlapIntervals(self, intervals: list[list[int]]) -> int:
        intervals.sort(key=lambda interval: interval[1])
        kept = 1
        last_end = intervals[0][1]
        for start, end in intervals[1:]:
            if start >= last_end:
                kept += 1
                last_end = end
        return len(intervals) - kept
