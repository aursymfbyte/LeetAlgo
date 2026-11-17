# 分離鏈結法：開一個長度 1009（質數）的桶陣列，key 放進第 key % 1009 個桶，
# 同一個桶裡的 key 串成一條鏈結串列。
# 新增前先在桶裡找，找到就不重複加；刪除時找到節點後把它從串列中接掉。
# key 平均分散在各桶時，每次操作 O(n / 1009)，空間 O(n + 1009)，n 是集合大小。
class Node:
    def __init__(self, key: int, next_node: "Node"):
        self.key = key
        self.next = next_node


class MyHashSet:

    def __init__(self):
        self.bucket_count = 1009
        self.buckets = [None] * self.bucket_count

    def add(self, key: int) -> None:
        if self.contains(key):
            return
        index = key % self.bucket_count
        self.buckets[index] = Node(key, self.buckets[index])

    def remove(self, key: int) -> None:
        index = key % self.bucket_count
        previous = None
        current = self.buckets[index]
        while current is not None:
            if current.key == key:
                if previous is None:
                    self.buckets[index] = current.next
                else:
                    previous.next = current.next
                return
            previous = current
            current = current.next

    def contains(self, key: int) -> bool:
        node = self.buckets[key % self.bucket_count]
        while node is not None:
            if node.key == key:
                return True
            node = node.next
        return False
