// 寫一個 lowerBound 找第一個 >= target 的位置，其他比較都轉成它：
// 開始位置 = lowerBound(target)；結束位置 = 第一個 > target 的位置 - 1 = lowerBound(target + 1) - 1。
// 如果開始位置超出陣列，或那個數不是 target，代表 target 不存在。
// lowerBound 用開區間 (left, right) 二分，保持 nums[left] < target、nums[right] >= target。
// 時間 O(log n)，空間 O(1)。
int lowerBound(int* nums, int numsSize, int target) {
    int left = -1;
    int right = numsSize;
    while (left + 1 < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] >= target) {
            right = mid;
        } else {
            left = mid;
        }
    }
    return right;
}

int* searchRange(int* nums, int numsSize, int target, int* returnSize) {
    int* result = malloc(sizeof(int) * 2);
    *returnSize = 2;

    int start = lowerBound(nums, numsSize, target);
    if (start == numsSize || nums[start] != target) {
        result[0] = -1;
        result[1] = -1;
        return result;
    }

    result[0] = start;
    result[1] = lowerBound(nums, numsSize, target + 1) - 1;
    return result;
}
