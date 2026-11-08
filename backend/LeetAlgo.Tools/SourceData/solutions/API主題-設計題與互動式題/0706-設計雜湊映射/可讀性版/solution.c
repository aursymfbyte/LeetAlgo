// 分離鏈結法：開一個長度 1009（質數）的桶陣列，(key, value) 放進第 key % 1009 個桶，
// 同一個桶裡的節點串成一條鏈結串列。
// put 先在桶裡找 key，找到就改 value，找不到才新增節點；remove 找到節點後把它從串列中接掉。
// key 平均分散在各桶時，每次操作 O(n / 1009)，空間 O(n + 1009)，n 是映射大小。
#define BUCKET_COUNT 1009

struct Node {
    int key;
    int value;
    struct Node* next;
};

typedef struct {
    struct Node* buckets[BUCKET_COUNT];
} MyHashMap;

MyHashMap* myHashMapCreate() {
    MyHashMap* obj = malloc(sizeof(MyHashMap));
    for (int i = 0; i < BUCKET_COUNT; i++) {
        obj->buckets[i] = NULL;
    }
    return obj;
}

struct Node* findNode(MyHashMap* obj, int key) {
    struct Node* node = obj->buckets[key % BUCKET_COUNT];
    while (node != NULL) {
        if (node->key == key) {
            return node;
        }
        node = node->next;
    }
    return NULL;
}

void myHashMapPut(MyHashMap* obj, int key, int value) {
    struct Node* found = findNode(obj, key);
    if (found != NULL) {
        found->value = value;
        return;
    }
    int index = key % BUCKET_COUNT;
    struct Node* node = malloc(sizeof(struct Node));
    node->key = key;
    node->value = value;
    node->next = obj->buckets[index];
    obj->buckets[index] = node;
}

int myHashMapGet(MyHashMap* obj, int key) {
    struct Node* found = findNode(obj, key);
    if (found == NULL) {
        return -1;
    }
    return found->value;
}

void myHashMapRemove(MyHashMap* obj, int key) {
    int index = key % BUCKET_COUNT;
    struct Node* previous = NULL;
    struct Node* current = obj->buckets[index];
    while (current != NULL) {
        if (current->key == key) {
            if (previous == NULL) {
                obj->buckets[index] = current->next;
            } else {
                previous->next = current->next;
            }
            free(current);
            return;
        }
        previous = current;
        current = current->next;
    }
}

void myHashMapFree(MyHashMap* obj) {
    for (int i = 0; i < BUCKET_COUNT; i++) {
        struct Node* node = obj->buckets[i];
        while (node != NULL) {
            struct Node* next = node->next;
            free(node);
            node = next;
        }
    }
    free(obj);
}
