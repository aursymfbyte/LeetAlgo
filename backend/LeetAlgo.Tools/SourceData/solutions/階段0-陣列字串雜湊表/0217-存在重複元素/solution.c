// 用集合記錄看過的數字，遇到已經在集合裡的數字就代表有重複。
// 時間 O(n)，空間 O(n)。
struct NumEntry {
    int key;
    UT_hash_handle hh;
};

bool containsDuplicate(int* nums, int numsSize) {
    struct NumEntry* seen = NULL;
    bool hasDuplicate = false;
    for (int i = 0; i < numsSize; i++) {
        struct NumEntry* found = NULL;
        HASH_FIND_INT(seen, &nums[i], found);
        if (found != NULL) {
            hasDuplicate = true;
            break;
        }

        struct NumEntry* entry = malloc(sizeof(struct NumEntry));
        entry->key = nums[i];
        HASH_ADD_INT(seen, key, entry);
    }

    struct NumEntry* current;
    struct NumEntry* next;
    HASH_ITER(hh, seen, current, next) {
        HASH_DEL(seen, current);
        free(current);
    }
    return hasDuplicate;
}
