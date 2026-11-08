// 回溯（枚舉下一個選哪個數）：dfs(start, remaining) 表示下一個數從 start 開始選，還要湊出 remaining。
// 只往後選，每個數最多用一次，也不會出現重複的組合。
// 剪枝一（個數）：還要選 need 個數時，起點最大只能到 9 - need + 1，否則剩下的數不夠。
// 剪枝二（總和）：數字是由小到大枚舉，一旦 number > remaining，後面更大的數也不可能，直接停止。
// 時間 O(k·C(9, k))，空間 O(k)（不計答案）。
class Solution {
private:
    void dfs(int k, int start, int remaining, vector<int>& path, vector<vector<int>>& answer) {
        int need = k - (int)path.size();
        if (need == 0) {
            if (remaining == 0) {
                answer.push_back(path);
            }
            return;
        }
        for (int number = start; number <= 9 - need + 1; number++) {
            if (number > remaining) {
                break;
            }
            path.push_back(number);
            dfs(k, number + 1, remaining - number, path, answer);
            path.pop_back();
        }
    }

public:
    vector<vector<int>> combinationSum3(int k, int n) {
        vector<vector<int>> answer;
        vector<int> path;
        dfs(k, 1, n, path, answer);
        return answer;
    }
};
