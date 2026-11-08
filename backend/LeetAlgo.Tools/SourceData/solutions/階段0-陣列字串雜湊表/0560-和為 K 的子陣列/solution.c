// 子陣列和 = prefix[右] - prefix[左]，要等於 k，就是找之前出現過幾次 prefix - k。
// 用雜湊表記錄每個前綴和出現的次數，一開始放 {0: 1} 代表空的前綴。
// 要先查 prefix - k 再存目前的 prefix，否則 k = 0 時會把空子陣列也算進去。
// 時間 O(n)，空間 O(n)。
struct PrefixCount {
    int prefix;
    int count;
    UT_hash_handle hh;
};

int getPrefixCount(struct PrefixCount* table, int prefix) {
    struct PrefixCount* found = NULL;
    HASH_FIND_INT(table, &prefix, found);
    if (found == NULL) {
        return 0;
    }
    return found->count;
}

void increasePrefixCount(struct PrefixCount** table, int prefix) {
    struct PrefixCount* found = NULL;
    HASH_FIND_INT(*table, &prefix, found);
    if (found != NULL) {
        found->count++;
        return;
    }

    struct PrefixCount* entry = malloc(sizeof(struct PrefixCount));
    entry->prefix = prefix;
    entry->count = 1;
    HASH_ADD_INT(*table, prefix, entry);
}

int subarraySum(int* nums, int numsSize, int k) {
    struct PrefixCount* table = NULL;
    increasePrefixCount(&table, 0);

    int prefix = 0;
    int answer = 0;
    for (int i = 0; i < numsSize; i++) {
        prefix += nums[i];
        answer += getPrefixCount(table, prefix - k);
        increasePrefixCount(&table, prefix);
    }

    struct PrefixCount* current;
    struct PrefixCount* next;
    HASH_ITER(hh, table, current, next) {
        HASH_DEL(table, current);
        free(current);
    }
    return answer;
}
