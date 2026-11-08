# f[i][j] 表示把 word1 的前 i 個字元變成 word2 的前 j 個字元最少要幾次操作。
# 最後一個字元相同就不用動，f[i][j] = f[i - 1][j - 1]；
# 不同就看最後一步是刪除 f[i - 1][j]、插入 f[i][j - 1] 還是替換 f[i - 1][j - 1]，取最小再加 1。
# 邊界：f[i][0] = i（全部刪掉），f[0][j] = j（全部插入）。
# 時間 O(nm)，空間 O(nm)。
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        n = len(word1)
        m = len(word2)
        f = [[0] * (m + 1) for _ in range(n + 1)]
        for i in range(n + 1):
            f[i][0] = i
        for j in range(m + 1):
            f[0][j] = j

        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if word1[i - 1] == word2[j - 1]:
                    f[i][j] = f[i - 1][j - 1]
                else:
                    f[i][j] = min(f[i - 1][j], f[i][j - 1], f[i - 1][j - 1]) + 1
        return f[n][m]
