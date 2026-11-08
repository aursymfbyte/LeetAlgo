// 每一列剛好放一個皇后，所以問題變成：第 row 列的皇后要放在哪一行（排列型回溯）。
// 判重用三個陣列：同一行用 colUsed[col]；
// 「/」方向的斜線上 row + col 相同，用 slashUsed[row + col]；
// 「\」方向的斜線上 row - col 相同，加上 n - 1 變成非負下標，用 backslashUsed[row - col + n - 1]。
// 放下去之前三者都沒被佔才能放，遞迴回來後再把標記清掉（恢復現場）。
// 時間 O(n^2·n!)，空間 O(n)（不計答案）。
class Solution {
private:
    void dfs(int n, int row, vector<int>& queenCols, vector<bool>& colUsed, vector<bool>& slashUsed, vector<bool>& backslashUsed, vector<vector<string>>& answer) {
        if (row == n) {
            vector<string> board;
            for (int col : queenCols) {
                string line(n, '.');
                line[col] = 'Q';
                board.push_back(line);
            }
            answer.push_back(board);
            return;
        }
        for (int col = 0; col < n; col++) {
            if (!colUsed[col] && !slashUsed[row + col] && !backslashUsed[row - col + n - 1]) {
                queenCols[row] = col;
                colUsed[col] = true;
                slashUsed[row + col] = true;
                backslashUsed[row - col + n - 1] = true;
                dfs(n, row + 1, queenCols, colUsed, slashUsed, backslashUsed, answer);
                colUsed[col] = false;
                slashUsed[row + col] = false;
                backslashUsed[row - col + n - 1] = false;
            }
        }
    }

public:
    vector<vector<string>> solveNQueens(int n) {
        vector<vector<string>> answer;
        vector<int> queenCols(n);
        vector<bool> colUsed(n, false);
        vector<bool> slashUsed(2 * n - 1, false);
        vector<bool> backslashUsed(2 * n - 1, false);
        dfs(n, 0, queenCols, colUsed, slashUsed, backslashUsed, answer);
        return answer;
    }
};
