# f[i][j] 表示 text1 的前 i 個字元和 text2 的前 j 個字元的最長公共子序列長度。
# 看兩者最後一個字元：相同就一起選，f[i][j] = f[i - 1][j - 1] + 1；
# 不同就至少有一個不選，f[i][j] = max(f[i - 1][j], f[i][j - 1])。任一邊長度為 0 時 f 為 0。
# 時間 O(nm)，空間 O(nm)。
class Solution:
    def longestCommonSubsequence(self, text1: str, text2: str) -> int:
        n = len(text1)
        m = len(text2)
        f = [[0] * (m + 1) for _ in range(n + 1)]
        for i in range(1, n + 1):
            for j in range(1, m + 1):
                if text1[i - 1] == text2[j - 1]:
                    f[i][j] = f[i - 1][j - 1] + 1
                else:
                    f[i][j] = max(f[i - 1][j], f[i][j - 1])
        return f[n][m]
