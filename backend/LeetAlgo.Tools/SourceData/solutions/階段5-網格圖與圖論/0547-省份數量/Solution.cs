// 一個省份就是圖上的一個連通塊。依序看每座城市，還沒走過就代表發現新省份，答案加一，
// 再從它做 DFS，沿著鄰接矩陣裡 isConnected[city][other] == 1 的邊，把同省份的城市都標記走過。
// 時間 O(n^2)，空間 O(n)。
public class Solution {
    public int FindCircleNum(int[][] isConnected) {
        int n = isConnected.Length;
        bool[] visited = new bool[n];
        int provinces = 0;
        for (int city = 0; city < n; city++) {
            if (!visited[city]) {
                provinces++;
                Visit(isConnected, city, visited);
            }
        }
        return provinces;
    }

    private void Visit(int[][] isConnected, int city, bool[] visited) {
        visited[city] = true;
        for (int other = 0; other < isConnected.Length; other++) {
            if (isConnected[city][other] == 1 && !visited[other]) {
                Visit(isConnected, other, visited);
            }
        }
    }
}
