# 兩棵樹相同，代表根節點的值一樣，而且左子樹跟左子樹相同、右子樹跟右子樹相同。
# 同時遞迴兩棵樹：兩邊都是空的算相同；只有一邊是空的，或值不一樣，就不同。
# 時間 O(min(n, m))，空間 O(min(h1, h2))，n、m 是兩棵樹的節點數，h1、h2 是兩棵樹的高度。
class Solution:
    def isSameTree(self, p: TreeNode | None, q: TreeNode | None) -> bool:
        if p is None and q is None:
            return True
        if p is None or q is None:
            return False
        if p.val != q.val:
            return False
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)
