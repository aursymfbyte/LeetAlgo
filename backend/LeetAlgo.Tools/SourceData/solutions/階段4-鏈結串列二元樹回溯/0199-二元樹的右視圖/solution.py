# 做 DFS 時先走右子樹再走左子樹，這樣每一層「第一個」遇到的節點，就是那一層最右邊、從右側看得到的節點。
# 用答案的長度判斷這一層有沒有記錄過：目前深度等於答案長度，代表第一次來到這一層，就把節點值加進答案。
# 時間 O(n)，空間 O(h)，h 是樹高。
class Solution:
    def rightSideView(self, root: TreeNode | None) -> list[int]:
        result = []

        def dfs(node: TreeNode | None, depth: int) -> None:
            if node is None:
                return
            if depth == len(result):
                result.append(node.val)
            dfs(node.right, depth + 1)
            dfs(node.left, depth + 1)

        dfs(root, 0)
        return result
