# 前序的第一個數就是根。在中序裡找到根的位置，它左邊是左子樹、右邊是右子樹，左子樹有幾個節點也就知道了。
# 依照左子樹的大小，把前序切成「根、左子樹、右子樹」三段，再分別遞迴建出左右子樹。
# 先用雜湊表記下每個值在中序裡的位置，找根的位置只要 O(1)；遞迴只傳起點和大小，不複製陣列。
# 時間 O(n)，空間 O(n)。
class Solution:
    def buildTree(self, preorder: list[int], inorder: list[int]) -> TreeNode | None:
        index_in_inorder = {}
        for index, value in enumerate(inorder):
            index_in_inorder[value] = index

        def build(pre_start: int, in_start: int, size: int) -> TreeNode | None:
            if size == 0:
                return None
            root_value = preorder[pre_start]
            root_index = index_in_inorder[root_value]
            left_size = root_index - in_start
            left = build(pre_start + 1, in_start, left_size)
            right = build(pre_start + 1 + left_size, root_index + 1, size - 1 - left_size)
            return TreeNode(root_value, left, right)

        return build(0, 0, len(preorder))
