// 遞迴計算每棵子樹的高度，順便檢查平衡：左右高度差超過 1，就回傳 -1 代表「不平衡」。
// 只要左或右子樹回傳 -1，就直接一路往上回傳 -1，不用再算下去。
// 最後根節點的結果不是 -1，整棵樹就是平衡的。
// 時間 O(n)，空間 O(h)，h 是樹高。
public class Solution {
    public bool IsBalanced(TreeNode root) {
        return GetHeight(root) != -1;
    }

    private int GetHeight(TreeNode node) {
        if (node == null) {
            return 0;
        }
        int leftHeight = GetHeight(node.left);
        if (leftHeight == -1) {
            return -1;
        }
        int rightHeight = GetHeight(node.right);
        if (rightHeight == -1) {
            return -1;
        }
        if (Math.Abs(leftHeight - rightHeight) > 1) {
            return -1;
        }
        return Math.Max(leftHeight, rightHeight) + 1;
    }
}
