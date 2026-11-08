# 狀態機 DP：not_hold 是當天結束時手上沒股票的最大利潤，hold 是手上有股票的最大利潤。
# 每筆交易只收一次手續費，這裡統一在賣出時扣。
# 今天沒股票：昨天就沒有，或昨天有、今天賣掉並付手續費，not_hold = max(not_hold, hold + price - fee)。
# 今天有股票：昨天就有，或昨天沒有、今天買進，hold = max(hold, not_hold - price)。
# 第 0 天：not_hold = 0、hold = -prices[0]。答案是最後一天的 not_hold。
# 時間 O(n)，空間 O(1)。
class Solution:
    def maxProfit(self, prices: list[int], fee: int) -> int:
        not_hold = 0
        hold = -prices[0]
        for i in range(1, len(prices)):
            price = prices[i]
            new_not_hold = max(not_hold, hold + price - fee)
            new_hold = max(hold, not_hold - price)
            not_hold = new_not_hold
            hold = new_hold
        return not_hold
