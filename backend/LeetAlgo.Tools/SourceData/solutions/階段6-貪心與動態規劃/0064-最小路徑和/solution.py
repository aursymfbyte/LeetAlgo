# f[i][j] 表示從左上角走到格子 (i, j) 的最小路徑和（包含兩端格子）。
# 上一步只能來自上方或左方，所以 f[i][j] = min(f[i - 1][j], f[i][j - 1]) + grid[i][j]。
# 第一列只能從左邊來、第一行只能從上面來，要分開處理。
# 每一列只依賴上一列，所以只留一個一維陣列 f：更新 f[j] 前它還是上一列的 f[i - 1][j]，f[j - 1] 已經是這一列的 f[i][j - 1]。
# 時間 O(mn)，空間 O(n)。
class Solution:
    def minPathSum(self, grid: list[list[int]]) -> int:
        m = len(grid)
        n = len(grid[0])
        f = [0] * n
        for i in range(m):
            for j in range(n):
                if i == 0 and j == 0:
                    f[j] = grid[i][j]
                elif i == 0:
                    f[j] = f[j - 1] + grid[i][j]
                elif j == 0:
                    f[j] = f[j] + grid[i][j]
                else:
                    f[j] = min(f[j], f[j - 1]) + grid[i][j]
        return f[n - 1]
