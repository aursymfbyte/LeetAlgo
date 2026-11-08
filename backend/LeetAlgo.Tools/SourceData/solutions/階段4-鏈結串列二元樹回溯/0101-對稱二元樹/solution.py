# 整棵樹對稱，就是根的左子樹和右子樹互為鏡像。
# 做法跟「相同的樹」一樣同時遞迴兩棵樹，只是要外側比外側（左的左 vs 右的右）、內側比內側（左的右 vs 右的左）。
# 時間 O(n)，空間 O(h)，h 是樹高。
class Solution:
    def isSymmetric(self, root: TreeNode | None) -> bool:
        def is_mirror(left: TreeNode | None, right: TreeNode | None) -> bool:
            if left is None and right is None:
                return True
            if left is None or right is None:
                return False
            if left.val != right.val:
                return False
            return is_mirror(left.left, right.right) and is_mirror(left.right, right.left)

        return is_mirror(root.left, root.right)
