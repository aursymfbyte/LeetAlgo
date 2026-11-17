# 分離鏈結法：開一個長度 1009（質數）的桶陣列，(key, value) 放進第 key % 1009 個桶，
# 同一個桶裡的節點串成一條鏈結串列。
# put 先在桶裡找 key，找到就改 value，找不到才新增節點；remove 找到節點後把它從串列中接掉。
# key 平均分散在各桶時，每次操作 O(n / 1009)，空間 O(n + 1009)，n 是映射大小。
class Node:
    def __init__(self, key: int, value: int, next_node: "Node"):
        self.key = key
        self.value = value
        self.next = next_node


class MyHashMap:

    def __init__(self):
        self.bucket_count = 1009
        self.buckets = [None] * self.bucket_count

    def find_node(self, key: int) -> "Node":
        node = self.buckets[key % self.bucket_count]
        while node is not None:
            if node.key == key:
                return node
            node = node.next
        return None

    def put(self, key: int, value: int) -> None:
        node = self.find_node(key)
        if node is not None:
            node.value = value
            return
        index = key % self.bucket_count
        self.buckets[index] = Node(key, value, self.buckets[index])

    def get(self, key: int) -> int:
        node = self.find_node(key)
        if node is None:
            return -1
        return node.value

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
