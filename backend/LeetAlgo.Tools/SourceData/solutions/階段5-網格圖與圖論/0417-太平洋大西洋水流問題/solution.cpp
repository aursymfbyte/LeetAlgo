// 反過來想：不從每格往下流，而是從海往上爬。水只能往高度不增加的方向流，
// 所以倒著走時，只能走到高度大於等於目前格子的鄰居。
// 從上邊和左邊做一次 DFS，標出能流進太平洋的格子；從下邊和右邊再做一次，標出能流進大西洋的格子。
// 兩邊都標到的格子就是答案。
// 時間 O(m * n)，空間 O(m * n)。
class Solution {
private:
    int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

    void climb(vector<vector<int>>& heights, int row, int col, vector<vector<bool>>& reachable) {
        if (reachable[row][col]) {
            return;
        }
        reachable[row][col] = true;
        int rows = heights.size();
        int cols = heights[0].size();
        for (int i = 0; i < 4; i++) {
            int nextRow = row + directions[i][0];
            int nextCol = col + directions[i][1];
            if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
                continue;
            }
            if (heights[nextRow][nextCol] >= heights[row][col]) {
                climb(heights, nextRow, nextCol, reachable);
            }
        }
    }

public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        int rows = heights.size();
        int cols = heights[0].size();
        vector<vector<bool>> pacific(rows, vector<bool>(cols, false));
        vector<vector<bool>> atlantic(rows, vector<bool>(cols, false));

        for (int row = 0; row < rows; row++) {
            climb(heights, row, 0, pacific);
            climb(heights, row, cols - 1, atlantic);
        }
        for (int col = 0; col < cols; col++) {
            climb(heights, 0, col, pacific);
            climb(heights, rows - 1, col, atlantic);
        }

        vector<vector<int>> result;
        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                if (pacific[row][col] && atlantic[row][col]) {
                    result.push_back({row, col});
                }
            }
        }
        return result;
    }
};
