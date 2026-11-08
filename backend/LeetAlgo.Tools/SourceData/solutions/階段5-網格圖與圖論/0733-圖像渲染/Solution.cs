// 從起點出發做 DFS，把和起點原本顏色相同、而且上下左右相連的格子都改成新顏色。
// 如果起點原本的顏色就等於新顏色，直接回傳，否則改過的格子分不出來，會無限遞迴。
// 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
public class Solution {
    private int[,] directions = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 } };

    public int[][] FloodFill(int[][] image, int sr, int sc, int color) {
        int original = image[sr][sc];
        if (original == color) {
            return image;
        }
        Fill(image, sr, sc, original, color);
        return image;
    }

    private void Fill(int[][] image, int row, int col, int original, int color) {
        if (row < 0 || row >= image.Length || col < 0 || col >= image[0].Length) {
            return;
        }
        if (image[row][col] != original) {
            return;
        }
        image[row][col] = color;
        for (int i = 0; i < 4; i++) {
            Fill(image, row + directions[i, 0], col + directions[i, 1], original, color);
        }
    }
}
