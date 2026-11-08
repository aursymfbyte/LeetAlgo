// 任何一條路徑都有一個最高的「轉折點」，以某個節點為轉折點的最長路徑，邊數 = 左子樹深度 + 右子樹深度。
// 遞迴回傳的是「這棵子樹的深度」（空樹是 0），給父節點計算用；
// 答案則在每個節點另外用「左深度 + 右深度」更新，回傳值和答案是分開的兩件事。
// 時間 O(n)，空間 O(h)，h 是樹高。
class Solution {
public:
    int diameterOfBinaryTree(TreeNode* root) {
        getDepth(root);
        return answer;
    }

private:
    int answer = 0;

    int getDepth(TreeNode* node) {
        if (node == nullptr) {
            return 0;
        }
        int leftDepth = getDepth(node->left);
        int rightDepth = getDepth(node->right);
        answer = max(answer, leftDepth + rightDepth);
        return max(leftDepth, rightDepth) + 1;
    }
};
