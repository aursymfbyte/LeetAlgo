// 前序的第一個數就是根。在中序裡找到根的位置，它左邊是左子樹、右邊是右子樹，左子樹有幾個節點也就知道了。
// 依照左子樹的大小，把前序切成「根、左子樹、右子樹」三段，再分別遞迴建出左右子樹。
// 先用雜湊表記下每個值在中序裡的位置，找根的位置只要 O(1)；遞迴只傳起點和大小，不複製陣列。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        int n = inorder.size();
        for (int i = 0; i < n; i++) {
            indexInInorder[inorder[i]] = i;
        }
        return build(preorder, 0, 0, n);
    }

private:
    unordered_map<int, int> indexInInorder;

    TreeNode* build(vector<int>& preorder, int preStart, int inStart, int size) {
        if (size == 0) {
            return nullptr;
        }
        int rootValue = preorder[preStart];
        int rootIndex = indexInInorder[rootValue];
        int leftSize = rootIndex - inStart;
        TreeNode* left = build(preorder, preStart + 1, inStart, leftSize);
        TreeNode* right = build(preorder, preStart + 1 + leftSize, rootIndex + 1, size - 1 - leftSize);
        return new TreeNode(rootValue, left, right);
    }
};
