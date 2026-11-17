# 不真的複製整個陣列，而是讓每一格記錄自己的修改歷史：一串 (snap_id, val)，snap_id 是修改當下的快照編號。
# set 時，如果這一格最後一筆紀錄的 snap_id 就是目前編號，直接覆蓋；否則在尾端新增一筆。
# snap 只要把目前編號加一，並回傳加一前的編號。
# get(index, snap_id) 要找這一格「snap_id <= 查詢編號」的最後一筆紀錄：
# 二分搜尋第一個 snap_id 大於查詢編號的位置，前一格就是答案；沒有前一格代表從沒改過，值是 0。
# set 均攤 O(1)、snap O(1)，get O(log k)，k 是這一格的紀錄數；空間 O(length + set 的呼叫次數)。
class SnapshotArray:

    def __init__(self, length: int):
        self.history = [[] for _ in range(length)]
        self.current_snap_id = 0

    def set(self, index: int, val: int) -> None:
        records = self.history[index]
        if records and records[-1][0] == self.current_snap_id:
            records[-1] = (self.current_snap_id, val)
        else:
            records.append((self.current_snap_id, val))

    def snap(self) -> int:
        self.current_snap_id += 1
        return self.current_snap_id - 1

    def get(self, index: int, snap_id: int) -> int:
        records = self.history[index]
        left = 0
        right = len(records)
        while left < right:
            mid = (left + right) // 2
            if records[mid][0] <= snap_id:
                left = mid + 1
            else:
                right = mid
        if left == 0:
            return 0
        return records[left - 1][1]
