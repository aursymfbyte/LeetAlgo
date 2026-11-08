# 多源 BFS：一開始把所有爛橘子一起放進佇列，當成同一層的起點，同時向外擴散。
# 每處理完一層就過了一分鐘，這一層把相鄰的新鮮橘子變爛、放進下一層。
# 只在還有新鮮橘子時才繼續擴散，最後還剩新鮮橘子就回傳 -1。
# 時間 O(m * n)，空間 O(m * n)。
from collections import deque


class Solution:
    def orangesRotting(self, grid: list[list[int]]) -> int:
        rows = len(grid)
        cols = len(grid[0])
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        queue = deque()
        fresh = 0
        for row in range(rows):
            for col in range(cols):
                if grid[row][col] == 2:
                    queue.append((row, col))
                elif grid[row][col] == 1:
                    fresh += 1

        minutes = 0
        while queue and fresh > 0:
            minutes += 1
            for _ in range(len(queue)):
                row, col = queue.popleft()
                for row_step, col_step in directions:
                    next_row = row + row_step
                    next_col = col + col_step
                    if next_row < 0 or next_row >= rows or next_col < 0 or next_col >= cols:
                        continue
                    if grid[next_row][next_col] != 1:
                        continue
                    grid[next_row][next_col] = 2
                    fresh -= 1
                    queue.append((next_row, next_col))

        if fresh > 0:
            return -1
        return minutes
