// 建立前綴和 prefix[i] = nums[0] 到 nums[i - 1] 的總和，
// 區間 [left, right] 的和就是 prefix[right + 1] - prefix[left]。
// 建構 O(n)，每次查詢 O(1)，空間 O(n)。
typedef struct {
    int* prefix;
} NumArray;

NumArray* numArrayCreate(int* nums, int numsSize) {
    NumArray* obj = malloc(sizeof(NumArray));
    obj->prefix = malloc(sizeof(int) * (numsSize + 1));
    obj->prefix[0] = 0;
    for (int i = 0; i < numsSize; i++) {
        obj->prefix[i + 1] = obj->prefix[i] + nums[i];
    }
    return obj;
}

int numArraySumRange(NumArray* obj, int left, int right) {
    return obj->prefix[right + 1] - obj->prefix[left];
}

void numArrayFree(NumArray* obj) {
    free(obj->prefix);
    free(obj);
}
