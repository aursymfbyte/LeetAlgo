# BFS 一層一層往外走，第幾層就代表走了幾步，第一次走到邊界上的空格就是最近的出口。
# 走過的格子直接改成牆 '+'，避免重複走；入口一開始就標掉，所以不會被當成出口。
# 時間 O(m * n)，空間 O(m * n)。
from collections import deque


class Solution:
    def nearestExit(self, maze: list[list[str]], entrance: list[int]) -> int:
        rows = len(maze)
        cols = len(maze[0])
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        start_row, start_col = entrance
        maze[start_row][start_col] = "+"
        queue = deque([(start_row, start_col)])
        steps = 0
        while queue:
            steps += 1
            for _ in range(len(queue)):
                row, col = queue.popleft()
                for row_step, col_step in directions:
                    next_row = row + row_step
                    next_col = col + col_step
                    if next_row < 0 or next_row >= rows or next_col < 0 or next_col >= cols:
                        continue
                    if maze[next_row][next_col] == "+":
                        continue
                    if next_row == 0 or next_row == rows - 1 or next_col == 0 or next_col == cols - 1:
                        return steps
                    maze[next_row][next_col] = "+"
                    queue.append((next_row, next_col))
        return -1
