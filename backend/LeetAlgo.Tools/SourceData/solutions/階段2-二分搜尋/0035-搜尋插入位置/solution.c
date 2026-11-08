// 插入位置就是第一個 >= target 的位置（lower_bound）。
// 用開區間 (left, right) 二分：一開始 left = -1、right = n，保持 nums[left] < target、nums[right] >= target。
// 區間變空時 right 就是答案；target 比所有數都大時答案是 n。
// 時間 O(log n)，空間 O(1)。
int searchInsert(int* nums, int numsSize, int target) {
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
