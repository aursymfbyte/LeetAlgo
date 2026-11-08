// f[i] 表示站上第 i 階（還沒付第 i 階的費用）所需的最小花費。
// 走到第 i 階前一步一定站在第 i - 1 或第 i - 2 階，付完那一階的費用再往上走，
// 所以 f[i] = min(f[i - 1] + cost[i - 1], f[i - 2] + cost[i - 2])，起點 f[0] = f[1] = 0，答案是 f[n]。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    int minCostClimbingStairs(vector<int>& cost) {
        int n = cost.size();
        vector<int> f(n + 1, 0);
        for (int i = 2; i <= n; i++) {
            f[i] = min(f[i - 1] + cost[i - 1], f[i - 2] + cost[i - 2]);
        }
        return f[n];
    }
};
