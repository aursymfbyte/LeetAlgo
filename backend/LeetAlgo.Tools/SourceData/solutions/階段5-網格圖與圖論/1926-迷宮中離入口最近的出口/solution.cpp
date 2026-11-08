// BFS 一層一層往外走，第幾層就代表走了幾步，第一次走到邊界上的空格就是最近的出口。
// 走過的格子直接改成牆 '+'，避免重複走；入口一開始就標掉，所以不會被當成出口。
// 時間 O(m * n)，空間 O(m * n)。
class Solution {
public:
    int nearestExit(vector<vector<char>>& maze, vector<int>& entrance) {
        int rows = maze.size();
        int cols = maze[0].size();
        int directions[4][2] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

        maze[entrance[0]][entrance[1]] = '+';
        queue<pair<int, int>> cells;
        cells.push({entrance[0], entrance[1]});
        int steps = 0;
        while (!cells.empty()) {
            steps++;
            int levelSize = cells.size();
            for (int k = 0; k < levelSize; k++) {
                auto [row, col] = cells.front();
                cells.pop();
                for (int i = 0; i < 4; i++) {
                    int nextRow = row + directions[i][0];
                    int nextCol = col + directions[i][1];
                    if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) {
                        continue;
                    }
                    if (maze[nextRow][nextCol] == '+') {
                        continue;
                    }
                    if (nextRow == 0 || nextRow == rows - 1 || nextCol == 0 || nextCol == cols - 1) {
                        return steps;
                    }
                    maze[nextRow][nextCol] = '+';
                    cells.push({nextRow, nextCol});
                }
            }
        }
        return -1;
    }
};
