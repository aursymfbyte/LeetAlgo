# 用前序遍歷，往下傳「這個節點的值必須落在哪個開區間 (lower, upper) 裡」。
# 往左走時，上界變成目前節點的值；往右走時，下界變成目前節點的值。只要有一個節點不在區間內，就不是 BST。
# 根節點一開始沒有任何限制，上下界設成負無窮大和正無窮大。
# 時間 O(n)，空間 O(h)，h 是樹高。
class Solution:
    def isValidBST(self, root: TreeNode | None) -> bool:
        def is_valid(node: TreeNode | None, lower: float, upper: float) -> bool:
            if node is None:
                return True
            if node.val <= lower or node.val >= upper:
                return False
            return is_valid(node.left, lower, node.val) and is_valid(node.right, node.val, upper)

        return is_valid(root, float("-inf"), float("inf"))
