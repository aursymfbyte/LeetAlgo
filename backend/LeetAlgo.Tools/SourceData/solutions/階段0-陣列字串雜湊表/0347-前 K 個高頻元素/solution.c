// 先用雜湊表數出每個數字出現幾次，再做桶排序：buckets[f] 放出現 f 次的數字。
// 出現次數最多是 n，從 n 往下收集，收滿 k 個就是答案。
// 時間 O(n)，空間 O(n)。
struct CountEntry {
    int key;
    int count;
    UT_hash_handle hh;
};

int* topKFrequent(int* nums, int numsSize, int k, int* returnSize) {
    struct CountEntry* countTable = NULL;
    for (int i = 0; i < numsSize; i++) {
        struct CountEntry* found = NULL;
        HASH_FIND_INT(countTable, &nums[i], found);
        if (found == NULL) {
            found = malloc(sizeof(struct CountEntry));
            found->key = nums[i];
            found->count = 0;
            HASH_ADD_INT(countTable, key, found);
        }
        found->count++;
    }

    int* bucketSizes = calloc(numsSize + 1, sizeof(int));
    struct CountEntry* current;
    struct CountEntry* next;
    HASH_ITER(hh, countTable, current, next) {
        bucketSizes[current->count]++;
    }

    int** buckets = malloc(sizeof(int*) * (numsSize + 1));
    for (int frequency = 0; frequency <= numsSize; frequency++) {
        buckets[frequency] = malloc(sizeof(int) * bucketSizes[frequency]);
    }

    int* bucketFilled = calloc(numsSize + 1, sizeof(int));
    HASH_ITER(hh, countTable, current, next) {
        int frequency = current->count;
        buckets[frequency][bucketFilled[frequency]] = current->key;
        bucketFilled[frequency]++;
        HASH_DEL(countTable, current);
        free(current);
    }

    int* result = malloc(sizeof(int) * k);
    int resultCount = 0;
    for (int frequency = numsSize; frequency > 0 && resultCount < k; frequency--) {
        for (int i = 0; i < bucketSizes[frequency] && resultCount < k; i++) {
            result[resultCount] = buckets[frequency][i];
            resultCount++;
        }
    }
    *returnSize = k;

    for (int frequency = 0; frequency <= numsSize; frequency++) {
        free(buckets[frequency]);
    }
    free(buckets);
    free(bucketSizes);
    free(bucketFilled);
    return result;
}
