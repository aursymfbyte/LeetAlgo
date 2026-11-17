// 分離鏈結法：桶陣列從 8 個桶開始，(key, value) 放進第 key % 桶數 個桶，同一個桶裡的資料存成一個串列。
// put 先在桶裡找 key，找到就改 value，找不到才新增；remove 在桶裡找到就拿掉。
// 存放的 key 數超過桶數時，桶數加倍並把所有資料重新分配，所以平均每個桶最多 1 筆資料。
// 加倍時搬動 n 筆資料的成本，分攤到之前的 n 次新增，每次只多 O(1)。
// 每次操作期望均攤 O(1)，空間 O(n)，n 是同時存放過最多的 key 數。
struct Node {
    int key;
    int value;
    struct Node* next;
};

typedef struct {
    struct Node** buckets;
    int bucketCount;
    int size;
} MyHashMap;

MyHashMap* myHashMapCreate() {
    MyHashMap* obj = malloc(sizeof(MyHashMap));
    obj->bucketCount = 8;
    obj->buckets = calloc(obj->bucketCount, sizeof(struct Node*));
    obj->size = 0;
    return obj;
}

void myHashMapRehash(MyHashMap* obj) {
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

struct Node* myHashMapFindNode(MyHashMap* obj, int key) {
    struct Node* node = obj->buckets[key % obj->bucketCount];
    while (node != NULL) {
        if (node->key == key) {
            return node;
        }
        node = node->next;
    }
    return NULL;
}

void myHashMapPut(MyHashMap* obj, int key, int value) {
    struct Node* found = myHashMapFindNode(obj, key);
    if (found != NULL) {
        found->value = value;
        return;
    }
    int index = key % obj->bucketCount;
    struct Node* node = malloc(sizeof(struct Node));
    node->key = key;
    node->value = value;
    node->next = obj->buckets[index];
    obj->buckets[index] = node;
    obj->size++;
    if (obj->size > obj->bucketCount) {
        myHashMapRehash(obj);
    }
}

int myHashMapGet(MyHashMap* obj, int key) {
    struct Node* found = myHashMapFindNode(obj, key);
    if (found == NULL) {
        return -1;
    }
    return found->value;
}

void myHashMapRemove(MyHashMap* obj, int key) {
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

void myHashMapFree(MyHashMap* obj) {
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
