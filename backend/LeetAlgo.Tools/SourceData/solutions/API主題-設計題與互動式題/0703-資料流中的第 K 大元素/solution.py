# 維護一個最多 k 個元素的最小堆，裡面放的是目前最大的 k 個數。
# 每加入一個數就放進堆，堆超過 k 個就把最小的彈掉；堆頂就是第 k 大。
# 建構 O(n log k)，每次 add O(log k)，空間 O(k)。
import heapq


class KthLargest:

    def __init__(self, k: int, nums: list[int]):
        self.k = k
        self.heap = []
        for num in nums:
            self.add(num)

    def add(self, val: int) -> int:
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]
