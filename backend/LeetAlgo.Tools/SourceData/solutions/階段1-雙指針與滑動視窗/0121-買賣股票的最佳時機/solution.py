# 枚舉賣出的那一天，要賺最多，買入價就要是這天之前的最低價。
# 從左往右走，維護目前為止的最低價（前綴最小值），先用今天的價格減掉它更新答案，再更新最低價。
# 時間 O(n)，空間 O(1)。
class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        min_price = prices[0]
        answer = 0
        for price in prices:
            answer = max(answer, price - min_price)
            min_price = min(min_price, price)
        return answer
