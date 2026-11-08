// DFS 回傳「從這格出發能吃掉的陸地格數」：自己算 1，再加上四個方向回傳的面積。
// 走過的陸地改成 0，同一格就不會被算兩次。掃過每一格，取所有島嶼面積的最大值。
// 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

int area(int** grid, int rows, int cols, int row, int col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) {
        return 0;
    }
    if (grid[row][col] != 1) {
        return 0;
    }
    grid[row][col] = 0;
    int total = 1;
    for (int i = 0; i < 4; i++) {
        total += area(grid, rows, cols, row + directions[i][0], col + directions[i][1]);
    }
    return total;
}

int maxAreaOfIsland(int** grid, int gridSize, int* gridColSize) {
    int rows = gridSize;
    int cols = gridColSize[0];
    int maxArea = 0;
    for (int row = 0; row < rows; row++) {
        for (int col = 0; col < cols; col++) {
            if (grid[row][col] == 1) {
                int currentArea = area(grid, rows, cols, row, col);
                if (currentArea > maxArea) {
                    maxArea = currentArea;
                }
            }
        }
    }
    return maxArea;
}
