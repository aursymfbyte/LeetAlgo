// f[i][j] 表示把 word1 的前 i 個字元變成 word2 的前 j 個字元最少要幾次操作。
// 最後一個字元相同就不用動，f[i][j] = f[i - 1][j - 1]；
// 不同就看最後一步是刪除 f[i - 1][j]、插入 f[i][j - 1] 還是替換 f[i - 1][j - 1]，取最小再加 1。
// 邊界：f[i][0] = i（全部刪掉），f[0][j] = j（全部插入）。
// 時間 O(nm)，空間 O(nm)。
class Solution {
public:
    int minDistance(string word1, string word2) {
        int n = word1.size();
        int m = word2.size();
        vector<vector<int>> f(n + 1, vector<int>(m + 1, 0));
        for (int i = 0; i <= n; i++) {
            f[i][0] = i;
        }
        for (int j = 0; j <= m; j++) {
            f[0][j] = j;
        }

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (word1[i - 1] == word2[j - 1]) {
                    f[i][j] = f[i - 1][j - 1];
                } else {
                    f[i][j] = min({f[i - 1][j], f[i][j - 1], f[i - 1][j - 1]}) + 1;
                }
            }
        }
        return f[n][m];
    }
};
