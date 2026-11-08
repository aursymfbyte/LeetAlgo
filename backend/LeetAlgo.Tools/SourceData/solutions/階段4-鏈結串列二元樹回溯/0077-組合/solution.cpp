// 回溯（枚舉下一個選哪個數）：dfs(start) 表示下一個數只能從 start 開始選。
// 只往後選，同一組數字就只會以遞增順序出現一次，不會重複。
// 剪枝：還要選 need 個數時，起點最大只能到 n - need + 1，再往後剩下的數不夠湊滿 k 個。
// 時間 O(k·C(n, k))，空間 O(k)（不計答案）。
class Solution {
private:
    void dfs(int n, int k, int start, vector<int>& path, vector<vector<int>>& answer) {
        int need = k - (int)path.size();
        if (need == 0) {
            answer.push_back(path);
            return;
        }
        for (int number = start; number <= n - need + 1; number++) {
            path.push_back(number);
            dfs(n, k, number + 1, path, answer);
            path.pop_back();
        }
    }

public:
    vector<vector<int>> combine(int n, int k) {
        vector<vector<int>> answer;
        vector<int> path;
        dfs(n, k, 1, path, answer);
        return answer;
    }
};
