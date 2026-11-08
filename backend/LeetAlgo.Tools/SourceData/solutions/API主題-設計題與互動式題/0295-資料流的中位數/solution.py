# 對頂堆：較小的一半放在最大堆 lower，較大的一半放在最小堆 upper，
# 並維持 lower 的個數等於 upper，或比 upper 多 1。
# 加入新數時先放進 lower，再把 lower 最大的移到 upper，保證 lower 的數都不大於 upper 的數；
# 若 upper 因此比 lower 多，再把 upper 最小的移回 lower。
# 中位數就是 lower 的堆頂（總數為奇數），或兩個堆頂的平均（總數為偶數）。
# addNum O(log n)，findMedian O(1)，空間 O(n)。
import heapq


class MedianFinder:

    def __init__(self):
        self.lower = []
        self.upper = []

    def addNum(self, num: int) -> None:
        heapq.heappush(self.lower, -num)
        heapq.heappush(self.upper, -heapq.heappop(self.lower))
        if len(self.upper) > len(self.lower):
            heapq.heappush(self.lower, -heapq.heappop(self.upper))

    def findMedian(self) -> float:
        if len(self.lower) > len(self.upper):
            return -self.lower[0]
        return (-self.lower[0] + self.upper[0]) / 2
