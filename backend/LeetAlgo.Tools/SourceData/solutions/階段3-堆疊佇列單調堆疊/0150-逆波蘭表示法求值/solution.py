# 由左往右掃，遇到數字就放進堆疊；遇到運算子，就彈出兩個數字計算，再把結果放回堆疊。
# 先彈出的是右運算元、後彈出的是左運算元，減法和除法的順序不能弄反。
# 除法要往 0 的方向截斷，所以用 int(left / right)，不能用 //（// 是往下取整）。
# 時間 O(n)，空間 O(n)。
class Solution:
    def evalRPN(self, tokens: list[str]) -> int:
        stack = []
        for token in tokens:
            if token in ("+", "-", "*", "/"):
                right = stack.pop()
                left = stack.pop()
                if token == "+":
                    stack.append(left + right)
                elif token == "-":
                    stack.append(left - right)
                elif token == "*":
                    stack.append(left * right)
                else:
                    stack.append(int(left / right))
            else:
                stack.append(int(token))
        return stack[-1]
