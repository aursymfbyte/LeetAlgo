// 回溯：一格一格填長度 2n 的字串，dfs(openCount, closeCount) 記錄目前已經放了幾個左、右括號。
// 左括號還沒用完（openCount < n）就可以放左括號。
// 只有在右括號比左括號少（closeCount < openCount）時才能放右括號，這樣任何前綴的左括號數都 ≥ 右括號數，字串一定合法。
// 時間 O(n·C_n)，C_n 是第 n 個卡特蘭數（答案個數）；空間 O(n)（不計答案）。
class Solution {
private:
    void dfs(int n, int openCount, int closeCount, string& path, vector<string>& answer) {
        if (closeCount == n) {
            answer.push_back(path);
            return;
        }
        int position = openCount + closeCount;
        if (openCount < n) {
            path[position] = '(';
            dfs(n, openCount + 1, closeCount, path, answer);
        }
        if (closeCount < openCount) {
            path[position] = ')';
            dfs(n, openCount, closeCount + 1, path, answer);
        }
    }

public:
    vector<string> generateParenthesis(int n) {
        vector<string> answer;
        string path(2 * n, ' ');
        dfs(n, 0, 0, path, answer);
        return answer;
    }
};
