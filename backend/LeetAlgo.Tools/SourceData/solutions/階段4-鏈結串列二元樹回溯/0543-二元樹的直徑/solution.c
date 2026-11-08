// 任何一條路徑都有一個最高的「轉折點」，以某個節點為轉折點的最長路徑，邊數 = 左子樹深度 + 右子樹深度。
// 遞迴回傳的是「這棵子樹的深度」（空樹是 0），給父節點計算用；
// 答案則在每個節點另外用「左深度 + 右深度」更新，回傳值和答案是分開的兩件事。
// 時間 O(n)，空間 O(h)，h 是樹高。
int getDepth(struct TreeNode* node, int* answer) {
    if (node == NULL) {
        return 0;
    }
    int leftDepth = getDepth(node->left, answer);
    int rightDepth = getDepth(node->right, answer);
    if (leftDepth + rightDepth > *answer) {
        *answer = leftDepth + rightDepth;
    }
    if (leftDepth > rightDepth) {
        return leftDepth + 1;
    }
    return rightDepth + 1;
}

int diameterOfBinaryTree(struct TreeNode* root) {
    int answer = 0;
    getDepth(root, &answer);
    return answer;
}
