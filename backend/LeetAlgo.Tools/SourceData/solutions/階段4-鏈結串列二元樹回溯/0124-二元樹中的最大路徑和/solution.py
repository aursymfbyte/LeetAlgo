# 跟「二元樹的直徑」同一個想法：每條路徑都有一個最高的轉折點，路徑和 = 轉折點的值 + 左邊往下的最大鏈和 + 右邊往下的最大鏈和。
# 遞迴回傳「從這個節點往下走的最大鏈和」給父節點用；子樹的鏈和如果是負的就不要接，當成 0。
# 回傳給父節點時只能選左右其中一條鏈；答案則用左右兩條鏈都接上的值另外更新。
# 節點值可能全是負數，答案的初始值要設成負無窮大，不能設成 0。
# 時間 O(n)，空間 O(h)，h 是樹高。
class Solution:
    def maxPathSum(self, root: TreeNode | None) -> int:
        answer = float("-inf")

        def max_chain_sum(node: TreeNode | None) -> int:
            nonlocal answer
            if node is None:
                return 0
            left_chain = max(max_chain_sum(node.left), 0)
            right_chain = max(max_chain_sum(node.right), 0)
            answer = max(answer, node.val + left_chain + right_chain)
            return node.val + max(left_chain, right_chain)

        max_chain_sum(root)
        return answer
