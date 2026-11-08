// 序列化：前序遍歷，每個節點寫出它的值，遇到空節點寫 "#"，用逗號隔開。
// 有了空節點標記，每個節點的左右子樹在哪裡結束都很明確，只靠前序就能唯一還原整棵樹。
// 反序列化：照同樣的前序順序依序讀取，讀到 "#" 回傳空節點，否則建立節點後先建左子樹、再建右子樹。
// 兩個方向都是 O(n) 時間，空間 O(n)。
public class Codec {
    private string[] tokens;
    private int position;

    public string serialize(TreeNode root) {
        List<string> result = new List<string>();
        Preorder(root, result);
        return string.Join(",", result);
    }

    private void Preorder(TreeNode node, List<string> result) {
        if (node == null) {
            result.Add("#");
            return;
        }
        result.Add(node.val.ToString());
        Preorder(node.left, result);
        Preorder(node.right, result);
    }

    public TreeNode deserialize(string data) {
        tokens = data.Split(',');
        position = 0;
        return Build();
    }

    private TreeNode Build() {
        string token = tokens[position];
        position++;
        if (token == "#") {
            return null;
        }
        TreeNode node = new TreeNode(int.Parse(token));
        node.left = Build();
        node.right = Build();
        return node;
    }
}
