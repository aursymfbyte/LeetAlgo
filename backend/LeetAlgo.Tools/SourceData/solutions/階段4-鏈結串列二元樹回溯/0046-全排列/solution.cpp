// 回溯（排列型）：dfs(position) 負責決定排列的第 position 個位置放哪個數。
// 用 used[i] 記錄 nums[i] 是否已經放進排列；每個位置都從還沒用過的數裡挑一個。
// 遞迴回來後把 used[i] 改回 false（恢復現場），讓這個數可以放在別的位置。
// 時間 O(n·n!)，空間 O(n)（不計答案）。
class Solution {
private:
    void dfs(const vector<int>& nums, int position, vector<int>& path, vector<bool>& used, vector<vector<int>>& answer) {
        int n = nums.size();
        if (position == n) {
            answer.push_back(path);
            return;
        }
        for (int i = 0; i < n; i++) {
            if (!used[i]) {
                used[i] = true;
                path[position] = nums[i];
                dfs(nums, position + 1, path, used, answer);
                used[i] = false;
            }
        }
    }

public:
    vector<vector<int>> permute(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> answer;
        vector<int> path(n);
        vector<bool> used(n, false);
        dfs(nums, 0, path, used, answer);
        return answer;
    }
};
