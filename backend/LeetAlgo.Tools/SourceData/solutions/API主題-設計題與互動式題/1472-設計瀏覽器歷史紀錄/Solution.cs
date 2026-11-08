// 用一個陣列依序存瀏覽過的網址，current 是目前所在的位置，last 是還能往前走到的最後位置。
// visit 時把網址寫在 current + 1，並把 last 設成新的 current，等於丟掉原本的前進紀錄。
// back / forward 只要移動 current，並夾在 0 和 last 之間。
// visit 均攤 O(1)，back / forward 都是 O(1)，空間 O(n)。
public class BrowserHistory {
    private List<string> history;
    private int current;
    private int last;

    public BrowserHistory(string homepage) {
        history = new List<string>();
        history.Add(homepage);
        current = 0;
        last = 0;
    }

    public void Visit(string url) {
        current++;
        if (current == history.Count) {
            history.Add(url);
        } else {
            history[current] = url;
        }
        last = current;
    }

    public string Back(int steps) {
        current = Math.Max(0, current - steps);
        return history[current];
    }

    public string Forward(int steps) {
        current = Math.Min(last, current + steps);
        return history[current];
    }
}
