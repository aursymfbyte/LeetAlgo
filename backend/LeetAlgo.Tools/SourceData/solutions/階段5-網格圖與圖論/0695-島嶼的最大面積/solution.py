# DFS 回傳「從這格出發能吃掉的陸地格數」：自己算 1，再加上四個方向回傳的面積。
# 走過的陸地改成 0，同一格就不會被算兩次。掃過每一格，取所有島嶼面積的最大值。
# 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
class Solution:
    def maxAreaOfIsland(self, grid: list[list[int]]) -> int:
        rows = len(grid)
        cols = len(grid[0])
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        def area(row: int, col: int) -> int:
            if row < 0 or row >= rows or col < 0 or col >= cols:
                return 0
            if grid[row][col] != 1:
                return 0
            grid[row][col] = 0
            total = 1
            for row_step, col_step in directions:
                total += area(row + row_step, col + col_step)
            return total

        max_area = 0
        for row in range(rows):
            for col in range(cols):
                if grid[row][col] == 1:
                    max_area = max(max_area, area(row, col))
        return max_area
