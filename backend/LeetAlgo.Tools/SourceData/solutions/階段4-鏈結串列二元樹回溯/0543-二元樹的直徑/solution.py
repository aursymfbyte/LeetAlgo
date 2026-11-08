# 任何一條路徑都有一個最高的「轉折點」，以某個節點為轉折點的最長路徑，邊數 = 左子樹深度 + 右子樹深度。
# 遞迴回傳的是「這棵子樹的深度」（空樹是 0），給父節點計算用；
# 答案則在每個節點另外用「左深度 + 右深度」更新，回傳值和答案是分開的兩件事。
# 時間 O(n)，空間 O(h)，h 是樹高。
class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        answer = 0

        def get_depth(node: Optional[TreeNode]) -> int:
            nonlocal answer
            if node is None:
                return 0
            left_depth = get_depth(node.left)
            right_depth = get_depth(node.right)
            answer = max(answer, left_depth + right_depth)
            return max(left_depth, right_depth) + 1

        get_depth(root)
        return answer
