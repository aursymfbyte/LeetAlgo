// f[i][j] 表示 text1 的前 i 個字元和 text2 的前 j 個字元的最長公共子序列長度。
// 看兩者最後一個字元：相同就一起選，f[i][j] = f[i - 1][j - 1] + 1；
// 不同就至少有一個不選，f[i][j] = max(f[i - 1][j], f[i][j - 1])。任一邊長度為 0 時 f 為 0。
// 時間 O(nm)，空間 O(nm)。
public class Solution {
    public int LongestCommonSubsequence(string text1, string text2) {
        int n = text1.Length;
        int m = text2.Length;
        int[,] f = new int[n + 1, m + 1];
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (text1[i - 1] == text2[j - 1]) {
                    f[i, j] = f[i - 1, j - 1] + 1;
                } else {
                    f[i, j] = Math.Max(f[i - 1, j], f[i, j - 1]);
                }
            }
        }
        return f[n, m];
    }
}
