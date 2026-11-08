// 定長滑動視窗，每一步分三段：
// 進：nums[i] 加進視窗和；更新：視窗長度到 k 時，用視窗和更新最大值；出：把視窗最左邊的 nums[i - k + 1] 移出去。
// 長度固定是 k，比平均數就等於比總和，最後再除以 k。
// 時間 O(n)，空間 O(1)。
class Solution {
public:
    double findMaxAverage(vector<int>& nums, int k) {
        int maxSum = INT_MIN;
        int windowSum = 0;
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            windowSum += nums[i];
            if (i < k - 1) {
                continue;
            }
            maxSum = max(maxSum, windowSum);
            windowSum -= nums[i - k + 1];
        }
        return (double)maxSum / k;
    }
};
