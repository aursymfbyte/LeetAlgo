# 狀態機 DP：not_hold 是當天結束時手上沒股票的最大利潤，hold 是手上有股票的最大利潤。
# 今天沒股票：昨天就沒有，或昨天有、今天賣掉，not_hold = max(not_hold, hold + price)。
# 今天有股票：昨天就有，或今天買進；但賣出後隔天不能買，所以買進要從「前天」沒股票的狀態轉移過來，
# hold = max(hold, 前天的 not_hold - price)。多用一個變數 prev_not_hold 記住前天的 not_hold。
# 第 0 天：not_hold = 0、hold = -prices[0]，第 -1 天的 not_hold 視為 0。答案是最後一天的 not_hold。
# 時間 O(n)，空間 O(1)。
class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        prev_not_hold = 0
        not_hold = 0
        hold = -prices[0]
        for i in range(1, len(prices)):
            price = prices[i]
            new_not_hold = max(not_hold, hold + price)
            new_hold = max(hold, prev_not_hold - price)
            prev_not_hold = not_hold
            not_hold = new_not_hold
            hold = new_hold
        return not_hold
