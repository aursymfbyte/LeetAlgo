// 反過來想：不從每格往下流，而是從海往上爬。水只能往高度不增加的方向流，
// 所以倒著走時，只能走到高度大於等於目前格子的鄰居。
// 從上邊和左邊做一次 DFS，標出能流進太平洋的格子；從下邊和右邊再做一次，標出能流進大西洋的格子。
// 兩邊都標到的格子就是答案。
// 時間 O(m * n)，空間 O(m * n)。
public class Solution {
    private int[,] directions = { { -1, 0 }, { 1, 0 }, { 0, -1 }, { 0, 1 } };

    public IList<IList<int>> PacificAtlantic(int[][] heights) {
        int rows = heights.Length;
        int cols = heights[0].Length;
        bool[,] pacific = new bool[rows, cols];
        bool[,] atlantic = new bool[rows, cols];

        for (int row = 0; row < rows; row++) {
            Climb(heights, row, 0, pacific);
            Climb(heights, row, cols - 1, atlantic);
        }
        for (int col = 0; col < cols; col++) {
            Climb(heights, 0, col, pacific);
            Climb(heights, rows - 1, col, atlantic);
        }

        IList<IList<int>> result = new List<IList<int>>();
        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                if (pacific[row, col] && atlantic[row, col]) {
                    result.Add(new List<int> { row, col });
                }
            }
        }
        return result;
    }

    private void Climb(int[][] heights, int row, int col, bool[,] reachable) {
        if (reachable[row, col]) {
            return;
        }
        reachable[row, col] = true;
        for (int i = 0; i < 4; i++) {
            int nextRow = row + directions[i, 0];
            int nextCol = col + directions[i, 1];
            if (nextRow < 0 || nextRow >= heights.Length || nextCol < 0 || nextCol >= heights[0].Length) {
                continue;
            }
            if (heights[nextRow][nextCol] >= heights[row][col]) {
                Climb(heights, nextRow, nextCol, reachable);
            }
        }
    }
}
