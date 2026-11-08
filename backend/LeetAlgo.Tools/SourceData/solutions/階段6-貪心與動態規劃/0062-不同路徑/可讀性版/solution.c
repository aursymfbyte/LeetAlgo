// f[i][j] 表示從左上角走到格子 (i, j) 的路徑數。只能往右或往下走，
// 所以到 (i, j) 的上一步一定是 (i - 1, j) 或 (i, j - 1)，f[i][j] = f[i - 1][j] + f[i][j - 1]。
// 第一列和第一行都只有一種走法（一路往右或一路往下），初始化成 1。
// 時間 O(mn)，空間 O(mn)。
int uniquePaths(int m, int n) {
    int** f = malloc(sizeof(int*) * m);
    for (int i = 0; i < m; i++) {
        f[i] = malloc(sizeof(int) * n);
    }

    for (int i = 0; i < m; i++) {
        f[i][0] = 1;
    }
    for (int j = 0; j < n; j++) {
        f[0][j] = 1;
    }

    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) {
            f[i][j] = f[i - 1][j] + f[i][j - 1];
        }
    }

    int answer = f[m - 1][n - 1];
    for (int i = 0; i < m; i++) {
        free(f[i]);
    }
    free(f);
    return answer;
}
