# 建圖時每條路 a → b 都存成雙向，但記下方向：從 a 走到 b 標成 1（順著原方向），從 b 走到 a 標成 0。
# 從城市 0 出發 BFS 往外走，走的方向是「離開 0」。如果走的邊標成 1，代表原本的路也是離開 0，
# 別的城市沿這條路回不到 0，必須反轉，答案加一。
# 時間 O(n)，空間 O(n)。
from collections import deque


class Solution:
    def minReorder(self, n: int, connections: list[list[int]]) -> int:
        neighbors = [[] for _ in range(n)]
        for start, end in connections:
            neighbors[start].append((end, 1))
            neighbors[end].append((start, 0))

        visited = [False] * n
        visited[0] = True
        queue = deque([0])
        changes = 0
        while queue:
            city = queue.popleft()
            for next_city, needs_reverse in neighbors[city]:
                if visited[next_city]:
                    continue
                visited[next_city] = True
                changes += needs_reverse
                queue.append(next_city)
        return changes
