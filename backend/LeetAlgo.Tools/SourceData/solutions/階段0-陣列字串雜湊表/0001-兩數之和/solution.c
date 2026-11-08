// 用雜湊表記錄看過的數字和它的下標，每走到一個數，就查 target - num 有沒有出現過。
// 先查再存，才不會把同一個元素用兩次。
// 時間 O(n)，空間 O(n)。
struct HashEntry {
    int key;
    int index;
    UT_hash_handle hh;
};

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    struct HashEntry* table = NULL;
    int* result = malloc(sizeof(int) * 2);
    *returnSize = 0;

    for (int i = 0; i < numsSize; i++) {
        int need = target - nums[i];
        struct HashEntry* found = NULL;
        HASH_FIND_INT(table, &need, found);
        if (found != NULL) {
            result[0] = found->index;
            result[1] = i;
            *returnSize = 2;
            break;
        }

        struct HashEntry* entry = malloc(sizeof(struct HashEntry));
        entry->key = nums[i];
        entry->index = i;
        HASH_ADD_INT(table, key, entry);
    }

    struct HashEntry* current;
    struct HashEntry* next;
    HASH_ITER(hh, table, current, next) {
        HASH_DEL(table, current);
        free(current);
    }
    return result;
}
