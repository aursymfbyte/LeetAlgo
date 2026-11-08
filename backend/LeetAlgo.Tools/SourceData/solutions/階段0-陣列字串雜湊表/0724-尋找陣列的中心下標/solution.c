// 先算出總和，再從左往右累加左邊的和；右邊的和就是 總和 - 左邊 - nums[i]，兩邊相等就是答案。
// 時間 O(n)，空間 O(1)。
int pivotIndex(int* nums, int numsSize) {
    int total = 0;
    for (int i = 0; i < numsSize; i++) {
        total += nums[i];
    }

    int leftSum = 0;
    for (int i = 0; i < numsSize; i++) {
        int rightSum = total - leftSum - nums[i];
        if (leftSum == rightSum) {
            return i;
        }
        leftSum += nums[i];
    }
    return -1;
}
