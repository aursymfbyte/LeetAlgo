// 先算出總和，再從左往右累加左邊的和；右邊的和就是 總和 - 左邊 - nums[i]，兩邊相等就是答案。
// 時間 O(n)，空間 O(1)。
class Solution {
public:
    int pivotIndex(vector<int>& nums) {
        int total = 0;
        for (int num : nums) {
            total += num;
        }

        int n = nums.size();
        int leftSum = 0;
        for (int i = 0; i < n; i++) {
            int rightSum = total - leftSum - nums[i];
            if (leftSum == rightSum) {
                return i;
            }
            leftSum += nums[i];
        }
        return -1;
    }
};
