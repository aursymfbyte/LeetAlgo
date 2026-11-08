// 由上到下、由左到右掃過每一格，遇到陸地 '1' 就代表找到一座新島，答案加一，
// 再從這格做 DFS，把整座島相連的陸地都改成 '0'，之後就不會重複計算同一座島。
// 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

void sink(char** grid, int rows, int cols, int row, int col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
        return;
    }
    if (grid[row][col] != '1') {
        return;
    }
    grid[row][col] = '0';
    for (int i = 0; i < 4; i++) {
        sink(grid, rows, cols, row + directions[i][0], col + directions[i][1]);
    }
}

int numIslands(char** grid, int gridSize, int* gridColSize) {
    int rows = gridSize;
    int cols = gridColSize[0];
    int islands = 0;
    for (int row = 0; row < rows; row++) {
        for (int col = 0; col < cols; col++) {
            if (grid[row][col] == '1') {
                islands++;
                sink(grid, rows, cols, row, col);
            }
        }
    }
    return islands;
}
