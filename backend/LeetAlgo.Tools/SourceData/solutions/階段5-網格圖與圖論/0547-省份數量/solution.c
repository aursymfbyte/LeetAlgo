// 一個省份就是圖上的一個連通塊。依序看每座城市，還沒走過就代表發現新省份，答案加一，
// 再從它做 DFS，沿著鄰接矩陣裡 isConnected[city][other] == 1 的邊，把同省份的城市都標記走過。
// 時間 O(n^2)，空間 O(n)。
void visit(int** isConnected, int n, int city, bool* visited) {
    visited[city] = true;
    for (int other = 0; other < n; other++) {
        if (isConnected[city][other] == 1 && !visited[other]) {
            visit(isConnected, n, other, visited);
        }
    }
}

int findCircleNum(int** isConnected, int isConnectedSize, int* isConnectedColSize) {
    int n = isConnectedSize;
    bool* visited = calloc(n, sizeof(bool));
    int provinces = 0;
    for (int city = 0; city < n; city++) {
        if (!visited[city]) {
            provinces++;
            visit(isConnected, n, city, visited);
        }
    }
    free(visited);
    return provinces;
}
