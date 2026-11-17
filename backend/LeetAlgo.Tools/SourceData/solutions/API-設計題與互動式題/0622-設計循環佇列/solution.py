# 用長度 k 的陣列當成一個環，記錄隊首下標 head 和目前元素個數 count。
# 隊尾的下一格是 (head + count) % k，隊尾元素在 (head + count - 1) % k。
# 用 count 判斷空和滿，就不用特地空出一格來區分兩種狀態。
# 每個操作都是 O(1)，空間 O(k)。
class MyCircularQueue:

    def __init__(self, k: int):
        self.items = [0] * k
        self.capacity = k
        self.head = 0
        self.count = 0

    def enQueue(self, value: int) -> bool:
        if self.isFull():
            return False
        tail = (self.head + self.count) % self.capacity
        self.items[tail] = value
        self.count += 1
        return True

    def deQueue(self) -> bool:
        if self.isEmpty():
            return False
        self.head = (self.head + 1) % self.capacity
        self.count -= 1
        return True

    def Front(self) -> int:
        if self.isEmpty():
            return -1
        return self.items[self.head]

    def Rear(self) -> int:
        if self.isEmpty():
            return -1
        rear = (self.head + self.count - 1) % self.capacity
        return self.items[rear]

    def isEmpty(self) -> bool:
        return self.count == 0

    def isFull(self) -> bool:
        return self.count == self.capacity
