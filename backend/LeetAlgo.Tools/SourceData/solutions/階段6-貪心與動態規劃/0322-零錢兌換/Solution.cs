// 完全背包求最少個數：f[c] 表示湊出金額 c 最少要幾枚硬幣，f[0] = 0，其餘先設成不可能的大值 amount + 1。
// 每種硬幣 coin 讓 f[c] = min(f[c], f[c - coin] + 1)。
// 容量正序枚舉，f[c - coin] 可能已經用過這種硬幣，這正好代表每種硬幣可以重複使用。
// 最後 f[amount] 還是 amount + 1 就代表湊不出來。
// 時間 O(n · amount)，空間 O(amount)。
public class Solution {
    public int CoinChange(int[] coins, int amount) {
        int impossible = amount + 1;
        int[] f = new int[amount + 1];
        Array.Fill(f, impossible);
        f[0] = 0;
        foreach (int coin in coins) {
            for (int c = coin; c <= amount; c++) {
                f[c] = Math.Min(f[c], f[c - coin] + 1);
            }
        }
        if (f[amount] == impossible) {
            return -1;
        }
        return f[amount];
    }
}
