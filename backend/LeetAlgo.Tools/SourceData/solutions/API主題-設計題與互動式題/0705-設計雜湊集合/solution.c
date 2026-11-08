// 分離鏈結法：桶陣列從 8 個桶開始，key 放進第 key % 桶數 個桶，同一個桶裡的 key 存成一個串列。
// 新增前先在桶裡找，找到就不重複加；刪除時在桶裡找到就拿掉。
// 存放的 key 數超過桶數時，桶數加倍並把所有 key 重新分配，所以平均每個桶最多 1 個 key。
// 加倍時搬動 n 個 key 的成本，分攤到之前的 n 次新增，每次只多 O(1)。
// 每次操作期望均攤 O(1)，空間 O(n)，n 是同時存放過最多的 key 數。
struct Node {
    int key;
    struct Node* next;
};

typedef struct {
    struct Node** buckets;
    int bucketCount;
    int size;
} MyHashSet;

MyHashSet* myHashSetCreate() {
    MyHashSet* obj = malloc(sizeof(MyHashSet));
    obj->bucketCount = 8;
    obj->buckets = calloc(obj->bucketCount, sizeof(struct Node*));
    obj->size = 0;
    return obj;
}

void myHashSetRehash(MyHashSet* obj) {
    int newBucketCount = obj->bucketCount * 2;
    struct Node** newBuckets = calloc(newBucketCount, sizeof(struct Node*));
    for (int i = 0; i < obj->bucketCount; i++) {
        struct Node* node = obj->buckets[i];
        while (node != NULL) {
            struct Node* next = node->next;
            int index = node->key % newBucketCount;
            node->next = newBuckets[index];
            newBuckets[index] = node;
            node = next;
        }
    }
    free(obj->buckets);
    obj->buckets = newBuckets;
    obj->bucketCount = newBucketCount;
}

bool myHashSetContains(MyHashSet* obj, int key) {
    struct Node* node = obj->buckets[key % obj->bucketCount];
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
    int index = key % obj->bucketCount;
    struct Node* node = malloc(sizeof(struct Node));
    node->key = key;
    node->next = obj->buckets[index];
    obj->buckets[index] = node;
    obj->size++;
    if (obj->size > obj->bucketCount) {
        myHashSetRehash(obj);
    }
}

void myHashSetRemove(MyHashSet* obj, int key) {
    int index = key % obj->bucketCount;
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
            obj->size--;
            return;
        }
        previous = current;
        current = current->next;
    }
}

void myHashSetFree(MyHashSet* obj) {
    for (int i = 0; i < obj->bucketCount; i++) {
        struct Node* node = obj->buckets[i];
        while (node != NULL) {
            struct Node* next = node->next;
            free(node);
            node = next;
        }
    }
    free(obj->buckets);
    free(obj);
}
