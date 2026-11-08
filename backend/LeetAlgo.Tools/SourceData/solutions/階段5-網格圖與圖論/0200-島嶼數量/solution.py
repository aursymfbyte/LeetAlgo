# 由上到下、由左到右掃過每一格，遇到陸地 '1' 就代表找到一座新島，答案加一，
# 再從這格做 DFS，把整座島相連的陸地都改成 '0'，之後就不會重複計算同一座島。
# 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows = len(grid)
        cols = len(grid[0])
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        def sink(row: int, col: int) -> None:
            if row < 0 or row >= rows or col < 0 or col >= cols:
                return
            if grid[row][col] != "1":
                return
            grid[row][col] = "0"
            for row_step, col_step in directions:
                sink(row + row_step, col + col_step)

        islands = 0
        for row in range(rows):
            for col in range(cols):
                if grid[row][col] == "1":
                    islands += 1
                    sink(row, col)
        return islands
