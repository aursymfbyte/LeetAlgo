// 正難則反：直接判斷一塊 'O' 有沒有被包圍很麻煩，反過來想，只有連到邊界的 'O' 才不會被包圍。
// 先從四條邊上的每個 'O' 出發做 DFS，把連得到的 'O' 暫時標成 '#'（代表安全）。
// 最後掃一遍：剩下的 'O' 都是被包圍的，改成 'X'；'#' 還原成 'O'。
// 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
class Solution {
private:
    int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

    void markSafe(vector<vector<char>>& board, int row, int col) {
        int rows = board.size();
        int cols = board[0].size();
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
            return;
        }
        if (board[row][col] != 'O') {
            return;
        }
        board[row][col] = '#';
        for (int i = 0; i < 4; i++) {
            markSafe(board, row + directions[i][0], col + directions[i][1]);
        }
    }

public:
    void solve(vector<vector<char>>& board) {
        int rows = board.size();
        int cols = board[0].size();

        for (int row = 0; row < rows; row++) {
            markSafe(board, row, 0);
            markSafe(board, row, cols - 1);
        }
        for (int col = 0; col < cols; col++) {
            markSafe(board, 0, col);
            markSafe(board, rows - 1, col);
        }

        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                if (board[row][col] == 'O') {
                    board[row][col] = 'X';
                } else if (board[row][col] == '#') {
                    board[row][col] = 'O';
                }
            }
        }
    }
};
