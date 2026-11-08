// 用前序遍歷，往下傳「這個節點的值必須落在哪個開區間 (lower, upper) 裡」。
// 往左走時，上界變成目前節點的值；往右走時，下界變成目前節點的值。只要有一個節點不在區間內，就不是 BST。
// 節點值可能剛好是 int 的最小值或最大值，所以上下界用 long，一開始設成 long 的最小值和最大值。
// 時間 O(n)，空間 O(h)，h 是樹高。
public class Solution {
    public bool IsValidBST(TreeNode root) {
        return IsValid(root, long.MinValue, long.MaxValue);
    }

    private bool IsValid(TreeNode node, long lower, long upper) {
        if (node == null) {
            return true;
        }
        if (node.val <= lower || node.val >= upper) {
            return false;
        }
        return IsValid(node.left, lower, node.val) && IsValid(node.right, node.val, upper);
    }
}
