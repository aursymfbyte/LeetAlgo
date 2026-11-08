// 回溯（選或不選）：dfs(i) 決定 nums[i] 要不要放進子集。
// 不選就直接看下一個數；選就先放進 path，遞迴回來後再拿掉（恢復現場）。
// 每個數都決定完（i == n）時，path 就是一個子集。
// 時間 O(n·2^n)，空間 O(n)（不計答案）。
class Solution {
private:
    void dfs(const vector<int>& nums, int index, vector<int>& path, vector<vector<int>>& answer) {
        int n = nums.size();
        if (index == n) {
            answer.push_back(path);
            return;
        }
        dfs(nums, index + 1, path, answer);
        path.push_back(nums[index]);
        dfs(nums, index + 1, path, answer);
        path.pop_back();
    }

public:
    vector<vector<int>> subsets(vector<int>& nums) {
        vector<vector<int>> answer;
        vector<int> path;
        dfs(nums, 0, path, answer);
        return answer;
    }
};
