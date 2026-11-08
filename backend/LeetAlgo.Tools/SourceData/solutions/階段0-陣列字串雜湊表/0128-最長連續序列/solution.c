// 把數字放進集合。只有當 num - 1 不在集合裡時，num 才是一段連續序列的起點，
// 從起點往上數 num + 1、num + 2…… 直到中斷。每個數最多被數到一次。
// 時間 O(n)，空間 O(n)。
struct NumEntry {
    int key;
    UT_hash_handle hh;
};

bool containsNumber(struct NumEntry* numSet, int value) {
    struct NumEntry* found = NULL;
    HASH_FIND_INT(numSet, &value, found);
    return found != NULL;
}

int longestConsecutive(int* nums, int numsSize) {
    struct NumEntry* numSet = NULL;
    for (int i = 0; i < numsSize; i++) {
        if (containsNumber(numSet, nums[i])) {
            continue;
        }
        struct NumEntry* entry = malloc(sizeof(struct NumEntry));
        entry->key = nums[i];
        HASH_ADD_INT(numSet, key, entry);
    }

    int longest = 0;
    struct NumEntry* current;
    struct NumEntry* next;
    HASH_ITER(hh, numSet, current, next) {
        int num = current->key;
        if (containsNumber(numSet, num - 1)) {
            continue;
        }

        int value = num;
        int length = 1;
        while (containsNumber(numSet, value + 1)) {
            value++;
            length++;
        }
        if (length > longest) {
            longest = length;
        }
    }

    HASH_ITER(hh, numSet, current, next) {
        HASH_DEL(numSet, current);
        free(current);
    }
    return longest;
}
