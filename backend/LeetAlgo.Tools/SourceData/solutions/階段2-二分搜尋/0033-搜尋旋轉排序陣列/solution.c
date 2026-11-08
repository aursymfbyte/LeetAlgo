// 先用 153 題的方法找出最小值的位置 minIndex，它把陣列切成兩段各自遞增：[0, minIndex) 和 [minIndex, n)。
// 前段的數都比最後一個數大，所以 target > nums[n - 1] 時只可能在前段，否則只可能在後段。
// 在那一段裡找第一個 >= target 的位置，再檢查它是不是 target。
// 兩次二分都用開區間 (left, right)。
// 時間 O(log n)，空間 O(1)。
int findMinIndex(int* nums, int numsSize) {
    int left = -1;
    int right = numsSize - 1;
    while (left + 1 < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] < nums[numsSize - 1]) {
            right = mid;
        } else {
            left = mid;
        }
    }
    return right;
}

int lowerBound(int* nums, int left, int right, int target) {
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

int search(int* nums, int numsSize, int target) {
    int minIndex = findMinIndex(nums, numsSize);
    int index;
    if (target > nums[numsSize - 1]) {
        index = lowerBound(nums, -1, minIndex, target);
    } else {
        index = lowerBound(nums, minIndex - 1, numsSize, target);
    }

    if (index < numsSize && nums[index] == target) {
        return index;
    }
    return -1;
}
