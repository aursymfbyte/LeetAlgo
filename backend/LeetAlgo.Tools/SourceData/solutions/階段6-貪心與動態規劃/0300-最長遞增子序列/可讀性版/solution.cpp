// f[i] 表示以 nums[i] 結尾的最長嚴格遞增子序列長度。
// 往前找所有比 nums[i] 小的 nums[j]（j < i），把 nums[i] 接在它後面，f[i] = max(f[j]) + 1；
// 找不到就是只有自己，f[i] = 1。答案是所有 f[i] 的最大值。
// 時間 O(n^2)，空間 O(n)。
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        int n = nums.size();
        vector<int> f(n, 1);
        int answer = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    f[i] = max(f[i], f[j] + 1);
                }
            }
            answer = max(answer, f[i]);
        }
        return answer;
    }
};
