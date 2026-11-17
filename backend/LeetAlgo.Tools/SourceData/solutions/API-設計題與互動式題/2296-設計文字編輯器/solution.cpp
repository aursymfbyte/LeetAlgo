// 對頂堆疊：以游標為界，left 存游標左邊的字元（堆疊頂端緊貼游標），
// right 存游標右邊的字元，而且是倒著存，堆疊頂端同樣緊貼游標。
// 打字就是推進 left；刪除就是從 left 彈出；游標左移一格就是把 left 頂端搬到 right，右移則相反。
// 回傳游標左邊最後 10 個字元，就是 left 的最後 10 個。
// 每次操作 O(k + 10)，空間 O(總輸入長度)。
class TextEditor {
private:
    string left;
    string right;

    string textBeforeCursor() {
        int leftSize = left.size();
        int count = min(10, leftSize);
        return left.substr(leftSize - count, count);
    }

public:
    TextEditor() {
    }

    void addText(string text) {
        left += text;
    }

    int deleteText(int k) {
        int leftSize = left.size();
        int deleted = min(k, leftSize);
        left.resize(leftSize - deleted);
        return deleted;
    }

    string cursorLeft(int k) {
        while (k > 0 && !left.empty()) {
            right.push_back(left.back());
            left.pop_back();
            k--;
        }
        return textBeforeCursor();
    }

    string cursorRight(int k) {
        while (k > 0 && !right.empty()) {
            left.push_back(right.back());
            right.pop_back();
            k--;
        }
        return textBeforeCursor();
    }
};
