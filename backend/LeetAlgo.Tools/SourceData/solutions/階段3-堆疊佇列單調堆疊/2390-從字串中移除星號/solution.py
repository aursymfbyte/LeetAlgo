# 把結果當成堆疊：遇到字母就放進去，遇到星號就彈出頂端，也就是左邊最近的那個字母，
# 效果就像打字時按退格鍵。最後堆疊裡剩下的字元就是答案。
# 時間 O(n)，空間 O(n)。
class Solution:
    def removeStars(self, s: str) -> str:
        stack = []
        for ch in s:
            if ch == "*":
                stack.pop()
            else:
                stack.append(ch)
        return "".join(stack)
