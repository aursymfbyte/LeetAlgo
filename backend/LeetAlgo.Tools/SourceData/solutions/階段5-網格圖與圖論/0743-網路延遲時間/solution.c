// 所有節點收到訊號的時間，就是從 k 出發到最遠那個節點的最短路徑長，用 Dijkstra 求單源最短路。
// n 最多 100，用樸素版：鄰接矩陣存邊，每輪從還沒確定的節點裡挑距離最小的，它的最短距離就確定了，
// 再用它去更新鄰居的距離。挑出來的最小距離是無限大時，代表有節點收不到訊號，回傳 -1。
// 邊權不會是負數，所以「目前最小的那個」不可能再被別人更新得更小，這是 Dijkstra 正確的關鍵。
// 無限大取 INT_MAX / 2，兩個相加也不會溢位。
// 時間 O(n^2 + m)，空間 O(n^2)。
int networkDelayTime(int** times, int timesSize, int* timesColSize, int n, int k) {
    int infinity = INT_MAX / 2;
    int** graph = malloc(sizeof(int*) * n);
    for (int i = 0; i < n; i++) {
        graph[i] = malloc(sizeof(int) * n);
        for (int j = 0; j < n; j++) {
            graph[i][j] = infinity;
        }
    }
    for (int i = 0; i < timesSize; i++) {
        graph[times[i][0] - 1][times[i][1] - 1] = times[i][2];
    }

    int* distance = malloc(sizeof(int) * n);
    bool* done = calloc(n, sizeof(bool));
    for (int node = 0; node < n; node++) {
        distance[node] = infinity;
    }
    distance[k - 1] = 0;

    bool allReached = true;
    for (int round = 0; round < n; round++) {
        int closest = -1;
        for (int node = 0; node < n; node++) {
            if (!done[node] && (closest == -1 || distance[node] < distance[closest])) {
                closest = node;
            }
        }
        if (distance[closest] == infinity) {
            allReached = false;
            break;
        }
        done[closest] = true;
        for (int neighbor = 0; neighbor < n; neighbor++) {
            if (distance[closest] + graph[closest][neighbor] < distance[neighbor]) {
                distance[neighbor] = distance[closest] + graph[closest][neighbor];
            }
        }
    }

    int answer = -1;
    if (allReached) {
        answer = 0;
        for (int node = 0; node < n; node++) {
            if (distance[node] > answer) {
                answer = distance[node];
            }
        }
    }

    for (int i = 0; i < n; i++) {
        free(graph[i]);
    }
    free(graph);
    free(distance);
    free(done);
    return answer;
}
