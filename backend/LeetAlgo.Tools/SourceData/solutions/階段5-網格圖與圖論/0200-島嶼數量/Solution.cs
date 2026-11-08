// 由上到下、由左到右掃過每一格，遇到陸地 '1' 就代表找到一座新島，答案加一，
// 再從這格做 DFS，把整座島相連的陸地都改成 '0'，之後就不會重複計算同一座島。
// 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
public class Solution {
    private int[,] directions = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 } };

    public int NumIslands(char[][] grid) {
        int islands = 0;
        for (int row = 0; row < grid.Length; row++) {
            for (int col = 0; col < grid[0].Length; col++) {
                if (grid[row][col] == '1') {
                    islands++;
                    Sink(grid, row, col);
                }
            }
        }
        return islands;
    }

    private void Sink(char[][] grid, int row, int col) {
        if (row < 0 || row >= grid.Length || col < 0 || col >= grid[0].Length) {
            return;
        }
        if (grid[row][col] != '1') {
            return;
        }
        grid[row][col] = '0';
        for (int i = 0; i < 4; i++) {
            Sink(grid, row + directions[i, 0], col + directions[i, 1]);
        }
    }
}
