// 用堆疊模擬中序遍歷：先把根一路往左的節點都推進堆疊，堆疊頂端就是目前最小的節點。
// next 時彈出堆疊頂端，再把它右子樹一路往左的節點推進去。
// hasNext 就是堆疊是否非空。
// 每個節點只會進出堆疊一次，next 均攤 O(1)，hasNext O(1)，空間 O(h)，h 是樹高。
public class BSTIterator {
    private Stack<TreeNode> stack;

    public BSTIterator(TreeNode root) {
        stack = new Stack<TreeNode>();
        PushLeft(root);
    }

    private void PushLeft(TreeNode node) {
        while (node != null) {
            stack.Push(node);
            node = node.left;
        }
    }

    public int Next() {
        TreeNode node = stack.Pop();
        PushLeft(node.right);
        return node.val;
    }

    public bool HasNext() {
        return stack.Count > 0;
    }
}
