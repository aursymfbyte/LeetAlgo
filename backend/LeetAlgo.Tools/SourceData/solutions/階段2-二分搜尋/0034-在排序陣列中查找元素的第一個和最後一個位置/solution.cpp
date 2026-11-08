// 寫一個 lowerBound 找第一個 >= target 的位置，其他比較都轉成它：
// 開始位置 = lowerBound(target)；結束位置 = 第一個 > target 的位置 - 1 = lowerBound(target + 1) - 1。
// 如果開始位置超出陣列，或那個數不是 target，代表 target 不存在。
// lowerBound 用開區間 (left, right) 二分，保持 nums[left] < target、nums[right] >= target。
// 時間 O(log n)，空間 O(1)。
class Solution {
public:
    vector<int> searchRange(vector<int>& nums, int target) {
        int n = nums.size();
        int start = lowerBound(nums, target);
        if (start == n || nums[start] != target) {
            return {-1, -1};
        }
        int end = lowerBound(nums, target + 1) - 1;
        return {start, end};
    }

private:
    int lowerBound(vector<int>& nums, int target) {
        int left = -1;
        int right = nums.size();
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
};
