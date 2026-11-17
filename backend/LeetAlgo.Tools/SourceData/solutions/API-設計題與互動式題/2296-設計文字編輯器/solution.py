# 對頂堆疊：以游標為界，left 存游標左邊的字元（堆疊頂端緊貼游標），
# right 存游標右邊的字元，而且是倒著存，堆疊頂端同樣緊貼游標。
# 打字就是推進 left；刪除就是從 left 彈出；游標左移一格就是把 left 頂端搬到 right，右移則相反。
# 回傳游標左邊最後 10 個字元，就是 left 的最後 10 個。
# 每次操作 O(k + 10)，空間 O(總輸入長度)。
class TextEditor:

    def __init__(self):
        self.left = []
        self.right = []

    def addText(self, text: str) -> None:
        self.left.extend(text)

    def deleteText(self, k: int) -> int:
        deleted = min(k, len(self.left))
        for _ in range(deleted):
            self.left.pop()
        return deleted

    def cursorLeft(self, k: int) -> str:
        while k > 0 and self.left:
            self.right.append(self.left.pop())
            k -= 1
        return self.text_before_cursor()

    def cursorRight(self, k: int) -> str:
        while k > 0 and self.right:
            self.left.append(self.right.pop())
            k -= 1
        return self.text_before_cursor()

    def text_before_cursor(self) -> str:
        return "".join(self.left[-10:])
