// 把房間當成節點，房間 i 裡的鑰匙 rooms[i] 就是從 i 出發的邊，這正好是一張用鄰接串列表示的圖。
// 從房間 0 做 DFS，拿到鑰匙就進還沒去過的房間，最後檢查是否每間都去過。
// 時間 O(n + k)，空間 O(n)，k 是鑰匙總數。
class Solution {
private:
    void visit(vector<vector<int>>& rooms, int room, vector<bool>& visited) {
        visited[room] = true;
        for (int key : rooms[room]) {
            if (!visited[key]) {
                visit(rooms, key, visited);
            }
        }
    }

public:
    bool canVisitAllRooms(vector<vector<int>>& rooms) {
        int n = rooms.size();
        vector<bool> visited(n, false);
        visit(rooms, 0, visited);
        for (int room = 0; room < n; room++) {
            if (!visited[room]) {
                return false;
            }
        }
        return true;
    }
};
