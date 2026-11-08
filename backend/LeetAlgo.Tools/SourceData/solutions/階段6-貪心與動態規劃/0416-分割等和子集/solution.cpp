// 兩個子集和相等，代表要從 nums 選出一些數，總和恰好是全部總和的一半（總和是奇數就不可能）。
// 0-1 背包可行性：f[c] 表示目前看過的數中，能不能選出總和恰好為 c 的數，f[0] = true；
// 每個數 num 讓 f[c] = f[c] || f[c - num]。容量倒序枚舉，確保每個數最多選一次。
// 時間 O(n · sum)，空間 O(sum)。
class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int total = 0;
        for (int num : nums) {
            total += num;
        }
        if (total % 2 == 1) {
            return false;
        }
        int half = total / 2;

        vector<bool> f(half + 1, false);
        f[0] = true;
        for (int num : nums) {
            for (int c = half; c >= num; c--) {
                f[c] = f[c] || f[c - num];
            }
        }
        return f[half];
    }
};
