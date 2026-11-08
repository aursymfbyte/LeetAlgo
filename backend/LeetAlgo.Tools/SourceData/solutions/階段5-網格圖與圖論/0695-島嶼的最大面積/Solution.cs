// DFS 回傳「從這格出發能吃掉的陸地格數」：自己算 1，再加上四個方向回傳的面積。
// 走過的陸地改成 0，同一格就不會被算兩次。掃過每一格，取所有島嶼面積的最大值。
// 時間 O(m * n)，空間 O(m * n)（遞迴深度最壞是整張圖）。
public class Solution {
    private int[,] directions = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 } };

    public int MaxAreaOfIsland(int[][] grid) {
        int maxArea = 0;
        for (int row = 0; row < grid.Length; row++) {
            for (int col = 0; col < grid[0].Length; col++) {
                if (grid[row][col] == 1) {
                    maxArea = Math.Max(maxArea, Area(grid, row, col));
                }
            }
        }
        return maxArea;
    }

    private int Area(int[][] grid, int row, int col) {
        if (row < 0 || row >= grid.Length || col < 0 || col >= grid[0].Length) {
            return 0;
        }
        if (grid[row][col] != 1) {
            return 0;
        }
        grid[row][col] = 0;
        int total = 1;
        for (int i = 0; i < 4; i++) {
            total += Area(grid, row + directions[i, 0], col + directions[i, 1]);
        }
        return total;
    }
}
