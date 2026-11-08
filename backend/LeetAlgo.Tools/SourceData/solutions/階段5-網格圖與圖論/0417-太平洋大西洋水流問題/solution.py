# 反過來想：不從每格往下流，而是從海往上爬。水只能往高度不增加的方向流，
# 所以倒著走時，只能走到高度大於等於目前格子的鄰居。
# 從上邊和左邊做一次 DFS，標出能流進太平洋的格子；從下邊和右邊再做一次，標出能流進大西洋的格子。
# 兩邊都標到的格子就是答案。
# 時間 O(m * n)，空間 O(m * n)。
class Solution:
    def pacificAtlantic(self, heights: list[list[int]]) -> list[list[int]]:
        rows = len(heights)
        cols = len(heights[0])
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]

        def climb(row: int, col: int, reachable: list[list[bool]]) -> None:
            if reachable[row][col]:
                return
            reachable[row][col] = True
            for row_step, col_step in directions:
                next_row = row + row_step
                next_col = col + col_step
                if next_row < 0 or next_row >= rows or next_col < 0 or next_col >= cols:
                    continue
                if heights[next_row][next_col] >= heights[row][col]:
                    climb(next_row, next_col, reachable)

        pacific = [[False] * cols for _ in range(rows)]
        atlantic = [[False] * cols for _ in range(rows)]
        for row in range(rows):
            climb(row, 0, pacific)
            climb(row, cols - 1, atlantic)
        for col in range(cols):
            climb(0, col, pacific)
            climb(rows - 1, col, atlantic)

        result = []
        for row in range(rows):
            for col in range(cols):
                if pacific[row][col] and atlantic[row][col]:
                    result.append([row, col])
        return result
