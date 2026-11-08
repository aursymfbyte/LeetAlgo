// f[i][j] 表示把 word1 的前 i 個字元變成 word2 的前 j 個字元最少要幾次操作。
// 最後一個字元相同就不用動，f[i][j] = f[i - 1][j - 1]；
// 不同就看最後一步是刪除 f[i - 1][j]、插入 f[i][j - 1] 還是替換 f[i - 1][j - 1]，取最小再加 1。
// 邊界：f[i][0] = i（全部刪掉），f[0][j] = j（全部插入）。
// 每一列只依賴上一列，所以只留一個長度 m + 1 的一維陣列 f：更新 f[j] 前它還是 f[i - 1][j]，f[j - 1] 已經是 f[i][j - 1]，
// 左上角的 f[i - 1][j - 1] 會被蓋掉，先用 pre 存起來。
// 編輯距離是對稱的（操作反過來做就是另一個方向），所以先交換讓 word2 是較短的字串，陣列長度只跟較短的有關。
// 時間 O(nm)，空間 O(min(n, m))。
class Solution {
public:
    int minDistance(string word1, string word2) {
        if (word2.size() > word1.size()) {
            swap(word1, word2);
        }
        int n = word1.size();
        int m = word2.size();
        vector<int> f(m + 1);
        for (int j = 0; j <= m; j++) {
            f[j] = j;
        }

        for (int i = 1; i <= n; i++) {
            int pre = f[0];
            f[0] = i;
            for (int j = 1; j <= m; j++) {
                int temp = f[j];
                if (word1[i - 1] == word2[j - 1]) {
                    f[j] = pre;
                } else {
                    f[j] = min({f[j], f[j - 1], pre}) + 1;
                }
                pre = temp;
            }
        }
        return f[m];
    }
};
