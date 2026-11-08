// f[i] 表示站上第 i 階（還沒付第 i 階的費用）所需的最小花費。
// 走到第 i 階前一步一定站在第 i - 1 或第 i - 2 階，付完那一階的費用再往上走，
// 所以 f[i] = min(f[i - 1] + cost[i - 1], f[i - 2] + cost[i - 2])，起點 f[0] = f[1] = 0，答案是 f[n]。
// f[i] 只依賴前兩項，所以只用 f0、f1 兩個變數記住 f[i - 2]、f[i - 1]，算完 f[i] 後往前挪一格。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public int MinCostClimbingStairs(int[] cost) {
        int n = cost.Length;
        int f0 = 0;
        int f1 = 0;
        for (int i = 2; i <= n; i++) {
            int newF = Math.Min(f1 + cost[i - 1], f0 + cost[i - 2]);
            f0 = f1;
            f1 = newF;
        }
        return f1;
    }
}
