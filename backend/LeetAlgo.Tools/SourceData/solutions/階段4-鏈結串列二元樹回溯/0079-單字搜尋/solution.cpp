// 以每個格子當起點做回溯：dfs(row, col, index) 判斷從 (row, col) 出發能不能拼出 word[index..]。
// 目前格子的字母不等於 word[index] 就失敗；index 已經是最後一個字母就成功。
// 往下走之前把目前格子暫時改成 '#'，避免同一格被用兩次；四個方向都試完後再改回原本的字母（恢復現場）。
// 時間 O(m·n·3^L)，L 是 word 的長度（除了來的方向，每步最多再往 3 個方向走）；空間 O(L)。
class Solution {
private:
    const int rowSteps[4] = {1, -1, 0, 0};
    const int colSteps[4] = {0, 0, 1, -1};

    bool dfs(vector<vector<char>>& board, const string& word, int row, int col, int index) {
        if (board[row][col] != word[index]) {
            return false;
        }
        int wordLength = word.size();
        if (index == wordLength - 1) {
            return true;
        }

        int rows = board.size();
        int cols = board[0].size();
        board[row][col] = '#';
        bool found = false;
        for (int direction = 0; direction < 4; direction++) {
            int nextRow = row + rowSteps[direction];
            int nextCol = col + colSteps[direction];
            bool inside = nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols;
            if (inside && dfs(board, word, nextRow, nextCol, index + 1)) {
                found = true;
                break;
            }
        }
        board[row][col] = word[index];
        return found;
    }

public:
    bool exist(vector<vector<char>>& board, string word) {
        int rows = board.size();
        int cols = board[0].size();
        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                if (dfs(board, word, row, col, 0)) {
                    return true;
                }
            }
        }
        return false;
    }
};
