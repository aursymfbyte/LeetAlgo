// 把房間當成節點，房間 i 裡的鑰匙 rooms[i] 就是從 i 出發的邊，這正好是一張用鄰接串列表示的圖。
// 從房間 0 做 DFS，拿到鑰匙就進還沒去過的房間，最後檢查是否每間都去過。
// 時間 O(n + k)，空間 O(n)，k 是鑰匙總數。
void visit(int** rooms, int* roomsColSize, int room, bool* visited) {
    visited[room] = true;
    for (int i = 0; i < roomsColSize[room]; i++) {
        int key = rooms[room][i];
        if (!visited[key]) {
            visit(rooms, roomsColSize, key, visited);
        }
    }
}

bool canVisitAllRooms(int** rooms, int roomsSize, int* roomsColSize) {
    bool* visited = calloc(roomsSize, sizeof(bool));
    visit(rooms, roomsColSize, 0, visited);

    bool allVisited = true;
    for (int room = 0; room < roomsSize; room++) {
        if (!visited[room]) {
            allVisited = false;
            break;
        }
    }
    free(visited);
    return allVisited;
}
