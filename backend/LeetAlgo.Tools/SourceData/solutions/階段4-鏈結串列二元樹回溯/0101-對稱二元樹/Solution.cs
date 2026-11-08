// 整棵樹對稱，就是根的左子樹和右子樹互為鏡像。
// 做法跟「相同的樹」一樣同時遞迴兩棵樹，只是要外側比外側（左的左 vs 右的右）、內側比內側（左的右 vs 右的左）。
// 時間 O(n)，空間 O(h)，h 是樹高。
public class Solution {
    public bool IsSymmetric(TreeNode root) {
        return IsMirror(root.left, root.right);
    }

    private bool IsMirror(TreeNode left, TreeNode right) {
        if (left == null && right == null) {
            return true;
        }
        if (left == null || right == null) {
            return false;
        }
        if (left.val != right.val) {
            return false;
        }
        return IsMirror(left.left, right.right) && IsMirror(left.right, right.left);
    }
}
