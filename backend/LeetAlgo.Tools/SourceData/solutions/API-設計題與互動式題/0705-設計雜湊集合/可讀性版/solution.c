// 分離鏈結法：開一個長度 1009（質數）的桶陣列，key 放進第 key % 1009 個桶，
// 同一個桶裡的 key 串成一條鏈結串列。
// 新增前先在桶裡找，找到就不重複加；刪除時找到節點後把它從串列中接掉。
// key 平均分散在各桶時，每次操作 O(n / 1009)，空間 O(n + 1009)，n 是集合大小。
#define BUCKET_COUNT 1009

struct Node {
    int key;
    struct Node* next;
};

typedef struct {
    struct Node* buckets[BUCKET_COUNT];
} MyHashSet;

MyHashSet* myHashSetCreate() {
    MyHashSet* obj = malloc(sizeof(MyHashSet));
    for (int i = 0; i < BUCKET_COUNT; i++) {
        obj->buckets[i] = NULL;
    }
    return obj;
}

bool myHashSetContains(MyHashSet* obj, int key) {
    struct Node* node = obj->buckets[key % BUCKET_COUNT];
    while (node != NULL) {
        if (node->key == key) {
            return true;
        }
        node = node->next;
    }
    return false;
}

void myHashSetAdd(MyHashSet* obj, int key) {
    if (myHashSetContains(obj, key)) {
        return;
    }
    int index = key % BUCKET_COUNT;
    struct Node* node = malloc(sizeof(struct Node));
    node->key = key;
    node->next = obj->buckets[index];
    obj->buckets[index] = node;
}

void myHashSetRemove(MyHashSet* obj, int key) {
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

void myHashSetFree(MyHashSet* obj) {
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
