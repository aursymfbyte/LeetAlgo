// 由左往右掃，遇到數字就放進堆疊；遇到運算子，就彈出兩個數字計算，再把結果放回堆疊。
// 先彈出的是右運算元、後彈出的是左運算元，減法和除法的順序不能弄反。
// 時間 O(n)，空間 O(n)。
public class Solution {
    public int EvalRPN(string[] tokens) {
        Stack<int> stack = new Stack<int>();
        foreach (string token in tokens) {
            if (token == "+" || token == "-" || token == "*" || token == "/") {
                int right = stack.Pop();
                int left = stack.Pop();
                if (token == "+") {
                    stack.Push(left + right);
                } else if (token == "-") {
                    stack.Push(left - right);
                } else if (token == "*") {
                    stack.Push(left * right);
                } else {
                    stack.Push(left / right);
                }
            } else {
                stack.Push(int.Parse(token));
            }
        }
        return stack.Peek();
    }
}
