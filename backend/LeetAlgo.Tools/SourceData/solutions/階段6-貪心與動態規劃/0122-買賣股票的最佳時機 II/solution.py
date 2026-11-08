# 狀態機 DP：每天結束時只有兩種狀態，not_hold 是手上沒股票時的最大利潤，hold 是手上有股票時的最大利潤。
# 今天沒股票：昨天就沒有，或昨天有、今天賣掉，not_hold = max(not_hold, hold + price)。
# 今天有股票：昨天就有，或昨天沒有、今天買進，hold = max(hold, not_hold - price)。
# 第 0 天：沒股票利潤是 0，有股票就是買了第 0 天的股票，利潤 -prices[0]。答案是最後一天的 not_hold。
# 時間 O(n)，空間 O(1)。
class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        not_hold = 0
        hold = -prices[0]
        for i in range(1, len(prices)):
            price = prices[i]
            new_not_hold = max(not_hold, hold + price)
            new_hold = max(hold, not_hold - price)
            not_hold = new_not_hold
            hold = new_hold
        return not_hold
