// 一棵樹的最大深度 = 左右子樹的最大深度取較大的那個再加 1，空樹的深度是 0。
// 由下往上遞迴：先算出左右子樹的答案，再組合出自己的答案。
// 時間 O(n)，空間 O(h)，h 是樹高（遞迴深度）。
int maxDepth(struct TreeNode* root) {
    if (root == NULL) {
        return 0;
    }
    int leftDepth = maxDepth(root->left);
    int rightDepth = maxDepth(root->right);
    if (leftDepth > rightDepth) {
        return leftDepth + 1;
    }
    return rightDepth + 1;
}
