# 所有節點收到訊號的時間，就是從 k 出發到最遠那個節點的最短路徑長，用 Dijkstra 求單源最短路。
# n 最多 100，用樸素版：鄰接矩陣存邊，每輪從還沒確定的節點裡挑距離最小的，它的最短距離就確定了，
# 再用它去更新鄰居的距離。挑出來的最小距離是無限大時，代表有節點收不到訊號，回傳 -1。
# 邊權不會是負數，所以「目前最小的那個」不可能再被別人更新得更小，這是 Dijkstra 正確的關鍵。
# 時間 O(n^2 + m)，空間 O(n^2)。
class Solution:
    def networkDelayTime(self, times: list[list[int]], n: int, k: int) -> int:
        infinity = float("inf")
        graph = [[infinity] * n for _ in range(n)]
        for source, target, time in times:
            graph[source - 1][target - 1] = time

        distance = [infinity] * n
        distance[k - 1] = 0
        done = [False] * n
        for _ in range(n):
            closest = -1
            for node in range(n):
                if not done[node] and (closest == -1 or distance[node] < distance[closest]):
                    closest = node
            if distance[closest] == infinity:
                return -1
            done[closest] = True
            for neighbor in range(n):
                distance[neighbor] = min(distance[neighbor], distance[closest] + graph[closest][neighbor])
        return max(distance)
