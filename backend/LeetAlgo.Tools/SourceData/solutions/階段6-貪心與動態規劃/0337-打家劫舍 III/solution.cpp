// 樹形 DP（選或不選）：dfs(node) 回傳兩個值，(偷 node 時子樹的最大金額, 不偷 node 時子樹的最大金額)。
// 偷 node：兩個子節點都不能偷，金額是 node->val + 左不偷 + 右不偷。
// 不偷 node：每個子節點可偷可不偷，各自取較大者，金額是 max(左偷, 左不偷) + max(右偷, 右不偷)。
// 空節點回傳 (0, 0)，答案是根節點兩個值中較大的。
// 時間 O(n)，空間 O(h)，h 是樹高（遞迴深度）。
class Solution {
public:
    int rob(TreeNode* root) {
        auto [robbed, notRobbed] = dfs(root);
        return max(robbed, notRobbed);
    }

private:
    pair<int, int> dfs(TreeNode* node) {
        if (node == nullptr) {
            return {0, 0};
        }
        auto [leftRobbed, leftNotRobbed] = dfs(node->left);
        auto [rightRobbed, rightNotRobbed] = dfs(node->right);
        int robbed = node->val + leftNotRobbed + rightNotRobbed;
        int notRobbed = max(leftRobbed, leftNotRobbed) + max(rightRobbed, rightNotRobbed);
        return {robbed, notRobbed};
    }
};
