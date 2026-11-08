// 把結果當成堆疊：遇到字母就放進去，遇到星號就彈出頂端，也就是左邊最近的那個字母，
// 效果就像打字時按退格鍵。最後堆疊裡剩下的字元就是答案。
// 時間 O(n)，空間 O(n)。
public class Solution {
    public string RemoveStars(string s) {
        StringBuilder result = new StringBuilder();
        foreach (char ch in s) {
            if (ch == '*') {
                result.Length--;
            } else {
                result.Append(ch);
            }
        }
        return result.ToString();
    }
}
