# 用雜湊表記錄「原節點 → 複本」。DFS 到一個節點時，如果已經有複本就直接回傳，
# 否則先建立複本並記進雜湊表，再遞迴複製每個鄰居。
# 一定要先記錄再處理鄰居，圖裡有環，否則會在環上無限遞迴。
# 時間 O(V + E)，空間 O(V)。
class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        if node is None:
            return None

        copies = {}

        def clone(original: 'Node') -> 'Node':
            if original in copies:
                return copies[original]
            copy = Node(original.val)
            copies[original] = copy
            for neighbor in original.neighbors:
                copy.neighbors.append(clone(neighbor))
            return copy

        return clone(node)
