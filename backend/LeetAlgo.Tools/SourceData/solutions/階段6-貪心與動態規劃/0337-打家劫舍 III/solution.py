# 樹形 DP（選或不選）：dfs(node) 回傳兩個值，(偷 node 時子樹的最大金額, 不偷 node 時子樹的最大金額)。
# 偷 node：兩個子節點都不能偷，金額是 node.val + 左不偷 + 右不偷。
# 不偷 node：每個子節點可偷可不偷，各自取較大者，金額是 max(左偷, 左不偷) + max(右偷, 右不偷)。
# 空節點回傳 (0, 0)，答案是根節點兩個值中較大的。
# 時間 O(n)，空間 O(h)，h 是樹高（遞迴深度）。
class Solution:
    def rob(self, root: TreeNode | None) -> int:
        robbed, not_robbed = self.dfs(root)
        return max(robbed, not_robbed)

    def dfs(self, node: TreeNode | None) -> tuple[int, int]:
        if node is None:
            return 0, 0
        left_robbed, left_not_robbed = self.dfs(node.left)
        right_robbed, right_not_robbed = self.dfs(node.right)
        robbed = node.val + left_not_robbed + right_not_robbed
        not_robbed = max(left_robbed, left_not_robbed) + max(right_robbed, right_not_robbed)
        return robbed, not_robbed
