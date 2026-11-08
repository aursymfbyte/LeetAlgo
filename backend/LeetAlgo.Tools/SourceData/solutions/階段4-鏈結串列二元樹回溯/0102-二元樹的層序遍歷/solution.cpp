// 用佇列做 BFS。每一輪開始時佇列裡剛好是同一層的所有節點，先記下佇列的大小就是這一層的節點數。
// 把這一層的節點依序取出、記錄它們的值，同時把它們的左右孩子放進佇列，佇列裡留下的就是下一層。
// 時間 O(n)，空間 O(n)。
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> result;
        if (root == nullptr) {
            return result;
        }

        queue<TreeNode*> nodeQueue;
        nodeQueue.push(root);
        while (!nodeQueue.empty()) {
            vector<int> levelValues;
            int levelSize = nodeQueue.size();
            for (int i = 0; i < levelSize; i++) {
                TreeNode* node = nodeQueue.front();
                nodeQueue.pop();
                levelValues.push_back(node->val);
                if (node->left != nullptr) {
                    nodeQueue.push(node->left);
                }
                if (node->right != nullptr) {
                    nodeQueue.push(node->right);
                }
            }
            result.push_back(levelValues);
        }
        return result;
    }
};
