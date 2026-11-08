// 用雜湊表把 key 對應到鏈結串列的節點，讓 get / put 能 O(1) 找到資料；
// 再用帶頭尾哨兵的雙向鏈結串列依照使用時間排列：頭哨兵後面是最近用過的，尾哨兵前面是最久沒用的。
// 每次 get 或 put 用到某個 key，就把它的節點移到最前面；容量超過時，刪掉尾哨兵前面那個節點。
// 節點裡要存 key，淘汰時才知道要從雜湊表刪掉哪個 key。
// get / put 都是 O(1)，空間 O(capacity)。
struct CacheNode {
    int key;
    int value;
    struct CacheNode* prev;
    struct CacheNode* next;
    UT_hash_handle hh;
};

typedef struct {
    int capacity;
    struct CacheNode* table;
    struct CacheNode* head;
    struct CacheNode* tail;
} LRUCache;

struct CacheNode* createNode(int key, int value) {
    struct CacheNode* node = malloc(sizeof(struct CacheNode));
    node->key = key;
    node->value = value;
    node->prev = NULL;
    node->next = NULL;
    return node;
}

LRUCache* lRUCacheCreate(int capacity) {
    LRUCache* obj = malloc(sizeof(LRUCache));
    obj->capacity = capacity;
    obj->table = NULL;
    obj->head = createNode(0, 0);
    obj->tail = createNode(0, 0);
    obj->head->next = obj->tail;
    obj->tail->prev = obj->head;
    return obj;
}

void removeNode(struct CacheNode* node) {
    node->prev->next = node->next;
    node->next->prev = node->prev;
}

void addToFront(LRUCache* obj, struct CacheNode* node) {
    node->prev = obj->head;
    node->next = obj->head->next;
    obj->head->next->prev = node;
    obj->head->next = node;
}

int lRUCacheGet(LRUCache* obj, int key) {
    struct CacheNode* node = NULL;
    HASH_FIND_INT(obj->table, &key, node);
    if (node == NULL) {
        return -1;
    }
    removeNode(node);
    addToFront(obj, node);
    return node->value;
}

void lRUCachePut(LRUCache* obj, int key, int value) {
    struct CacheNode* existing = NULL;
    HASH_FIND_INT(obj->table, &key, existing);
    if (existing != NULL) {
        existing->value = value;
        removeNode(existing);
        addToFront(obj, existing);
        return;
    }

    struct CacheNode* node = createNode(key, value);
    HASH_ADD_INT(obj->table, key, node);
    addToFront(obj, node);
    if ((int)HASH_COUNT(obj->table) > obj->capacity) {
        struct CacheNode* leastRecent = obj->tail->prev;
        removeNode(leastRecent);
        HASH_DEL(obj->table, leastRecent);
        free(leastRecent);
    }
}

void lRUCacheFree(LRUCache* obj) {
    struct CacheNode* current;
    struct CacheNode* next;
    HASH_ITER(hh, obj->table, current, next) {
        HASH_DEL(obj->table, current);
        free(current);
    }
    free(obj->head);
    free(obj->tail);
    free(obj);
}
