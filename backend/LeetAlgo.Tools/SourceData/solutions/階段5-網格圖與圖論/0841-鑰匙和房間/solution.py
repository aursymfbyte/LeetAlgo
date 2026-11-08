# 把房間當成節點，房間 i 裡的鑰匙 rooms[i] 就是從 i 出發的邊，這正好是一張用鄰接串列表示的圖。
# 從房間 0 做 DFS，拿到鑰匙就進還沒去過的房間，最後檢查是否每間都去過。
# 時間 O(n + k)，空間 O(n)，k 是鑰匙總數。
class Solution:
    def canVisitAllRooms(self, rooms: list[list[int]]) -> bool:
        visited = [False] * len(rooms)

        def visit(room: int) -> None:
            visited[room] = True
            for key in rooms[room]:
                if not visited[key]:
                    visit(key)

        visit(0)
        return all(visited)
