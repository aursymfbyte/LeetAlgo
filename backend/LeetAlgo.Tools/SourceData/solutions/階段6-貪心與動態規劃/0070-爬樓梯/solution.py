# f[i] 表示爬到第 i 階的方法數。最後一步不是從第 i - 1 階跨 1 階，就是從第 i - 2 階跨 2 階，
# 所以 f[i] = f[i - 1] + f[i - 2]，起點 f[0] = f[1] = 1。
# f[i] 只依賴前兩項，所以只用 f0、f1 兩個變數記住 f[i - 2]、f[i - 1]，算完 f[i] 後往前挪一格。
# 時間 O(n)，空間 O(1)。
class Solution:
    def climbStairs(self, n: int) -> int:
        f0 = 1
        f1 = 1
        for i in range(2, n + 1):
            new_f = f1 + f0
            f0 = f1
            f1 = new_f
        return f1
