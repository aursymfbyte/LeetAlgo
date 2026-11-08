// 比較 nums[mid] 和 nums[mid + 1]：nums[mid] > nums[mid + 1] 代表在下坡，mid 或它左邊一定有峰值；
// 否則在上坡，mid 右邊一定有峰值。
// 用開區間 (left, right) 二分，left = -1、right = n - 1（最後一個數右邊是 -∞，一定算下坡），
// 保持 left 在上坡、right 在下坡，區間變空時 right 左邊是上坡、自己是下坡，就是峰值。
// 時間 O(log n)，空間 O(1)。
int findPeakElement(int* nums, int numsSize) {
    int left = -1;
    int right = numsSize - 1;
    while (left + 1 < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > nums[mid + 1]) {
            right = mid;
        } else {
            left = mid;
        }
    }
    return right;
}
