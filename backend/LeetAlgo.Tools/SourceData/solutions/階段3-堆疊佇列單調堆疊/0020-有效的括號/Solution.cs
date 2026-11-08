// 遇到左括號就放進堆疊；遇到右括號時，堆疊頂端必須是同種類的左括號，配對成功就把它彈出。
// 最後堆疊必須是空的，代表每個左括號都有被關上。
// 時間 O(n)，空間 O(n)。
public class Solution {
    public bool IsValid(string s) {
        Dictionary<char, char> openingOf = new Dictionary<char, char> {
            { ')', '(' },
            { ']', '[' },
            { '}', '{' }
        };
        Stack<char> stack = new Stack<char>();
        foreach (char ch in s) {
            if (openingOf.ContainsKey(ch)) {
                if (stack.Count == 0 || stack.Peek() != openingOf[ch]) {
                    return false;
                }
                stack.Pop();
            } else {
                stack.Push(ch);
            }
        }
        return stack.Count == 0;
    }
}
