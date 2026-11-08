// 由左往右掃，current 是目前這一層正在組的字串，count 是正在讀的重複次數（可能有好幾位數）。
// 遇到 '[' 代表進入新的一層：把「外層已組好的字串」和「這層要重複幾次」存進堆疊，再清空重新開始。
// 遇到 ']' 代表這一層結束：從堆疊取回外層字串和次數，外層字串 + current 重複 k 次，就是新的 current。
// 時間 O(答案長度)，空間 O(答案長度)。
public class Solution {
    public string DecodeString(string s) {
        Stack<string> savedStrings = new Stack<string>();
        Stack<int> savedCounts = new Stack<int>();
        StringBuilder current = new StringBuilder();
        int count = 0;

        foreach (char ch in s) {
            if (char.IsDigit(ch)) {
                count = count * 10 + (ch - '0');
            } else if (ch == '[') {
                savedStrings.Push(current.ToString());
                savedCounts.Push(count);
                current = new StringBuilder();
                count = 0;
            } else if (ch == ']') {
                string inner = current.ToString();
                int repeat = savedCounts.Pop();
                current = new StringBuilder(savedStrings.Pop());
                for (int i = 0; i < repeat; i++) {
                    current.Append(inner);
                }
            } else {
                current.Append(ch);
            }
        }
        return current.ToString();
    }
}
