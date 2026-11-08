// 每個使用次數 freq 各有一條雙向鏈結串列（帶哨兵節點的環狀串列），串列前端是最近用過的，尾端是最久沒用的。
// 另外用雜湊表從 key 找到節點、從 freq 找到它的串列，並記錄目前最小的使用次數 minFreq。
// 一個 key 被 get 或 put 時，把節點從舊次數的串列拿掉、次數加一、放到新次數串列的最前面；
// 如果舊串列因此變空而且它正是 minFreq，minFreq 就跟著加一。
// 容量滿了要淘汰時，取 minFreq 串列的尾端節點，就是使用次數最少、且其中最久沒用的 key。
// 新 key 的使用次數是 1，所以插入後 minFreq 一定變成 1。
// get 和 put 都是 O(1)，空間 O(capacity)。
struct Node {
    int key;
    int value;
    int freq;
    struct Node* prev;
    struct Node* next;
    UT_hash_handle hh;
};

struct FreqList {
    int freq;
    struct Node head;
    UT_hash_handle hh;
};

typedef struct {
    int capacity;
    int size;
    int minFreq;
    struct Node* keyToNode;
    struct FreqList* freqToList;
} LFUCache;

LFUCache* lFUCacheCreate(int capacity) {
    LFUCache* obj = malloc(sizeof(LFUCache));
    obj->capacity = capacity;
    obj->size = 0;
    obj->minFreq = 0;
    obj->keyToNode = NULL;
    obj->freqToList = NULL;
    return obj;
}

void pushFront(LFUCache* obj, struct Node* node) {
    struct FreqList* list = NULL;
    HASH_FIND_INT(obj->freqToList, &node->freq, list);
    if (list == NULL) {
        list = malloc(sizeof(struct FreqList));
        list->freq = node->freq;
        list->head.prev = &list->head;
        list->head.next = &list->head;
        HASH_ADD_INT(obj->freqToList, freq, list);
    }
    struct Node* head = &list->head;
    node->prev = head;
    node->next = head->next;
    head->next->prev = node;
    head->next = node;
}

void removeNode(LFUCache* obj, struct Node* node) {
    node->prev->next = node->next;
    node->next->prev = node->prev;
    struct FreqList* list = NULL;
    HASH_FIND_INT(obj->freqToList, &node->freq, list);
    if (list->head.next == &list->head) {
        HASH_DEL(obj->freqToList, list);
        free(list);
        if (obj->minFreq == node->freq) {
            obj->minFreq++;
        }
    }
}

void increaseFreq(LFUCache* obj, struct Node* node) {
    removeNode(obj, node);
    node->freq++;
    pushFront(obj, node);
}

int lFUCacheGet(LFUCache* obj, int key) {
    struct Node* node = NULL;
    HASH_FIND_INT(obj->keyToNode, &key, node);
    if (node == NULL) {
        return -1;
    }
    increaseFreq(obj, node);
    return node->value;
}

void lFUCachePut(LFUCache* obj, int key, int value) {
    struct Node* node = NULL;
    HASH_FIND_INT(obj->keyToNode, &key, node);
    if (node != NULL) {
        node->value = value;
        increaseFreq(obj, node);
        return;
    }

    if (obj->size == obj->capacity) {
        struct FreqList* list = NULL;
        HASH_FIND_INT(obj->freqToList, &obj->minFreq, list);
        struct Node* victim = list->head.prev;
        removeNode(obj, victim);
        HASH_DEL(obj->keyToNode, victim);
        free(victim);
        obj->size--;
    }

    node = malloc(sizeof(struct Node));
    node->key = key;
    node->value = value;
    node->freq = 1;
    HASH_ADD_INT(obj->keyToNode, key, node);
    pushFront(obj, node);
    obj->size++;
    obj->minFreq = 1;
}

void lFUCacheFree(LFUCache* obj) {
    struct Node* node;
    struct Node* nextNode;
    HASH_ITER(hh, obj->keyToNode, node, nextNode) {
        HASH_DEL(obj->keyToNode, node);
        free(node);
    }
    struct FreqList* list;
    struct FreqList* nextList;
    HASH_ITER(hh, obj->freqToList, list, nextList) {
        HASH_DEL(obj->freqToList, list);
        free(list);
    }
    free(obj);
}
