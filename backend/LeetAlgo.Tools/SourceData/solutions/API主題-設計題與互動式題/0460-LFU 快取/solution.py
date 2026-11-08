# 每個使用次數 freq 各有一條雙向鏈結串列（帶哨兵節點的環狀串列），串列前端是最近用過的，尾端是最久沒用的。
# 另外用雜湊表從 key 找到節點、從 freq 找到它的串列，並記錄目前最小的使用次數 min_freq。
# 一個 key 被 get 或 put 時，把節點從舊次數的串列拿掉、次數加一、放到新次數串列的最前面；
# 如果舊串列因此變空而且它正是 min_freq，min_freq 就跟著加一。
# 容量滿了要淘汰時，取 min_freq 串列的尾端節點，就是使用次數最少、且其中最久沒用的 key。
# 新 key 的使用次數是 1，所以插入後 min_freq 一定變成 1。
# get 和 put 都是 O(1)，空間 O(capacity)。
class Node:
    def __init__(self, key: int, value: int):
        self.key = key
        self.value = value
        self.freq = 1
        self.prev = None
        self.next = None


class LFUCache:

    def __init__(self, capacity: int):
        self.capacity = capacity
        self.key_to_node = {}
        self.freq_to_head = {}
        self.min_freq = 0

    def push_front(self, node: Node) -> None:
        if node.freq not in self.freq_to_head:
            head = Node(0, 0)
            head.prev = head
            head.next = head
            self.freq_to_head[node.freq] = head
        head = self.freq_to_head[node.freq]
        node.prev = head
        node.next = head.next
        head.next.prev = node
        head.next = node

    def remove_node(self, node: Node) -> None:
        node.prev.next = node.next
        node.next.prev = node.prev
        head = self.freq_to_head[node.freq]
        if head.next is head:
            del self.freq_to_head[node.freq]
            if self.min_freq == node.freq:
                self.min_freq += 1

    def increase_freq(self, node: Node) -> None:
        self.remove_node(node)
        node.freq += 1
        self.push_front(node)

    def get(self, key: int) -> int:
        if key not in self.key_to_node:
            return -1
        node = self.key_to_node[key]
        self.increase_freq(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        if key in self.key_to_node:
            node = self.key_to_node[key]
            node.value = value
            self.increase_freq(node)
            return

        if len(self.key_to_node) == self.capacity:
            victim = self.freq_to_head[self.min_freq].prev
            self.remove_node(victim)
            del self.key_to_node[victim.key]

        node = Node(key, value)
        self.key_to_node[key] = node
        self.push_front(node)
        self.min_freq = 1
