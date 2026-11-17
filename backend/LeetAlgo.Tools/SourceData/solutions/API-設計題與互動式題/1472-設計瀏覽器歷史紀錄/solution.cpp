// 用一個陣列依序存瀏覽過的網址，current 是目前所在的位置，last 是還能往前走到的最後位置。
// visit 時把網址寫在 current + 1，並把 last 設成新的 current，等於丟掉原本的前進紀錄。
// back / forward 只要移動 current，並夾在 0 和 last 之間。
// visit 均攤 O(1)，back / forward 都是 O(1)，空間 O(n)。
class BrowserHistory {
private:
    vector<string> history;
    int current;
    int last;

public:
    BrowserHistory(string homepage) {
        history.push_back(homepage);
        current = 0;
        last = 0;
    }

    void visit(string url) {
        current++;
        int historySize = history.size();
        if (current == historySize) {
            history.push_back(url);
        } else {
            history[current] = url;
        }
        last = current;
    }

    string back(int steps) {
        current = max(0, current - steps);
        return history[current];
    }

    string forward(int steps) {
        current = min(last, current + steps);
        return history[current];
    }
};
