// 先排序，再從左往右看相鄰兩數：相等就跳過，差 1 就延長目前的序列，否則重新從 1 開始數。
// 時間 O(n log n)，空間 O(log n)（排序用）。
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

int longestConsecutive(int* nums, int numsSize) {
    if (numsSize == 0) {
        return 0;
    }

    qsort(nums, numsSize, sizeof(int), compareInts);

    int longest = 1;
    int current = 1;
    for (int i = 1; i < numsSize; i++) {
        if (nums[i] == nums[i - 1]) {
            continue;
        }

        if (nums[i] == nums[i - 1] + 1) {
            current++;
        } else {
            current = 1;
        }

        if (current > longest) {
            longest = current;
        }
    }
    return longest;
}
