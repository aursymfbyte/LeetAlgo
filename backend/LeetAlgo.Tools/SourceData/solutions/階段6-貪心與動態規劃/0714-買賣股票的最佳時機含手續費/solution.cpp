// 狀態機 DP：notHold 是當天結束時手上沒股票的最大利潤，hold 是手上有股票的最大利潤。
// 每筆交易只收一次手續費，這裡統一在賣出時扣。
// 今天沒股票：昨天就沒有，或昨天有、今天賣掉並付手續費，notHold = max(notHold, hold + price - fee)。
// 今天有股票：昨天就有，或昨天沒有、今天買進，hold = max(hold, notHold - price)。
// 第 0 天：notHold = 0、hold = -prices[0]。答案是最後一天的 notHold。
// 時間 O(n)，空間 O(1)。
class Solution {
public:
    int maxProfit(vector<int>& prices, int fee) {
        int n = prices.size();
        int notHold = 0;
        int hold = -prices[0];
        for (int i = 1; i < n; i++) {
            int price = prices[i];
            int newNotHold = max(notHold, hold + price - fee);
            int newHold = max(hold, notHold - price);
            notHold = newNotHold;
            hold = newHold;
        }
        return notHold;
    }
};
