# 一個省份就是圖上的一個連通塊。依序看每座城市，還沒走過就代表發現新省份，答案加一，
# 再從它做 DFS，沿著鄰接矩陣裡 isConnected[city][other] == 1 的邊，把同省份的城市都標記走過。
# 時間 O(n^2)，空間 O(n)。
class Solution:
    def findCircleNum(self, isConnected: List[List[int]]) -> int:
        n = len(isConnected)
        visited = [False] * n

        def visit(city: int) -> None:
            visited[city] = True
            for other in range(n):
                if isConnected[city][other] == 1 and not visited[other]:
                    visit(other)

        provinces = 0
        for city in range(n):
            if not visited[city]:
                provinces += 1
                visit(city)
        return provinces
