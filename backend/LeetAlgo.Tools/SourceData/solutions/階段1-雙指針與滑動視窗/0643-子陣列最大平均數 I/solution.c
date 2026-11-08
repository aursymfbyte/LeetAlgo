// 定長滑動視窗，每一步分三段：
// 進：nums[i] 加進視窗和；更新：視窗長度到 k 時，用視窗和更新最大值；出：把視窗最左邊的 nums[i - k + 1] 移出去。
// 長度固定是 k，比平均數就等於比總和，最後再除以 k。
// 時間 O(n)，空間 O(1)。
double findMaxAverage(int* nums, int numsSize, int k) {
    int maxSum = INT_MIN;
    int windowSum = 0;
    for (int i = 0; i < numsSize; i++) {
        windowSum += nums[i];
        if (i < k - 1) {
            continue;
        }
        if (windowSum > maxSum) {
            maxSum = windowSum;
        }
        windowSum -= nums[i - k + 1];
    }
    return (double)maxSum / k;
}
