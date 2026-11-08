# 除了存放元素的堆疊 values，再開一個同步的堆疊 mins：
# mins 的每一層記錄「從底部到這一層為止的最小值」，push 和 pop 時兩個堆疊一起動。
# 這樣不管彈出多少次，mins 的頂端永遠是目前堆疊裡的最小值。
# 每個操作 O(1)，空間 O(n)。
class MinStack:

    def __init__(self):
        self.values = []
        self.mins = []

    def push(self, value: int) -> None:
        self.values.append(value)
        if not self.mins:
            self.mins.append(value)
        else:
            self.mins.append(min(value, self.mins[-1]))

    def pop(self) -> None:
        self.values.pop()
        self.mins.pop()

    def top(self) -> int:
        return self.values[-1]

    def getMin(self) -> int:
        return self.mins[-1]
