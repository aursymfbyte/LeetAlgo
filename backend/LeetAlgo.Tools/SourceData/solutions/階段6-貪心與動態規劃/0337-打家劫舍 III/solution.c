// 樹形 DP（選或不選）：dfs(node) 回傳兩個值，(偷 node 時子樹的最大金額, 不偷 node 時子樹的最大金額)。
// 偷 node：兩個子節點都不能偷，金額是 node.val + 左不偷 + 右不偷。
// 不偷 node：每個子節點可偷可不偷，各自取較大者，金額是 max(左偷, 左不偷) + max(右偷, 右不偷)。
// 空節點回傳 (0, 0)，答案是根節點兩個值中較大的。
// 時間 O(n)，空間 O(h)，h 是樹高（遞迴深度）。
struct RobResult {
    int robbed;
    int notRobbed;
};

int maxInt(int a, int b) {
    if (a > b) {
        return a;
    }
    return b;
}

struct RobResult dfs(struct TreeNode* node) {
    struct RobResult result = {0, 0};
    if (node == NULL) {
        return result;
    }
    struct RobResult left = dfs(node->left);
    struct RobResult right = dfs(node->right);
    result.robbed = node->val + left.notRobbed + right.notRobbed;
    result.notRobbed = maxInt(left.robbed, left.notRobbed) + maxInt(right.robbed, right.notRobbed);
    return result;
}

int rob(struct TreeNode* root) {
    struct RobResult result = dfs(root);
    return maxInt(result.robbed, result.notRobbed);
}
