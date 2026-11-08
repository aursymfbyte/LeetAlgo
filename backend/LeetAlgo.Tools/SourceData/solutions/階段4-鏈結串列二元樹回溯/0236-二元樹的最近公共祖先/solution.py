# 分類討論。如果目前節點是空的，或者就是 p 或 q，直接回傳目前節點。
# 否則到左右子樹去找：左右兩邊都找到東西，代表 p、q 分在兩側，目前節點就是最近公共祖先；
# 只有一邊找到，代表 p、q 都在那一側，回傳那一邊的結果；兩邊都沒找到就回傳空。
# 時間 O(n)，空間 O(h)，h 是樹高。
class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        if root is None or root is p or root is q:
            return root
        left_result = self.lowestCommonAncestor(root.left, p, q)
        right_result = self.lowestCommonAncestor(root.right, p, q)
        if left_result is not None and right_result is not None:
            return root
        if left_result is not None:
            return left_result
        return right_result
