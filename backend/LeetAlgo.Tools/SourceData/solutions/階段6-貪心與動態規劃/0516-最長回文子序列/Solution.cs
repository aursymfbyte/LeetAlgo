// 區間 DP：f[i][j] 表示子字串 s[i..j] 中最長回文子序列的長度，單一字元 f[i][i] = 1。
// 兩端字元相同就一起選，f[i][j] = f[i + 1][j - 1] + 2；不同就去掉其中一端，f[i][j] = max(f[i + 1][j], f[i][j - 1])。
// f[i][j] 依賴 i + 1 那一列，所以 i 從大到小、j 從小到大計算。答案是 f[0][n - 1]。
// 每一列只依賴下一列（i + 1），所以只留一個一維陣列 f：更新 f[j] 前它還是 f[i + 1][j]，f[j - 1] 已經是 f[i][j - 1]，
// 左下角的 f[i + 1][j - 1] 會被蓋掉，先用 pre 存起來；j = i + 1 時對應的是空區間，pre 從 0 開始。
// 時間 O(n^2)，空間 O(n)。
public class Solution {
    public int LongestPalindromeSubseq(string s) {
        int n = s.Length;
        int[] f = new int[n];
        for (int i = n - 1; i >= 0; i--) {
            f[i] = 1;
            int pre = 0;
            for (int j = i + 1; j < n; j++) {
                int temp = f[j];
                if (s[i] == s[j]) {
                    f[j] = pre + 2;
                } else {
                    f[j] = Math.Max(f[j], f[j - 1]);
                }
                pre = temp;
            }
        }
        return f[n - 1];
    }
}
