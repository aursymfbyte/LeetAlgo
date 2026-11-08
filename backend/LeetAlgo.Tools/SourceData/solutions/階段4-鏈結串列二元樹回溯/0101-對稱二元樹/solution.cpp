// 整棵樹對稱，就是根的左子樹和右子樹互為鏡像。
// 做法跟「相同的樹」一樣同時遞迴兩棵樹，只是要外側比外側（左的左 vs 右的右）、內側比內側（左的右 vs 右的左）。
// 時間 O(n)，空間 O(h)，h 是樹高。
class Solution {
public:
    bool isSymmetric(TreeNode* root) {
        return isMirror(root->left, root->right);
    }

private:
    bool isMirror(TreeNode* left, TreeNode* right) {
        if (left == nullptr && right == nullptr) {
            return true;
        }
        if (left == nullptr || right == nullptr) {
            return false;
        }
        if (left->val != right->val) {
            return false;
        }
        return isMirror(left->left, right->right) && isMirror(left->right, right->left);
    }
};
