// 對頂堆疊：以游標為界，left 存游標左邊的字元（堆疊頂端緊貼游標），
// right 存游標右邊的字元，而且是倒著存，堆疊頂端同樣緊貼游標。
// 打字就是推進 left；刪除就是從 left 彈出；游標左移一格就是把 left 頂端搬到 right，右移則相反。
// 回傳游標左邊最後 10 個字元，就是 left 的最後 10 個。
// 每次操作 O(k + 10)，空間 O(總輸入長度)。
public class TextEditor {
    private StringBuilder left;
    private StringBuilder right;

    public TextEditor() {
        left = new StringBuilder();
        right = new StringBuilder();
    }

    public void AddText(string text) {
        left.Append(text);
    }

    public int DeleteText(int k) {
        int deleted = Math.Min(k, left.Length);
        left.Length -= deleted;
        return deleted;
    }

    public string CursorLeft(int k) {
        while (k > 0 && left.Length > 0) {
            right.Append(left[left.Length - 1]);
            left.Length--;
            k--;
        }
        return TextBeforeCursor();
    }

    public string CursorRight(int k) {
        while (k > 0 && right.Length > 0) {
            left.Append(right[right.Length - 1]);
            right.Length--;
            k--;
        }
        return TextBeforeCursor();
    }

    private string TextBeforeCursor() {
        int count = Math.Min(10, left.Length);
        return left.ToString(left.Length - count, count);
    }
}
