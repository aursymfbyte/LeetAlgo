// 多源 BFS：一開始把所有爛橘子一起放進佇列，當成同一層的起點，同時向外擴散。
// 每處理完一層就過了一分鐘，這一層把相鄰的新鮮橘子變爛、放進下一層。
// 只在還有新鮮橘子時才繼續擴散，最後還剩新鮮橘子就回傳 -1。
// 時間 O(m * n)，空間 O(m * n)。
int orangesRotting(int** grid, int gridSize, int* gridColSize) {
    int rows = gridSize;
    int cols = gridColSize[0];
    int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

    int* queueRows = malloc(sizeof(int) * rows * cols);
    int* queueCols = malloc(sizeof(int) * rows * cols);
    int head = 0;
    int tail = 0;
    int fresh = 0;
    for (int row = 0; row < rows; row++) {
        for (int col = 0; col < cols; col++) {
            if (grid[row][col] == 2) {
                queueRows[tail] = row;
                queueCols[tail] = col;
                tail++;
            } else if (grid[row][col] == 1) {
                fresh++;
            }
        }
    }

    int minutes = 0;
    while (head < tail && fresh > 0) {
        minutes++;
        int levelEnd = tail;
        while (head < levelEnd) {
            int row = queueRows[head];
            int col = queueCols[head];
            head++;
            for (int i = 0; i < 4; i++) {
                int nextRow = row + directions[i][0];
                int nextCol = col + directions[i][1];
                if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
                    continue;
                }
                if (grid[nextRow][nextCol] != 1) {
                    continue;
                }
                grid[nextRow][nextCol] = 2;
                fresh--;
                queueRows[tail] = nextRow;
                queueCols[tail] = nextCol;
                tail++;
            }
        }
    }

    free(queueRows);
    free(queueCols);
    if (fresh > 0) {
        return -1;
    }
    return minutes;
}
