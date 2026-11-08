# 用雙向鏈結串列，頭尾各放一個哨兵節點，真正的節點都夾在兩個哨兵之間，
# 這樣插入、刪除時每個節點一定有前後鄰居，不用特別處理頭尾。
# 找第 index 個節點時，看它離頭近還是離尾近，從近的那一端走過去。
# 第 size 個「節點」剛好是尾哨兵，所以 addAtIndex(size, val) 就是插在尾哨兵前面。
# 每個操作 O(min(index, size - index))，空間 O(n)。
class LinkedNode:
    def __init__(self, val: int):
        self.val = val
        self.prev = None
        self.next = None


class MyLinkedList:

    def __init__(self):
        self.head = LinkedNode(0)
        self.tail = LinkedNode(0)
        self.head.next = self.tail
        self.tail.prev = self.head
        self.size = 0

    def node_at(self, index: int) -> LinkedNode:
        if index < self.size // 2:
            node = self.head.next
            for _ in range(index):
                node = node.next
        else:
            node = self.tail
            for _ in range(self.size - index):
                node = node.prev
        return node

    def get(self, index: int) -> int:
        if index >= self.size:
            return -1
        return self.node_at(index).val

    def addAtHead(self, val: int) -> None:
        self.addAtIndex(0, val)

    def addAtTail(self, val: int) -> None:
        self.addAtIndex(self.size, val)

    def addAtIndex(self, index: int, val: int) -> None:
        if index > self.size:
            return
        next_node = self.node_at(index)
        prev_node = next_node.prev
        new_node = LinkedNode(val)
        new_node.prev = prev_node
        new_node.next = next_node
        prev_node.next = new_node
        next_node.prev = new_node
        self.size += 1

    def deleteAtIndex(self, index: int) -> None:
        if index >= self.size:
            return
        node = self.node_at(index)
        node.prev.next = node.next
        node.next.prev = node.prev
        self.size -= 1
