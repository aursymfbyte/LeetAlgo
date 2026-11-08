// 狀態機 DP：notHold 是當天結束時手上沒股票的最大利潤，hold 是手上有股票的最大利潤。
// 今天沒股票：昨天就沒有，或昨天有、今天賣掉，notHold = max(notHold, hold + price)。
// 今天有股票：昨天就有，或今天買進；但賣出後隔天不能買，所以買進要從「前天」沒股票的狀態轉移過來，
// hold = max(hold, 前天的 notHold - price)。多用一個變數 prevNotHold 記住前天的 notHold。
// 第 0 天：notHold = 0、hold = -prices[0]，第 -1 天的 notHold 視為 0。答案是最後一天的 notHold。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public int MaxProfit(int[] prices) {
        int prevNotHold = 0;
        int notHold = 0;
        int hold = -prices[0];
        for (int i = 1; i < prices.Length; i++) {
            int price = prices[i];
            int newNotHold = Math.Max(notHold, hold + price);
            int newHold = Math.Max(hold, prevNotHold - price);
            prevNotHold = notHold;
            notHold = newNotHold;
            hold = newHold;
        }
        return notHold;
    }
}
