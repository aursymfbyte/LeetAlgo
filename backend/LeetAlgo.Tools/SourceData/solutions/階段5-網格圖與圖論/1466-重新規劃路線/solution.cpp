// 建圖時每條路 a → b 都存成雙向，但記下方向：從 a 走到 b 標成 1（順著原方向），從 b 走到 a 標成 0。
// 從城市 0 出發 BFS 往外走，走的方向是「離開 0」。如果走的邊標成 1，代表原本的路也是離開 0，
// 別的城市沿這條路回不到 0，必須反轉，答案加一。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    int minReorder(int n, vector<vector<int>>& connections) {
        vector<vector<pair<int, int>>> neighbors(n);
        for (auto& road : connections) {
            neighbors[road[0]].push_back({road[1], 1});
            neighbors[road[1]].push_back({road[0], 0});
        }

        vector<bool> visited(n, false);
        visited[0] = true;
        queue<int> cities;
        cities.push(0);
        int changes = 0;
        while (!cities.empty()) {
            int city = cities.front();
            cities.pop();
            for (auto [nextCity, needsReverse] : neighbors[city]) {
                if (visited[nextCity]) {
                    continue;
                }
                visited[nextCity] = true;
                changes += needsReverse;
                cities.push(nextCity);
            }
        }
        return changes;
    }
};
