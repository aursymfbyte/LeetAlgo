# 用雜湊表記錄每道食物目前的評分和所屬料理，再替每種料理準備一個堆，
# 堆頂是「評分最高、評分相同時名稱字典序最小」的那道食物。
# 改評分時不去堆裡找舊紀錄，而是直接推一筆新的 (新評分, 食物)，舊紀錄留在堆裡變成過期資料（懶刪除）。
# 查詢時看堆頂：如果它記的評分和這道食物目前的評分不同，就是過期的，彈掉再看下一個，直到堆頂有效。
# 堆裡存 (-評分, 名稱) 的最小堆，評分高的排前面，評分相同時名稱小的排前面。
# 建構 O(n log n)，changeRating O(log(n + q))，highestRated 均攤 O(log(n + q))，q 是改評分次數；空間 O(n + q)。
import heapq
from collections import defaultdict


class FoodRatings:

    def __init__(self, foods: list[str], cuisines: list[str], ratings: list[int]):
        self.rating_of = {}
        self.cuisine_of = {}
        self.heaps = defaultdict(list)
        for food, cuisine, rating in zip(foods, cuisines, ratings):
            self.rating_of[food] = rating
            self.cuisine_of[food] = cuisine
            heapq.heappush(self.heaps[cuisine], (-rating, food))

    def changeRating(self, food: str, newRating: int) -> None:
        self.rating_of[food] = newRating
        heapq.heappush(self.heaps[self.cuisine_of[food]], (-newRating, food))

    def highestRated(self, cuisine: str) -> str:
        heap = self.heaps[cuisine]
        while -heap[0][0] != self.rating_of[heap[0][1]]:
            heapq.heappop(heap)
        return heap[0][1]
