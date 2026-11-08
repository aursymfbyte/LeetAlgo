// 以每個格子當起點做回溯：searchFrom 判斷從 (row, col) 出發能不能拼出 word[index..]。
// 目前格子的字母不等於 word[index] 就失敗；index 已經是最後一個字母就成功。
// 往下走之前把目前格子暫時改成 '#'，避免同一格被用兩次；四個方向都試完後再改回原本的字母（恢復現場）。
// 時間 O(m·n·3^L)，L 是 word 的長度（除了來的方向，每步最多再往 3 個方向走）；空間 O(L)。
const int ROW_STEPS[4] = {1, -1, 0, 0};
const int COL_STEPS[4] = {0, 0, 1, -1};

bool searchFrom(char** board, int rows, int cols, char* word, int wordLength, int row, int col, int index) {
    if (board[row][col] != word[index]) {
        return false;
    }
    if (index == wordLength - 1) {
        return true;
    }

    board[row][col] = '#';
    bool found = false;
    for (int direction = 0; direction < 4; direction++) {
        int nextRow = row + ROW_STEPS[direction];
        int nextCol = col + COL_STEPS[direction];
        bool inside = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
        if (inside && searchFrom(board, rows, cols, word, wordLength, nextRow, nextCol, index + 1)) {
            found = true;
            break;
        }
    }
    board[row][col] = word[index];
    return found;
}

bool exist(char** board, int boardSize, int* boardColSize, char* word) {
    int rows = boardSize;
    int cols = boardColSize[0];
    int wordLength = strlen(word);
    for (int row = 0; row < rows; row++) {
        for (int col = 0; col < cols; col++) {
            if (searchFrom(board, rows, cols, word, wordLength, row, col, 0)) {
                return true;
            }
        }
    }
    return false;
}
