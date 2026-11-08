// 區間 DP：f[i][j] 表示子字串 s[i..j] 中最長回文子序列的長度，單一字元 f[i][i] = 1。
// 兩端字元相同就一起選，f[i][j] = f[i + 1][j - 1] + 2；不同就去掉其中一端，f[i][j] = max(f[i + 1][j], f[i][j - 1])。
// f[i][j] 依賴 i + 1 那一列，所以 i 從大到小、j 從小到大計算。答案是 f[0][n - 1]。
// 時間 O(n^2)，空間 O(n^2)。
class Solution {
public:
    int longestPalindromeSubseq(string s) {
        int n = s.size();
        vector<vector<int>> f(n, vector<int>(n, 0));
        for (int i = n - 1; i >= 0; i--) {
            f[i][i] = 1;
            for (int j = i + 1; j < n; j++) {
                if (s[i] == s[j]) {
                    f[i][j] = f[i + 1][j - 1] + 2;
                } else {
                    f[i][j] = max(f[i + 1][j], f[i][j - 1]);
                }
            }
        }
        return f[0][n - 1];
    }
};
