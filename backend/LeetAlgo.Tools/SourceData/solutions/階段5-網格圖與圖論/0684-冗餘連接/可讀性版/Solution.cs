// 並查集：照順序加入每條邊，加邊前先查兩個端點是否已經在同一個集合。
// 已經連通的話，這條邊會造成環，它就是多出來的那條；否則把兩個集合合併。
// 圖裡只有一個環，照輸入順序第一條「讓環閉合」的邊，正好是環上最後出現的邊，符合題目要求。
// find 時順便把路徑上的節點直接接到根（路徑壓縮），之後查詢更快。
// 時間 O(n log n)，空間 O(n)。
public class Solution {
    public int[] FindRedundantConnection(int[][] edges) {
        int[] parent = new int[edges.Length + 1];
        for (int node = 0; node < parent.Length; node++) {
            parent[node] = node;
        }

        foreach (int[] edge in edges) {
            int rootA = Find(parent, edge[0]);
            int rootB = Find(parent, edge[1]);
            if (rootA == rootB) {
                return edge;
            }
            parent[rootA] = rootB;
        }
        return new int[0];
    }

    private int Find(int[] parent, int node) {
        if (parent[node] != node) {
            parent[node] = Find(parent, parent[node]);
        }
        return parent[node];
    }
}
