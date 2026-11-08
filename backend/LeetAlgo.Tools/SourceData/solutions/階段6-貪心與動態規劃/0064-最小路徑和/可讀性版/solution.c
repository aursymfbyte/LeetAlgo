// f[i][j] 表示從左上角走到格子 (i, j) 的最小路徑和（包含兩端格子）。
// 上一步只能來自上方或左方，所以 f[i][j] = min(f[i - 1][j], f[i][j - 1]) + grid[i][j]。
// 第一列只能從左邊來、第一行只能從上面來，要分開處理。
// 時間 O(mn)，空間 O(mn)。
int minInt(int a, int b) {
    if (a < b) {
        return a;
    }
    return b;
}

int minPathSum(int** grid, int gridSize, int* gridColSize) {
    int m = gridSize;
    int n = gridColSize[0];
    int** f = malloc(sizeof(int*) * m);
    for (int i = 0; i < m; i++) {
        f[i] = malloc(sizeof(int) * n);
    }

    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            if (i == 0 && j == 0) {
                f[i][j] = grid[i][j];
            } else if (i == 0) {
                f[i][j] = f[i][j - 1] + grid[i][j];
            } else if (j == 0) {
                f[i][j] = f[i - 1][j] + grid[i][j];
            } else {
                f[i][j] = minInt(f[i - 1][j], f[i][j - 1]) + grid[i][j];
            }
        }
    }

    int answer = f[m - 1][n - 1];
    for (int i = 0; i < m; i++) {
        free(f[i]);
    }
    free(f);
    return answer;
}
