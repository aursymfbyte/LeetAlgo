// 用雜湊表記錄「原節點 → 複本」。DFS 到一個節點時，如果已經有複本就直接回傳，
// 否則先建立複本並記進雜湊表，再遞迴複製每個鄰居。
// 一定要先記錄再處理鄰居，圖裡有環，否則會在環上無限遞迴。
// 時間 O(V + E)，空間 O(V)。
public class Solution {
    public Node CloneGraph(Node node) {
        if (node == null) {
            return null;
        }
        Dictionary<Node, Node> copies = new Dictionary<Node, Node>();
        return Clone(node, copies);
    }

    private Node Clone(Node original, Dictionary<Node, Node> copies) {
        if (copies.ContainsKey(original)) {
            return copies[original];
        }

        Node copy = new Node(original.val);
        copies[original] = copy;
        foreach (Node neighbor in original.neighbors) {
            copy.neighbors.Add(Clone(neighbor, copies));
        }
        return copy;
    }
}
