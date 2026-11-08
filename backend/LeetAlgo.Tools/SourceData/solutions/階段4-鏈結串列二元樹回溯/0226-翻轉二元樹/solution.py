# 翻轉一棵樹，就是先把左右子樹各自翻轉好，再把左右兩個孩子交換位置。
# 空樹翻轉後還是空樹。
# 時間 O(n)，空間 O(h)，h 是樹高。
class Solution:
    def invertTree(self, root: TreeNode | None) -> TreeNode | None:
        if root is None:
            return None
        inverted_left = self.invertTree(root.left)
        inverted_right = self.invertTree(root.right)
        root.left = inverted_right
        root.right = inverted_left
        return root
