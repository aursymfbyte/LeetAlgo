# 用陣列 values 存所有元素，讓 getRandom 可以隨機挑一個下標；
# 再用雜湊表 index_of 記錄每個值在陣列裡的下標，讓 insert / remove 能 O(1) 找到位置。
# 刪除時把陣列最後一個元素搬到被刪的位置、更新它的下標，再刪掉陣列尾端，就不用整段移動。
# 要先更新搬過去那個元素的下標，再從雜湊表刪掉 val，這樣刪的剛好是尾端元素時也正確。
# 每個操作平均 O(1)，空間 O(n)。
import random


class RandomizedSet:

    def __init__(self):
        self.values = []
        self.index_of = {}

    def insert(self, val: int) -> bool:
        if val in self.index_of:
            return False
        self.index_of[val] = len(self.values)
        self.values.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.index_of:
            return False
        index = self.index_of[val]
        last_value = self.values[-1]
        self.values[index] = last_value
        self.index_of[last_value] = index
        self.values.pop()
        del self.index_of[val]
        return True

    def getRandom(self) -> int:
        return self.values[random.randrange(len(self.values))]
