// 用佇列做 BFS。每一輪開始時佇列裡剛好是同一層的所有節點，先記下佇列的大小就是這一層的節點數。
// 把這一層的節點依序取出、記錄它們的值，同時把它們的左右孩子放進佇列，佇列裡留下的就是下一層。
// 時間 O(n)，空間 O(n)。
public class Solution {
    public IList<IList<int>> LevelOrder(TreeNode root) {
        IList<IList<int>> result = new List<IList<int>>();
        if (root == null) {
            return result;
        }

        Queue<TreeNode> queue = new Queue<TreeNode>();
        queue.Enqueue(root);
        while (queue.Count > 0) {
            List<int> levelValues = new List<int>();
            int levelSize = queue.Count;
            for (int i = 0; i < levelSize; i++) {
                TreeNode node = queue.Dequeue();
                levelValues.Add(node.val);
                if (node.left != null) {
                    queue.Enqueue(node.left);
                }
                if (node.right != null) {
                    queue.Enqueue(node.right);
                }
            }
            result.Add(levelValues);
        }
        return result;
    }
}
