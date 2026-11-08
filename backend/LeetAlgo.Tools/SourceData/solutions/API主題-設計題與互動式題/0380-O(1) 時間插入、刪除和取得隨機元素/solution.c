// 用陣列 values 存所有元素，讓 getRandom 可以隨機挑一個下標；
// 再用雜湊表記錄每個值在陣列裡的下標，讓 insert / remove 能 O(1) 找到位置。
// 刪除時把陣列最後一個元素搬到被刪的位置、更新它的下標，再刪掉陣列尾端，就不用整段移動。
// 要先更新搬過去那個元素的下標，再從雜湊表刪掉 val，這樣刪的剛好是尾端元素時也正確。
// 每個操作平均 O(1)，空間 O(n)。
#define MAX_CALLS 200000

struct IndexEntry {
    int value;
    int index;
    UT_hash_handle hh;
};

typedef struct {
    int* values;
    int size;
    struct IndexEntry* indexOf;
} RandomizedSet;

RandomizedSet* randomizedSetCreate() {
    RandomizedSet* obj = malloc(sizeof(RandomizedSet));
    obj->values = malloc(sizeof(int) * MAX_CALLS);
    obj->size = 0;
    obj->indexOf = NULL;
    return obj;
}

bool randomizedSetInsert(RandomizedSet* obj, int val) {
    struct IndexEntry* found = NULL;
    HASH_FIND_INT(obj->indexOf, &val, found);
    if (found != NULL) {
        return false;
    }

    struct IndexEntry* entry = malloc(sizeof(struct IndexEntry));
    entry->value = val;
    entry->index = obj->size;
    HASH_ADD_INT(obj->indexOf, value, entry);
    obj->values[obj->size] = val;
    obj->size++;
    return true;
}

bool randomizedSetRemove(RandomizedSet* obj, int val) {
    struct IndexEntry* found = NULL;
    HASH_FIND_INT(obj->indexOf, &val, found);
    if (found == NULL) {
        return false;
    }

    int index = found->index;
    int lastValue = obj->values[obj->size - 1];
    struct IndexEntry* lastEntry = NULL;
    HASH_FIND_INT(obj->indexOf, &lastValue, lastEntry);
    obj->values[index] = lastValue;
    lastEntry->index = index;
    obj->size--;

    HASH_DEL(obj->indexOf, found);
    free(found);
    return true;
}

int randomizedSetGetRandom(RandomizedSet* obj) {
    return obj->values[rand() % obj->size];
}

void randomizedSetFree(RandomizedSet* obj) {
    struct IndexEntry* current;
    struct IndexEntry* next;
    HASH_ITER(hh, obj->indexOf, current, next) {
        HASH_DEL(obj->indexOf, current);
        free(current);
    }
    free(obj->values);
    free(obj);
}
