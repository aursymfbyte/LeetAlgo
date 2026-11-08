// 建圖時每條路 a → b 都存成雙向，但記下方向：從 a 走到 b 標成 1（順著原方向），從 b 走到 a 標成 0。
// 從城市 0 出發 BFS 往外走，走的方向是「離開 0」。如果走的邊標成 1，代表原本的路也是離開 0，
// 別的城市沿這條路回不到 0，必須反轉，答案加一。
// 時間 O(n)，空間 O(n)。
public class Solution {
    public int MinReorder(int n, int[][] connections) {
        List<(int City, int NeedsReverse)>[] neighbors = new List<(int City, int NeedsReverse)>[n];
        for (int city = 0; city < n; city++) {
            neighbors[city] = new List<(int City, int NeedsReverse)>();
        }
        foreach (int[] road in connections) {
            neighbors[road[0]].Add((road[1], 1));
            neighbors[road[1]].Add((road[0], 0));
        }

        bool[] visited = new bool[n];
        visited[0] = true;
        Queue<int> queue = new Queue<int>();
        queue.Enqueue(0);
        int changes = 0;
        while (queue.Count > 0) {
            int city = queue.Dequeue();
            foreach ((int nextCity, int needsReverse) in neighbors[city]) {
                if (visited[nextCity]) {
                    continue;
                }
                visited[nextCity] = true;
                changes += needsReverse;
                queue.Enqueue(nextCity);
            }
        }
        return changes;
    }
}
