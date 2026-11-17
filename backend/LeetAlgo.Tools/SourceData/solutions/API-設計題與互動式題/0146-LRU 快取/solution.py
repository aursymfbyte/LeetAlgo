# 用雜湊表把 key 對應到鏈結串列的節點，讓 get / put 能 O(1) 找到資料；
# 再用帶頭尾哨兵的雙向鏈結串列依照使用時間排列：頭哨兵後面是最近用過的，尾哨兵前面是最久沒用的。
# 每次 get 或 put 用到某個 key，就把它的節點移到最前面；容量超過時，刪掉尾哨兵前面那個節點。
# 節點裡要存 key，淘汰時才知道要從雜湊表刪掉哪個 key。
# get / put 都是 O(1)，空間 O(capacity)。
class CacheNode:
    def __init__(self, key: int, value: int):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.nodes = {}
        self.head = CacheNode(0, 0)
        self.tail = CacheNode(0, 0)
        self.head.next = self.tail
        self.tail.prev = self.head

    def remove_node(self, node: CacheNode) -> None:
        node.prev.next = node.next
        node.next.prev = node.prev

    def add_to_front(self, node: CacheNode) -> None:
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node

    def get(self, key: int) -> int:
        if key not in self.nodes:
            return -1
        node = self.nodes[key]
        self.remove_node(node)
        self.add_to_front(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        if key in self.nodes:
            node = self.nodes[key]
            node.value = value
            self.remove_node(node)
            self.add_to_front(node)
            return

        node = CacheNode(key, value)
        self.nodes[key] = node
        self.add_to_front(node)
        if len(self.nodes) > self.capacity:
            least_recent = self.tail.prev
            self.remove_node(least_recent)
            del self.nodes[least_recent.key]
