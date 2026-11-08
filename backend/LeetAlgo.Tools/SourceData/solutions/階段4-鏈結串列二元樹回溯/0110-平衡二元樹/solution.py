# 遞迴計算每棵子樹的高度，順便檢查平衡：左右高度差超過 1，就回傳 -1 代表「不平衡」。
# 只要左或右子樹回傳 -1，就直接一路往上回傳 -1，不用再算下去。
# 最後根節點的結果不是 -1，整棵樹就是平衡的。
# 時間 O(n)，空間 O(h)，h 是樹高。
class Solution:
    def isBalanced(self, root: TreeNode | None) -> bool:
        def get_height(node: TreeNode | None) -> int:
            if node is None:
                return 0
            left_height = get_height(node.left)
            if left_height == -1:
                return -1
            right_height = get_height(node.right)
            if right_height == -1:
                return -1
            if abs(left_height - right_height) > 1:
                return -1
            return max(left_height, right_height) + 1

        return get_height(root) != -1
