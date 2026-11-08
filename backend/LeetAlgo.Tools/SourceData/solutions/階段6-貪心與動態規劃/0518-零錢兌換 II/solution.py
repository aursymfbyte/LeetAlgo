# 完全背包求方案數：f[c] 表示用目前看過的硬幣湊出金額 c 的組合數，f[0] = 1（什麼都不拿）。
# 每種硬幣 coin 讓 f[c] += f[c - coin]，容量正序枚舉代表同一種硬幣可以重複使用。
# 外層枚舉硬幣、內層枚舉金額，硬幣是按固定順序加入的，所以 1 + 2 和 2 + 1 只會算成一種組合。
# 時間 O(n · amount)，空間 O(amount)。
class Solution:
    def change(self, amount: int, coins: list[int]) -> int:
        f = [0] * (amount + 1)
        f[0] = 1
        for coin in coins:
            for c in range(coin, amount + 1):
                f[c] += f[c - coin]
        return f[amount]
