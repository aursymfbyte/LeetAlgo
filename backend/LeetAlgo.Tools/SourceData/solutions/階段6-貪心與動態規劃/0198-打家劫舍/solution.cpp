// 選或不選：f[i] 表示只考慮前 i 間房子（nums[0] 到 nums[i - 1]）最多能偷多少。
// 不偷第 i 間就是 f[i - 1]；偷第 i 間就不能偷第 i - 1 間，是 f[i - 2] + nums[i - 1]，兩者取大。
// 起點 f[0] = 0、f[1] = nums[0]，答案是 f[n]。
// f[i] 只依賴前兩項，所以只用 f0、f1 兩個變數記住 f[i - 2]、f[i - 1]，算完 f[i] 後往前挪一格。
// 時間 O(n)，空間 O(1)。
class Solution {
public:
    int rob(vector<int>& nums) {
        int n = nums.size();
        int f0 = 0;
        int f1 = nums[0];
        for (int i = 2; i <= n; i++) {
            int newF = max(f1, f0 + nums[i - 1]);
            f0 = f1;
            f1 = newF;
        }
        return f1;
    }
};
