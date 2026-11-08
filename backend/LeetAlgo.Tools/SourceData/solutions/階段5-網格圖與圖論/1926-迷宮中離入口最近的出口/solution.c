// BFS 一層一層往外走，第幾層就代表走了幾步，第一次走到邊界上的空格就是最近的出口。
// 走過的格子直接改成牆 '+'，避免重複走；入口一開始就標掉，所以不會被當成出口。
// 時間 O(m * n)，空間 O(m * n)。
int nearestExit(char** maze, int mazeSize, int* mazeColSize, int* entrance, int entranceSize) {
    int rows = mazeSize;
    int cols = mazeColSize[0];
    int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

    int* queueRows = malloc(sizeof(int) * rows * cols);
    int* queueCols = malloc(sizeof(int) * rows * cols);
    int head = 0;
    int tail = 0;
    maze[entrance[0]][entrance[1]] = '+';
    queueRows[tail] = entrance[0];
    queueCols[tail] = entrance[1];
    tail++;

    int steps = 0;
    while (head < tail) {
        steps++;
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
                if (maze[nextRow][nextCol] == '+') {
                    continue;
                }
                if (nextRow == 0 || nextRow == rows - 1 || nextCol == 0 || nextCol == cols - 1) {
                    free(queueRows);
                    free(queueCols);
                    return steps;
                }
                maze[nextRow][nextCol] = '+';
                queueRows[tail] = nextRow;
                queueCols[tail] = nextCol;
                tail++;
            }
        }
    }

    free(queueRows);
    free(queueCols);
    return -1;
}
