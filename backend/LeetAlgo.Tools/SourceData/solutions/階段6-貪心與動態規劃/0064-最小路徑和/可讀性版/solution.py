# f[i][j] 表示從左上角走到格子 (i, j) 的最小路徑和（包含兩端格子）。
# 上一步只能來自上方或左方，所以 f[i][j] = min(f[i - 1][j], f[i][j - 1]) + grid[i][j]。
# 第一列只能從左邊來、第一行只能從上面來，要分開處理。
# 時間 O(mn)，空間 O(mn)。
class Solution:
    def minPathSum(self, grid: list[list[int]]) -> int:
        m = len(grid)
        n = len(grid[0])
        f = [[0] * n for _ in range(m)]
        for i in range(m):
            for j in range(n):
                if i == 0 and j == 0:
                    f[i][j] = grid[i][j]
                elif i == 0:
                    f[i][j] = f[i][j - 1] + grid[i][j]
                elif j == 0:
                    f[i][j] = f[i - 1][j] + grid[i][j]
                else:
                    f[i][j] = min(f[i - 1][j], f[i][j - 1]) + grid[i][j]
        return f[m - 1][n - 1]
