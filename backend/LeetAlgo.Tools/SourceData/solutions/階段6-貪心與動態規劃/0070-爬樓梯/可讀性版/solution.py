# f[i] 表示爬到第 i 階的方法數。最後一步不是從第 i - 1 階跨 1 階，就是從第 i - 2 階跨 2 階，
# 所以 f[i] = f[i - 1] + f[i - 2]，起點 f[0] = f[1] = 1。
# 時間 O(n)，空間 O(n)。
class Solution:
    def climbStairs(self, n: int) -> int:
        f = [0] * (n + 1)
        f[0] = 1
        f[1] = 1
        for i in range(2, n + 1):
            f[i] = f[i - 1] + f[i - 2]
        return f[n]
