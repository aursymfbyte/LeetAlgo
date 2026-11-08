// 前序的第一個數就是根。在中序裡找到根的位置，它左邊是左子樹、右邊是右子樹，左子樹有幾個節點也就知道了。
// 依照左子樹的大小，把前序切成「根、左子樹、右子樹」三段，再分別遞迴建出左右子樹。
// 節點值在 -3000 到 3000 之間，用陣列（值 + 3000 當下標）記下每個值在中序裡的位置，找根的位置只要 O(1)。
// 遞迴只傳起點和大小，不複製陣列。
// 時間 O(n)，空間 O(n)。
#define VALUE_OFFSET 3000

struct TreeNode* build(int* preorder, int* indexInInorder, int preStart, int inStart, int size) {
    if (size == 0) {
        return NULL;
    }
    int rootValue = preorder[preStart];
    int rootIndex = indexInInorder[rootValue + VALUE_OFFSET];
    int leftSize = rootIndex - inStart;

    struct TreeNode* root = malloc(sizeof(struct TreeNode));
    root->val = rootValue;
    root->left = build(preorder, indexInInorder, preStart + 1, inStart, leftSize);
    root->right = build(preorder, indexInInorder, preStart + 1 + leftSize, rootIndex + 1, size - 1 - leftSize);
    return root;
}

struct TreeNode* buildTree(int* preorder, int preorderSize, int* inorder, int inorderSize) {
    int* indexInInorder = malloc(sizeof(int) * (2 * VALUE_OFFSET + 1));
    for (int i = 0; i < inorderSize; i++) {
        indexInInorder[inorder[i] + VALUE_OFFSET] = i;
    }

    struct TreeNode* root = build(preorder, indexInInorder, 0, 0, preorderSize);
    free(indexInInorder);
    return root;
}
