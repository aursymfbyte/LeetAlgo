// 一個省份就是圖上的一個連通塊。依序看每座城市，還沒走過就代表發現新省份，答案加一，
// 再從它做 DFS，沿著鄰接矩陣裡 isConnected[city][other] == 1 的邊，把同省份的城市都標記走過。
// 時間 O(n^2)，空間 O(n)。
class Solution {
private:
    void visit(vector<vector<int>>& isConnected, int city, vector<bool>& visited) {
        visited[city] = true;
        int n = isConnected.size();
        for (int other = 0; other < n; other++) {
            if (isConnected[city][other] == 1 && !visited[other]) {
                visit(isConnected, other, visited);
            }
        }
    }

public:
    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size();
        vector<bool> visited(n, false);
        int provinces = 0;
        for (int city = 0; city < n; city++) {
            if (!visited[city]) {
                provinces++;
                visit(isConnected, city, visited);
            }
        }
        return provinces;
    }
};
