# 從左上角到右下角一定要往下走 m - 1 步、往右走 n - 1 步，總共 m + n - 2 步，
# 不同路徑就是在這些步數中挑出哪幾步往下走，答案是組合數 C(m + n - 2, min(m, n) - 1)。
# 設 larger = max(m, n)、k = min(m, n) - 1，逐步計算 result = result * (larger - 1 + i) / i（i 從 1 到 k），
# 每一步的 result 剛好是 C(larger - 1 + i, i)，所以一定能整除；先乘再除，中間值用 64 位元整數不會溢位。
# 時間 O(min(m, n))，空間 O(1)。
class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        larger = max(m, n)
        k = min(m, n) - 1
        result = 1
        for i in range(1, k + 1):
            result = result * (larger - 1 + i) // i
        return result
