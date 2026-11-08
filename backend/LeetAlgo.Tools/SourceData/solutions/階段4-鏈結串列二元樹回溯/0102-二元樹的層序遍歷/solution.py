# 用佇列做 BFS。每一輪開始時佇列裡剛好是同一層的所有節點，先記下佇列的大小就是這一層的節點數。
# 把這一層的節點依序取出、記錄它們的值，同時把它們的左右孩子放進佇列，佇列裡留下的就是下一層。
# 時間 O(n)，空間 O(n)。
from collections import deque


class Solution:
    def levelOrder(self, root: TreeNode | None) -> list[list[int]]:
        result = []
        if root is None:
            return result

        queue = deque([root])
        while queue:
            level_values = []
            level_size = len(queue)
            for _ in range(level_size):
                node = queue.popleft()
                level_values.append(node.val)
                if node.left is not None:
                    queue.append(node.left)
                if node.right is not None:
                    queue.append(node.right)
            result.append(level_values)
        return result
