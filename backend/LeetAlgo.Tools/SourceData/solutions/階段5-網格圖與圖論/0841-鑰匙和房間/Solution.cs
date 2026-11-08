// 把房間當成節點，房間 i 裡的鑰匙 rooms[i] 就是從 i 出發的邊，這正好是一張用鄰接串列表示的圖。
// 從房間 0 做 DFS，拿到鑰匙就進還沒去過的房間，最後檢查是否每間都去過。
// 時間 O(n + k)，空間 O(n)，k 是鑰匙總數。
public class Solution {
    public bool CanVisitAllRooms(IList<IList<int>> rooms) {
        bool[] visited = new bool[rooms.Count];
        Visit(rooms, 0, visited);
        foreach (bool roomVisited in visited) {
            if (!roomVisited) {
                return false;
            }
        }
        return true;
    }

    private void Visit(IList<IList<int>> rooms, int room, bool[] visited) {
        visited[room] = true;
        foreach (int key in rooms[room]) {
            if (!visited[key]) {
                Visit(rooms, key, visited);
            }
        }
    }
}
