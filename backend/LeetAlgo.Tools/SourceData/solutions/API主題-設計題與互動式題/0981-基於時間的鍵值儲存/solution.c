// 用雜湊表把每個 key 對應到兩個陣列：timestamps 和 values，依照 set 的順序加在尾端。
// 題目保證 set 的時間戳嚴格遞增，所以 timestamps 本身就是排好序的，不用另外排序。
// get 時二分搜尋「第一個大於 timestamp 的位置」，它的前一格就是時間戳 <= timestamp 中最大的那筆；
// 前一格不存在（位置是 0）就回傳空字串。
// set 均攤 O(1)，get O(log n)，空間 O(set 的呼叫次數)。
struct KeyEntry {
    char key[101];
    int* timestamps;
    char** values;
    int size;
    int capacity;
    UT_hash_handle hh;
};

typedef struct {
    struct KeyEntry* table;
} TimeMap;

TimeMap* timeMapCreate() {
    TimeMap* obj = malloc(sizeof(TimeMap));
    obj->table = NULL;
    return obj;
}

void timeMapSet(TimeMap* obj, char* key, char* value, int timestamp) {
    struct KeyEntry* entry = NULL;
    HASH_FIND_STR(obj->table, key, entry);
    if (entry == NULL) {
        entry = malloc(sizeof(struct KeyEntry));
        strcpy(entry->key, key);
        entry->size = 0;
        entry->capacity = 4;
        entry->timestamps = malloc(sizeof(int) * entry->capacity);
        entry->values = malloc(sizeof(char*) * entry->capacity);
        HASH_ADD_STR(obj->table, key, entry);
    }

    if (entry->size == entry->capacity) {
        entry->capacity *= 2;
        entry->timestamps = realloc(entry->timestamps, sizeof(int) * entry->capacity);
        entry->values = realloc(entry->values, sizeof(char*) * entry->capacity);
    }

    char* valueCopy = malloc(strlen(value) + 1);
    strcpy(valueCopy, value);
    entry->timestamps[entry->size] = timestamp;
    entry->values[entry->size] = valueCopy;
    entry->size++;
}

char* timeMapGet(TimeMap* obj, char* key, int timestamp) {
    struct KeyEntry* entry = NULL;
    HASH_FIND_STR(obj->table, key, entry);
    if (entry == NULL) {
        return "";
    }

    int left = 0;
    int right = entry->size;
    while (left < right) {
        int mid = (left + right) / 2;
        if (entry->timestamps[mid] <= timestamp) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    if (left == 0) {
        return "";
    }
    return entry->values[left - 1];
}

void timeMapFree(TimeMap* obj) {
    struct KeyEntry* current;
    struct KeyEntry* next;
    HASH_ITER(hh, obj->table, current, next) {
        HASH_DEL(obj->table, current);
        for (int i = 0; i < current->size; i++) {
            free(current->values[i]);
        }
        free(current->timestamps);
        free(current->values);
        free(current);
    }
    free(obj);
}
