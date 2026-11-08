// 先排序，相同的數字會排在一起，一段一段數出每個數字出現的次數。
// 再把 (數字, 次數) 依次數由大到小排序，取前 k 個。
// 時間 O(n log n)，空間 O(n)。
struct Frequency {
    int value;
    int count;
};

int compareInts(const void* a, const void* b) {
    int x = *(const int*)a;
    int y = *(const int*)b;
    if (x < y) {
        return -1;
    }
    if (x > y) {
        return 1;
    }
    return 0;
}

int compareByCountDescending(const void* a, const void* b) {
    const struct Frequency* x = a;
    const struct Frequency* y = b;
    return y->count - x->count;
}

int* topKFrequent(int* nums, int numsSize, int k, int* returnSize) {
    qsort(nums, numsSize, sizeof(int), compareInts);

    struct Frequency* frequencies = malloc(sizeof(struct Frequency) * numsSize);
    int distinctCount = 0;
    int start = 0;
    while (start < numsSize) {
        int end = start;
        while (end < numsSize && nums[end] == nums[start]) {
            end++;
        }
        frequencies[distinctCount].value = nums[start];
        frequencies[distinctCount].count = end - start;
        distinctCount++;
        start = end;
    }

    qsort(frequencies, distinctCount, sizeof(struct Frequency), compareByCountDescending);

    int* result = malloc(sizeof(int) * k);
    for (int i = 0; i < k; i++) {
        result[i] = frequencies[i].value;
    }
    *returnSize = k;

    free(frequencies);
    return result;
}
