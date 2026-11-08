// 完全背包求方案數：f[c] 表示用目前看過的硬幣湊出金額 c 的組合數，f[0] = 1（什麼都不拿）。
// 每種硬幣 coin 讓 f[c] += f[c - coin]，容量正序枚舉代表同一種硬幣可以重複使用。
// 外層枚舉硬幣、內層枚舉金額，硬幣是按固定順序加入的，所以 1 + 2 和 2 + 1 只會算成一種組合。
// 題目只保證 f[amount] 在 32 位元範圍內，中間其他金額的方案數可能超過，
// 所以用無號整數存，溢位時等於自動對 2^32 取模；最後答案小於 2^31，取模後的值就是正確答案。
// 時間 O(n · amount)，空間 O(amount)。
public class Solution {
    public int Change(int amount, int[] coins) {
        uint[] f = new uint[amount + 1];
        f[0] = 1;
        foreach (int coin in coins) {
            for (int c = coin; c <= amount; c++) {
                f[c] += f[c - coin];
            }
        }
        return (int)f[amount];
    }
}
