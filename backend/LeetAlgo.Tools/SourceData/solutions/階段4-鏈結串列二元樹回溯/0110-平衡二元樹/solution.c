// 遞迴計算每棵子樹的高度，順便檢查平衡：左右高度差超過 1，就回傳 -1 代表「不平衡」。
// 只要左或右子樹回傳 -1，就直接一路往上回傳 -1，不用再算下去。
// 最後根節點的結果不是 -1，整棵樹就是平衡的。
// 時間 O(n)，空間 O(h)，h 是樹高。
int getHeight(struct TreeNode* node) {
    if (node == NULL) {
        return 0;
    }
    int leftHeight = getHeight(node->left);
    if (leftHeight == -1) {
        return -1;
    }
    int rightHeight = getHeight(node->right);
    if (rightHeight == -1) {
        return -1;
    }
    if (abs(leftHeight - rightHeight) > 1) {
        return -1;
    }
    if (leftHeight > rightHeight) {
        return leftHeight + 1;
    }
    return rightHeight + 1;
}

bool isBalanced(struct TreeNode* root) {
    return getHeight(root) != -1;
}
