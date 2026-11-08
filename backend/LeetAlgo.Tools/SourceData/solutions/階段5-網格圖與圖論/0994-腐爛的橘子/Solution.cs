// 多源 BFS：一開始把所有爛橘子一起放進佇列，當成同一層的起點，同時向外擴散。
// 每處理完一層就過了一分鐘，這一層把相鄰的新鮮橘子變爛、放進下一層。
// 只在還有新鮮橘子時才繼續擴散，最後還剩新鮮橘子就回傳 -1。
// 時間 O(m * n)，空間 O(m * n)。
public class Solution {
    public int OrangesRotting(int[][] grid) {
        int rows = grid.Length;
        int cols = grid[0].Length;
        int[,] directions = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 } };

        Queue<(int Row, int Col)> queue = new Queue<(int Row, int Col)>();
        int fresh = 0;
        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                if (grid[row][col] == 2) {
                    queue.Enqueue((row, col));
                } else if (grid[row][col] == 1) {
                    fresh++;
                }
            }
        }

        int minutes = 0;
        while (queue.Count > 0 && fresh > 0) {
            minutes++;
            int levelSize = queue.Count;
            for (int k = 0; k < levelSize; k++) {
                (int row, int col) = queue.Dequeue();
                for (int i = 0; i < 4; i++) {
                    int nextRow = row + directions[i, 0];
                    int nextCol = col + directions[i, 1];
                    if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
                        continue;
                    }
                    if (grid[nextRow][nextCol] != 1) {
                        continue;
                    }
                    grid[nextRow][nextCol] = 2;
                    fresh--;
                    queue.Enqueue((nextRow, nextCol));
                }
            }
        }

        if (fresh > 0) {
            return -1;
        }
        return minutes;
    }
}
