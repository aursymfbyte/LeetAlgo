// 並查集：照順序加入每條邊，加邊前先查兩個端點是否已經在同一個集合。
// 已經連通的話，這條邊會造成環，它就是多出來的那條；否則把兩個集合合併。
// 圖裡只有一個環，照輸入順序第一條「讓環閉合」的邊，正好是環上最後出現的邊，符合題目要求。
// find 時順便把路徑上的節點直接接到根（路徑壓縮），之後查詢更快。
// 時間 O(n log n)，空間 O(n)。
int find(int* parent, int node) {
    if (parent[node] != node) {
        parent[node] = find(parent, parent[node]);
    }
    return parent[node];
}

int* findRedundantConnection(int** edges, int edgesSize, int* edgesColSize, int* returnSize) {
    int* parent = malloc(sizeof(int) * (edgesSize + 1));
    for (int node = 0; node <= edgesSize; node++) {
        parent[node] = node;
    }

    int* result = malloc(sizeof(int) * 2);
    *returnSize = 2;
    for (int i = 0; i < edgesSize; i++) {
        int rootA = find(parent, edges[i][0]);
        int rootB = find(parent, edges[i][1]);
        if (rootA == rootB) {
            result[0] = edges[i][0];
            result[1] = edges[i][1];
            break;
        }
        parent[rootA] = rootB;
    }

    free(parent);
    return result;
}
