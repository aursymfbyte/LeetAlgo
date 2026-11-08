# 和 435 是對偶問題：一支箭能射爆的氣球彼此都有共同點，所求的箭數 = 最多能挑出幾個兩兩不相交的氣球。
# 按右端點排序，第一支箭射在第一個氣球的右端點，這是能同時射到最多後續氣球的位置。
# 往後看，左端點 ≤ 箭的位置的氣球都會被這支箭射爆（端點碰到也算）；
# 遇到左端點 > 箭的位置的氣球，就需要新的一支箭，射在它的右端點。
# 時間 O(n log n)，空間 O(n)（排序用）。
class Solution:
    def findMinArrowShots(self, points: list[list[int]]) -> int:
        points.sort(key=lambda point: point[1])
        arrows = 1
        arrow_position = points[0][1]
        for start, end in points[1:]:
            if start > arrow_position:
                arrows += 1
                arrow_position = end
        return arrows
