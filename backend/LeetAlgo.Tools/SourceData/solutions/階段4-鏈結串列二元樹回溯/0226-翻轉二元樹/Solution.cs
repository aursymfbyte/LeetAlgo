// 翻轉一棵樹，就是先把左右子樹各自翻轉好，再把左右兩個孩子交換位置。
// 空樹翻轉後還是空樹。
// 時間 O(n)，空間 O(h)，h 是樹高。
public class Solution {
    public TreeNode InvertTree(TreeNode root) {
        if (root == null) {
            return null;
        }
        TreeNode invertedLeft = InvertTree(root.left);
        TreeNode invertedRight = InvertTree(root.right);
        root.left = invertedRight;
        root.right = invertedLeft;
        return root;
    }
}
