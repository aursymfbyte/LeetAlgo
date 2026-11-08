// 兩棵樹相同，代表根節點的值一樣，而且左子樹跟左子樹相同、右子樹跟右子樹相同。
// 同時遞迴兩棵樹：兩邊都是空的算相同；只有一邊是空的，或值不一樣，就不同。
// 時間 O(min(n, m))，空間 O(min(h1, h2))，n、m 是兩棵樹的節點數，h1、h2 是兩棵樹的高度。
class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if (p == nullptr && q == nullptr) {
            return true;
        }
        if (p == nullptr || q == nullptr) {
            return false;
        }
        if (p->val != q->val) {
            return false;
        }
        return isSameTree(p->left, q->left) && isSameTree(p->right, q->right);
    }
};
