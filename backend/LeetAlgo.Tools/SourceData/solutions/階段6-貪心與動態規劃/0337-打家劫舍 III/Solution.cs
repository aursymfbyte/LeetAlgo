// 樹形 DP（選或不選）：Dfs(node) 回傳兩個值，(偷 node 時子樹的最大金額, 不偷 node 時子樹的最大金額)。
// 偷 node：兩個子節點都不能偷，金額是 node.val + 左不偷 + 右不偷。
// 不偷 node：每個子節點可偷可不偷，各自取較大者，金額是 max(左偷, 左不偷) + max(右偷, 右不偷)。
// 空節點回傳 (0, 0)，答案是根節點兩個值中較大的。
// 時間 O(n)，空間 O(h)，h 是樹高（遞迴深度）。
public class Solution {
    public int Rob(TreeNode root) {
        (int robbed, int notRobbed) = Dfs(root);
        return Math.Max(robbed, notRobbed);
    }

    private (int robbed, int notRobbed) Dfs(TreeNode node) {
        if (node == null) {
            return (0, 0);
        }
        (int leftRobbed, int leftNotRobbed) = Dfs(node.left);
        (int rightRobbed, int rightNotRobbed) = Dfs(node.right);
        int robbed = node.val + leftNotRobbed + rightNotRobbed;
        int notRobbed = Math.Max(leftRobbed, leftNotRobbed) + Math.Max(rightRobbed, rightNotRobbed);
        return (robbed, notRobbed);
    }
}
