// 反過來想：不從每格往下流，而是從海往上爬。水只能往高度不增加的方向流，
// 所以倒著走時，只能走到高度大於等於目前格子的鄰居。
// 從上邊和左邊做一次 DFS，標出能流進太平洋的格子；從下邊和右邊再做一次，標出能流進大西洋的格子。
// 兩邊都標到的格子就是答案。
// 時間 O(m * n)，空間 O(m * n)。
int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

bool** createBoolGrid(int rows, int cols) {
    bool** grid = malloc(sizeof(bool*) * rows);
    for (int row = 0; row < rows; row++) {
        grid[row] = calloc(cols, sizeof(bool));
    }
    return grid;
}

void freeBoolGrid(bool** grid, int rows) {
    for (int row = 0; row < rows; row++) {
        free(grid[row]);
    }
    free(grid);
}

void climb(int** heights, int rows, int cols, int row, int col, bool** reachable) {
    if (reachable[row][col]) {
        return;
    }
    reachable[row][col] = true;
    for (int i = 0; i < 4; i++) {
        int nextRow = row + directions[i][0];
        int nextCol = col + directions[i][1];
        if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
            continue;
        }
        if (heights[nextRow][nextCol] >= heights[row][col]) {
            climb(heights, rows, cols, nextRow, nextCol, reachable);
        }
    }
}

int** pacificAtlantic(int** heights, int heightsSize, int* heightsColSize, int* returnSize, int** returnColumnSizes) {
    int rows = heightsSize;
    int cols = heightsColSize[0];
    bool** pacific = createBoolGrid(rows, cols);
    bool** atlantic = createBoolGrid(rows, cols);

    for (int row = 0; row < rows; row++) {
        climb(heights, rows, cols, row, 0, pacific);
        climb(heights, rows, cols, row, cols - 1, atlantic);
    }
    for (int col = 0; col < cols; col++) {
        climb(heights, rows, cols, 0, col, pacific);
        climb(heights, rows, cols, rows - 1, col, atlantic);
    }

    int** result = malloc(sizeof(int*) * rows * cols);
    *returnColumnSizes = malloc(sizeof(int) * rows * cols);
    int count = 0;
    for (int row = 0; row < rows; row++) {
        for (int col = 0; col < cols; col++) {
            if (pacific[row][col] && atlantic[row][col]) {
                result[count] = malloc(sizeof(int) * 2);
                result[count][0] = row;
                result[count][1] = col;
                (*returnColumnSizes)[count] = 2;
                count++;
            }
        }
    }
    *returnSize = count;

    freeBoolGrid(pacific, rows);
    freeBoolGrid(atlantic, rows);
    return result;
}
