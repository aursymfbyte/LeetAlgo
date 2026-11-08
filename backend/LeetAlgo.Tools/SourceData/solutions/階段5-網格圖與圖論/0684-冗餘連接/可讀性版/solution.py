# 並查集：照順序加入每條邊，加邊前先查兩個端點是否已經在同一個集合。
# 已經連通的話，這條邊會造成環，它就是多出來的那條；否則把兩個集合合併。
# 圖裡只有一個環，照輸入順序第一條「讓環閉合」的邊，正好是環上最後出現的邊，符合題目要求。
# find 時順便把路徑上的節點直接接到根（路徑壓縮），之後查詢更快。
# 時間 O(n log n)，空間 O(n)。
class Solution:
    def findRedundantConnection(self, edges: list[list[int]]) -> list[int]:
        parent = list(range(len(edges) + 1))

        def find(node: int) -> int:
            if parent[node] != node:
                parent[node] = find(parent[node])
            return parent[node]

        for a, b in edges:
            root_a = find(a)
            root_b = find(b)
            if root_a == root_b:
                return [a, b]
            parent[root_a] = root_b
        return []
