# 用 next_number 表示「大於等於它的整數都還在集合裡、從沒被拿走過」。
# 被拿走後又加回來、而且比 next_number 小的數，放進最小堆；另外用集合記錄堆裡有哪些數，避免重複加入。
# popSmallest 時，堆裡的數一定都比 next_number 小，所以堆不空就先彈堆頂，否則回傳 next_number 並往後移。
# 每次操作 O(log m)，空間 O(m)，m 是加回來的數字個數。
import heapq


class SmallestInfiniteSet:

    def __init__(self):
        self.next_number = 1
        self.heap = []
        self.in_heap = set()

    def popSmallest(self) -> int:
        if self.heap:
            smallest = heapq.heappop(self.heap)
            self.in_heap.remove(smallest)
            return smallest
        smallest = self.next_number
        self.next_number += 1
        return smallest

    def addBack(self, num: int) -> None:
        if num >= self.next_number or num in self.in_heap:
            return
        heapq.heappush(self.heap, num)
        self.in_heap.add(num)
