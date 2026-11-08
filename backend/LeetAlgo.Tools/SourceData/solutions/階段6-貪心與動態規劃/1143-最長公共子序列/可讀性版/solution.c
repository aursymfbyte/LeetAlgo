// f[i][j] 表示 text1 的前 i 個字元和 text2 的前 j 個字元的最長公共子序列長度。
// 看兩者最後一個字元：相同就一起選，f[i][j] = f[i - 1][j - 1] + 1；
// 不同就至少有一個不選，f[i][j] = max(f[i - 1][j], f[i][j - 1])。任一邊長度為 0 時 f 為 0。
// 時間 O(nm)，空間 O(nm)。
int maxInt(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

int longestCommonSubsequence(char* text1, char* text2) {
    int n = strlen(text1);
    int m = strlen(text2);
    int** f = malloc(sizeof(int*) * (n + 1));
    for (int i = 0; i <= n; i++) {
        f[i] = calloc(m + 1, sizeof(int));
    }

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            if (text1[i - 1] == text2[j - 1]) {
                f[i][j] = f[i - 1][j - 1] + 1;
            } else {
                f[i][j] = maxInt(f[i - 1][j], f[i][j - 1]);
            }
        }
    }

    int answer = f[n][m];
    for (int i = 0; i <= n; i++) {
        free(f[i]);
    }
    free(f);
    return answer;
}
