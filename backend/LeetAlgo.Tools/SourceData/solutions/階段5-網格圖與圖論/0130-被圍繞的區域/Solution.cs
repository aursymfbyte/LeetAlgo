// 正難則反：直接判斷一塊 'O' 有沒有被包圍很麻煩，反過來想，只有連到邊界的 'O' 才不會被包圍。
// 先從四條邊上的每個 'O' 出發做 DFS，把連得到的 'O' 暫時標成 '#'（代表安全）。
// 最後掃一遍：剩下的 'O' 都是被包圍的，改成 'X'；'#' 還原成 'O'。
// 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
public class Solution {
    private int[,] directions = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 } };

    public void Solve(char[][] board) {
        int rows = board.Length;
        int cols = board[0].Length;

        for (int row = 0; row < rows; row++) {
            MarkSafe(board, row, 0);
            MarkSafe(board, row, cols - 1);
        }
        for (int col = 0; col < cols; col++) {
            MarkSafe(board, 0, col);
            MarkSafe(board, rows - 1, col);
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

    private void MarkSafe(char[][] board, int row, int col) {
        if (row < 0 || row >= board.Length || col < 0 || col >= board[0].Length) {
            return;
        }
        if (board[row][col] != 'O') {
            return;
        }
        board[row][col] = '#';
        for (int i = 0; i < 4; i++) {
            MarkSafe(board, row + directions[i, 0], col + directions[i, 1]);
        }
    }
}
