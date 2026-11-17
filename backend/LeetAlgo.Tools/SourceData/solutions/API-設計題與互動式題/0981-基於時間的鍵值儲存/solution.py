# 用雜湊表把每個 key 對應到兩個陣列：timestamps 和 values，依照 set 的順序加在尾端。
# 題目保證 set 的時間戳嚴格遞增，所以 timestamps 本身就是排好序的，不用另外排序。
# get 時二分搜尋「第一個大於 timestamp 的位置」，它的前一格就是時間戳 <= timestamp 中最大的那筆；
# 前一格不存在（位置是 0）就回傳空字串。
# set 均攤 O(1)，get O(log n)，空間 O(set 的呼叫次數)。
class TimeMap:

    def __init__(self):
        self.timestamps = {}
        self.values = {}

    def set(self, key: str, value: str, timestamp: int) -> None:
        if key not in self.timestamps:
            self.timestamps[key] = []
            self.values[key] = []
        self.timestamps[key].append(timestamp)
        self.values[key].append(value)

    def get(self, key: str, timestamp: int) -> str:
        if key not in self.timestamps:
            return ""
        times = self.timestamps[key]
        left = 0
        right = len(times)
        while left < right:
            mid = (left + right) // 2
            if times[mid] <= timestamp:
                left = mid + 1
            else:
                right = mid
        if left == 0:
            return ""
        return self.values[key][left - 1]
