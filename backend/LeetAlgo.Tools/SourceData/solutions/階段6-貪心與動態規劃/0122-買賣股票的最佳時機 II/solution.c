// 狀態機 DP：每天結束時只有兩種狀態，notHold 是手上沒股票時的最大利潤，hold 是手上有股票時的最大利潤。
// 今天沒股票：昨天就沒有，或昨天有、今天賣掉，notHold = max(notHold, hold + price)。
// 今天有股票：昨天就有，或昨天沒有、今天買進，hold = max(hold, notHold - price)。
// 第 0 天：沒股票利潤是 0，有股票就是買了第 0 天的股票，利潤 -prices[0]。答案是最後一天的 notHold。
// 時間 O(n)，空間 O(1)。
int maxInt(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

int maxProfit(int* prices, int pricesSize) {
    int notHold = 0;
    int hold = -prices[0];
    for (int i = 1; i < pricesSize; i++) {
        int price = prices[i];
        int newNotHold = maxInt(notHold, hold + price);
        int newHold = maxInt(hold, notHold - price);
        notHold = newNotHold;
        hold = newHold;
    }
    return notHold;
}
