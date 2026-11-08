// f[i][j] 表示 text1 的前 i 個字元和 text2 的前 j 個字元的最長公共子序列長度。
// 看兩者最後一個字元：相同就一起選，f[i][j] = f[i - 1][j - 1] + 1；
// 不同就至少有一個不選，f[i][j] = max(f[i - 1][j], f[i][j - 1])。任一邊長度為 0 時 f 為 0。
// 每一列只依賴上一列，所以只留一個長度 m + 1 的一維陣列 f：更新 f[j] 前它還是 f[i - 1][j]，f[j - 1] 已經是 f[i][j - 1]，
// 左上角的 f[i - 1][j - 1] 會被蓋掉，先用 pre 存起來。
// 兩個字串交換不影響答案，所以先交換讓 text2 是較短的字串，陣列長度只跟較短的有關。
// 時間 O(nm)，空間 O(min(n, m))。
int maxInt(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

int longestCommonSubsequence(char* text1, char* text2) {
    int n = strlen(text1);
    int m = strlen(text2);
    if (m > n) {
        char* longer = text2;
        text2 = text1;
        text1 = longer;
        n = strlen(text1);
        m = strlen(text2);
    }

    int* f = calloc(m + 1, sizeof(int));
    for (int i = 1; i <= n; i++) {
        int pre = f[0];
        for (int j = 1; j <= m; j++) {
            int temp = f[j];
            if (text1[i - 1] == text2[j - 1]) {
                f[j] = pre + 1;
            } else {
                f[j] = maxInt(f[j], f[j - 1]);
            }
            pre = temp;
        }
    }

    int answer = f[m];
    free(f);
    return answer;
}
