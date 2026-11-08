// 分類討論。如果目前節點是空的，或者就是 p 或 q，直接回傳目前節點。
// 否則到左右子樹去找：左右兩邊都找到東西，代表 p、q 分在兩側，目前節點就是最近公共祖先；
// 只有一邊找到，代表 p、q 都在那一側，回傳那一邊的結果；兩邊都沒找到就回傳空。
// 時間 O(n)，空間 O(h)，h 是樹高。
struct TreeNode* lowestCommonAncestor(struct TreeNode* root, struct TreeNode* p, struct TreeNode* q) {
    if (root == NULL || root == p || root == q) {
        return root;
    }
    struct TreeNode* leftResult = lowestCommonAncestor(root->left, p, q);
    struct TreeNode* rightResult = lowestCommonAncestor(root->right, p, q);
    if (leftResult != NULL && rightResult != NULL) {
        return root;
    }
    if (leftResult != NULL) {
        return leftResult;
    }
    return rightResult;
}
