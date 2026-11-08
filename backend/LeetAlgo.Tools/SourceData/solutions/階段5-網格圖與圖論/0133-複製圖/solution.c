// 記錄「原節點 → 複本」。節點的值在 1 到 100 之間且不重複，所以直接用 copies[val] 存每個節點的複本。
// DFS 到一個節點時，如果已經有複本就直接回傳，否則先建立複本並記下來，再遞迴複製每個鄰居。
// 一定要先記錄再處理鄰居，圖裡有環，否則會在環上無限遞迴。
// 時間 O(V + E)，空間 O(V)。
struct Node* cloneNode(struct Node* original, struct Node** copies) {
    if (copies[original->val] != NULL) {
        return copies[original->val];
    }

    struct Node* copy = malloc(sizeof(struct Node));
    copy->val = original->val;
    copy->numNeighbors = original->numNeighbors;
    copy->neighbors = malloc(sizeof(struct Node*) * original->numNeighbors);
    copies[original->val] = copy;
    for (int i = 0; i < original->numNeighbors; i++) {
        copy->neighbors[i] = cloneNode(original->neighbors[i], copies);
    }
    return copy;
}

struct Node *cloneGraph(struct Node *s) {
    if (s == NULL) {
        return NULL;
    }
    struct Node* copies[101] = {NULL};
    return cloneNode(s, copies);
}
