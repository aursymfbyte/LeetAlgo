# 遇到左括號就放進堆疊；遇到右括號時，堆疊頂端必須是同種類的左括號，配對成功就把它彈出。
# 最後堆疊必須是空的，代表每個左括號都有被關上。
# 時間 O(n)，空間 O(n)。
class Solution:
    def isValid(self, s: str) -> bool:
        opening_of = {")": "(", "]": "[", "}": "{"}
        stack = []
        for ch in s:
            if ch in opening_of:
                if not stack or stack[-1] != opening_of[ch]:
                    return False
                stack.pop()
            else:
                stack.append(ch)
        return not stack
