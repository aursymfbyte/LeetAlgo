// 從起點出發做 DFS，把和起點原本顏色相同、而且上下左右相連的格子都改成新顏色。
// 如果起點原本的顏色就等於新顏色，直接回傳，否則改過的格子分不出來，會無限遞迴。
// 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
class Solution {
private:
    int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

    void fill(vector<vector<int>>& image, int row, int col, int original, int color) {
        int rows = image.size();
        int cols = image[0].size();
        if (row < 0 || row >= rows || col < 0 || col >= cols) {
            return;
        }
        if (image[row][col] != original) {
            return;
        }
        image[row][col] = color;
        for (int i = 0; i < 4; i++) {
            fill(image, row + directions[i][0], col + directions[i][1], original, color);
        }
    }

public:
    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
        int original = image[sr][sc];
        if (original == color) {
            return image;
        }
        fill(image, sr, sc, original, color);
        return image;
    }
};
