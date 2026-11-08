// 房子圍成一圈，第一間和最後一間不能同時偷，所以拆成兩種情況各做一次 198 題的線性打家劫舍：
// 不偷最後一間（只看 nums[0] 到 nums[n - 2]），或不偷第一間（只看 nums[1] 到 nums[n - 1]），兩者取大。
// 線性部分：f[i] 表示前 i 間房子最多能偷多少，f[i] = max(f[i - 1], f[i - 2] + 第 i 間的錢)。
// 只有一間房子時沒有相鄰問題，直接偷。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    int rob(vector<int>& nums) {
        int n = nums.size();
        if (n == 1) {
            return nums[0];
        }
        vector<int> withoutLast(nums.begin(), nums.end() - 1);
        vector<int> withoutFirst(nums.begin() + 1, nums.end());
        return max(robLine(withoutLast), robLine(withoutFirst));
    }

private:
    int robLine(vector<int>& houses) {
        int n = houses.size();
        vector<int> f(n + 1, 0);
        f[1] = houses[0];
        for (int i = 2; i <= n; i++) {
            f[i] = max(f[i - 1], f[i - 2] + houses[i - 1]);
        }
        return f[n];
    }
};
