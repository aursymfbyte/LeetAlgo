# f[i][j] 表示從左上角走到格子 (i, j) 的路徑數。只能往右或往下走，
# 所以到 (i, j) 的上一步一定是 (i - 1, j) 或 (i, j - 1)，f[i][j] = f[i - 1][j] + f[i][j - 1]。
# 第一列和第一行都只有一種走法（一路往右或一路往下），初始化成 1。
# 時間 O(mn)，空間 O(mn)。
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        f = [[1] * n for _ in range(m)]
        for i in range(1, m):
            for j in range(1, n):
                f[i][j] = f[i - 1][j] + f[i][j - 1]
        return f[m - 1][n - 1]
