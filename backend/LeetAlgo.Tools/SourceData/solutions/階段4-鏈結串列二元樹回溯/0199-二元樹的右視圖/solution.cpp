// 做 DFS 時先走右子樹再走左子樹，這樣每一層「第一個」遇到的節點，就是那一層最右邊、從右側看得到的節點。
// 用答案的長度判斷這一層有沒有記錄過：目前深度等於答案長度，代表第一次來到這一層，就把節點值加進答案。
// 時間 O(n)，空間 O(h)，h 是樹高。
class Solution {
public:
    vector<int> rightSideView(TreeNode* root) {
        vector<int> result;
        dfs(root, 0, result);
        return result;
    }

private:
    void dfs(TreeNode* node, int depth, vector<int>& result) {
        if (node == nullptr) {
            return;
        }
        int recordedLevels = result.size();
        if (depth == recordedLevels) {
            result.push_back(node->val);
        }
        dfs(node->right, depth + 1, result);
        dfs(node->left, depth + 1, result);
    }
};
