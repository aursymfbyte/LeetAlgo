// 並查集：照順序加入每條邊，加邊前先查兩個端點是否已經在同一個集合。
// 已經連通的話，這條邊會造成環，它就是多出來的那條；否則把兩個集合合併。
// 圖裡只有一個環，照輸入順序第一條「讓環閉合」的邊，正好是環上最後出現的邊，符合題目要求。
// find 時把路徑上的節點直接接到根（路徑壓縮）；合併時把小的集合接到大的集合底下（按大小合併），
// 兩個一起用，每次操作的均攤時間是 α(n)，α 是反阿克曼函數，實際上可以當成常數。
// 時間 O(n·α(n))，空間 O(n)。
class Solution {
private:
    int find(vector<int>& parent, int node) {
        if (parent[node] != node) {
            parent[node] = find(parent, parent[node]);
        }
        return parent[node];
    }

public:
    vector<int> findRedundantConnection(vector<vector<int>>& edges) {
        int n = edges.size();
        vector<int> parent(n + 1);
        vector<int> size(n + 1, 1);
        for (int node = 0; node <= n; node++) {
            parent[node] = node;
        }

        for (auto& edge : edges) {
            int rootA = find(parent, edge[0]);
            int rootB = find(parent, edge[1]);
            if (rootA == rootB) {
                return edge;
            }
            if (size[rootA] < size[rootB]) {
                parent[rootA] = rootB;
                size[rootB] += size[rootA];
            } else {
                parent[rootB] = rootA;
                size[rootA] += size[rootB];
            }
        }
        return {};
    }
};
