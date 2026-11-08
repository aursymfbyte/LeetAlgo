// 二元搜尋樹的中序遍歷（左 → 根 → 右）剛好會由小到大拜訪每個節點。
// 中序遍歷時每拜訪一個節點，就把剩下的次數減 1，減到 0 的那個節點就是第 k 小；找到之後就不用再往下走。
// 時間 O(h + k)，空間 O(h)，h 是樹高。
class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        remaining = k;
        answer = 0;
        inorder(root);
        return answer;
    }

private:
    int remaining = 0;
    int answer = 0;

    void inorder(TreeNode* node) {
        if (node == nullptr) {
            return;
        }
        inorder(node->left);
        if (remaining == 0) {
            return;
        }
        remaining--;
        if (remaining == 0) {
            answer = node->val;
            return;
        }
        inorder(node->right);
    }
};
