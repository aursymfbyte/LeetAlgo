// 每一列剛好放一個皇后，所以問題變成：第 row 列的皇后要放在哪一行（排列型回溯）。
// 判重用三個陣列：同一行用 colUsed[col]；
// 「/」方向的斜線上 row + col 相同，用 slashUsed[row + col]；
// 「\」方向的斜線上 row - col 相同，加上 n - 1 變成非負下標，用 backslashUsed[row - col + n - 1]。
// 放下去之前三者都沒被佔才能放，遞迴回來後再把標記清掉（恢復現場）。
// 時間 O(n^2·n!)，空間 O(n)（不計答案）。
typedef struct {
    int n;
    int* queenCols;
    bool* colUsed;
    bool* slashUsed;
    bool* backslashUsed;
    char*** boards;
    int boardCount;
    int boardCapacity;
} QueenSearch;

void addBoard(QueenSearch* search) {
    if (search->boardCount == search->boardCapacity) {
        search->boardCapacity *= 2;
        search->boards = realloc(search->boards, sizeof(char**) * search->boardCapacity);
    }

    int n = search->n;
    char** board = malloc(sizeof(char*) * n);
    for (int row = 0; row < n; row++) {
        board[row] = malloc(sizeof(char) * (n + 1));
        memset(board[row], '.', n);
        board[row][search->queenCols[row]] = 'Q';
        board[row][n] = '\0';
    }
    search->boards[search->boardCount] = board;
    search->boardCount++;
}

void placeQueens(QueenSearch* search, int row) {
    int n = search->n;
    if (row == n) {
        addBoard(search);
        return;
    }

    for (int col = 0; col < n; col++) {
        int slash = row + col;
        int backslash = row - col + n - 1;
        if (!search->colUsed[col] && !search->slashUsed[slash] && !search->backslashUsed[backslash]) {
            search->queenCols[row] = col;
            search->colUsed[col] = true;
            search->slashUsed[slash] = true;
            search->backslashUsed[backslash] = true;
            placeQueens(search, row + 1);
            search->colUsed[col] = false;
            search->slashUsed[slash] = false;
            search->backslashUsed[backslash] = false;
        }
    }
}

char*** solveNQueens(int n, int* returnSize, int** returnColumnSizes) {
    QueenSearch search;
    search.n = n;
    search.queenCols = malloc(sizeof(int) * n);
    search.colUsed = calloc(n, sizeof(bool));
    search.slashUsed = calloc(2 * n - 1, sizeof(bool));
    search.backslashUsed = calloc(2 * n - 1, sizeof(bool));
    search.boardCount = 0;
    search.boardCapacity = 16;
    search.boards = malloc(sizeof(char**) * search.boardCapacity);

    placeQueens(&search, 0);

    *returnSize = search.boardCount;
    *returnColumnSizes = malloc(sizeof(int) * search.boardCount);
    for (int i = 0; i < search.boardCount; i++) {
        (*returnColumnSizes)[i] = n;
    }

    free(search.queenCols);
    free(search.colUsed);
    free(search.slashUsed);
    free(search.backslashUsed);
    return search.boards;
}
