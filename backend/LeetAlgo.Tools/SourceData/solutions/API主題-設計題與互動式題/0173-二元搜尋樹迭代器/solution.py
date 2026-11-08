# 用堆疊模擬中序遍歷：先把根一路往左的節點都推進堆疊，堆疊頂端就是目前最小的節點。
# next 時彈出堆疊頂端，再把它右子樹一路往左的節點推進去。
# hasNext 就是堆疊是否非空。
# 每個節點只會進出堆疊一次，next 均攤 O(1)，hasNext O(1)，空間 O(h)，h 是樹高。
class BSTIterator:

    def __init__(self, root: TreeNode | None):
        self.stack = []
        self.push_left(root)

    def push_left(self, node: TreeNode | None) -> None:
        while node is not None:
            self.stack.append(node)
            node = node.left

    def next(self) -> int:
        node = self.stack.pop()
        self.push_left(node.right)
        return node.val

    def hasNext(self) -> bool:
        return len(self.stack) > 0
