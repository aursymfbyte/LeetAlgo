// 先複製一份圖，再從起點出發做 DFS，把和起點原本顏色相同、而且上下左右相連的格子都改成新顏色。
// 如果起點原本的顏色就等於新顏色，就不做 DFS，否則改過的格子分不出來，會無限遞迴。
// 時間 O(m * n)，空間 O(m * n)。
int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

void fill(int** image, int rows, int cols, int row, int col, int original, int color) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
        return;
    }
    if (image[row][col] != original) {
        return;
    }
    image[row][col] = color;
    for (int i = 0; i < 4; i++) {
        fill(image, rows, cols, row + directions[i][0], col + directions[i][1], original, color);
    }
}

int** floodFill(int** image, int imageSize, int* imageColSize, int sr, int sc, int color, int* returnSize, int** returnColumnSizes) {
    int rows = imageSize;
    int cols = imageColSize[0];

    int** result = malloc(sizeof(int*) * rows);
    *returnColumnSizes = malloc(sizeof(int) * rows);
    for (int row = 0; row < rows; row++) {
        result[row] = malloc(sizeof(int) * cols);
        memcpy(result[row], image[row], sizeof(int) * cols);
        (*returnColumnSizes)[row] = cols;
    }
    *returnSize = rows;

    int original = result[sr][sc];
    if (original != color) {
        fill(result, rows, cols, sr, sc, original, color);
    }
    return result;
}
