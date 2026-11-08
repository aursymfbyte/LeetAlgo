# 用兩個堆疊：push 一律放進 in_stack；要取最前面的元素時，從 out_stack 的頂端拿。
# out_stack 空了才把 in_stack 全部倒過去，倒過去後順序剛好反轉，最早進來的就在頂端。
# 每個元素最多被搬一次，所以每個操作均攤 O(1)，空間 O(n)。
class MyQueue:

    def __init__(self):
        self.in_stack = []
        self.out_stack = []

    def push(self, x: int) -> None:
        self.in_stack.append(x)

    def pop(self) -> int:
        self.move_if_needed()
        return self.out_stack.pop()

    def peek(self) -> int:
        self.move_if_needed()
        return self.out_stack[-1]

    def empty(self) -> bool:
        return not self.in_stack and not self.out_stack

    def move_if_needed(self) -> None:
        if not self.out_stack:
            while self.in_stack:
                self.out_stack.append(self.in_stack.pop())
