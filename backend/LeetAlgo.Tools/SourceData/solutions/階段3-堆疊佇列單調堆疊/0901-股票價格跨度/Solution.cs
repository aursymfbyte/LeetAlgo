// 單調堆疊：堆疊裡放之前的價格和它的跨度，由底到頂價格嚴格遞減。
// 今天的價格進來時，頂端只要 <= 今天，它涵蓋的那些天也都 <= 今天，
// 就把它的跨度加到今天身上再彈出，直到遇到比今天高的價格為止，最後把今天放進堆疊。
// 每個價格最多進出堆疊一次，Next 均攤 O(1)，空間 O(n)。
public class StockSpanner {
    private Stack<int> prices;
    private Stack<int> spans;

    public StockSpanner() {
        prices = new Stack<int>();
        spans = new Stack<int>();
    }

    public int Next(int price) {
        int span = 1;
        while (prices.Count > 0 && prices.Peek() <= price) {
            prices.Pop();
            span += spans.Pop();
        }
        prices.Push(price);
        spans.Push(span);
        return span;
    }
}
