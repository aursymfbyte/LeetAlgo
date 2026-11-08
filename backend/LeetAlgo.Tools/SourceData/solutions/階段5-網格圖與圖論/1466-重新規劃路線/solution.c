// 建圖時每條路 a → b 都存成雙向，但記下方向：從 a 走到 b 標成 1（順著原方向），從 b 走到 a 標成 0。
// 從城市 0 出發 BFS 往外走，走的方向是「離開 0」。如果走的邊標成 1，代表原本的路也是離開 0，
// 別的城市沿這條路回不到 0，必須反轉，答案加一。
// 時間 O(n)，空間 O(n)。
struct Road {
    int to;
    int needsReverse;
};

int minReorder(int n, int** connections, int connectionsSize, int* connectionsColSize) {
    int* degree = calloc(n, sizeof(int));
    for (int i = 0; i < connectionsSize; i++) {
        degree[connections[i][0]]++;
        degree[connections[i][1]]++;
    }

    struct Road** neighbors = malloc(sizeof(struct Road*) * n);
    int* neighborCount = calloc(n, sizeof(int));
    for (int city = 0; city < n; city++) {
        neighbors[city] = malloc(sizeof(struct Road) * degree[city]);
    }
    for (int i = 0; i < connectionsSize; i++) {
        int start = connections[i][0];
        int end = connections[i][1];

        neighbors[start][neighborCount[start]].to = end;
        neighbors[start][neighborCount[start]].needsReverse = 1;
        neighborCount[start]++;

        neighbors[end][neighborCount[end]].to = start;
        neighbors[end][neighborCount[end]].needsReverse = 0;
        neighborCount[end]++;
    }

    bool* visited = calloc(n, sizeof(bool));
    int* queue = malloc(sizeof(int) * n);
    int head = 0;
    int tail = 0;
    visited[0] = true;
    queue[tail] = 0;
    tail++;

    int changes = 0;
    while (head < tail) {
        int city = queue[head];
        head++;
        for (int i = 0; i < neighborCount[city]; i++) {
            int nextCity = neighbors[city][i].to;
            if (visited[nextCity]) {
                continue;
            }
            visited[nextCity] = true;
            changes += neighbors[city][i].needsReverse;
            queue[tail] = nextCity;
            tail++;
        }
    }

    for (int city = 0; city < n; city++) {
        free(neighbors[city]);
    }
    free(neighbors);
    free(neighborCount);
    free(degree);
    free(visited);
    free(queue);
    return changes;
}
