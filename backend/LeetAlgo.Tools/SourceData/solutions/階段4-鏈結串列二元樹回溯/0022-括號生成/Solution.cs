// 回溯：一格一格填長度 2n 的字串，Dfs(openCount, closeCount) 記錄目前已經放了幾個左、右括號。
// 左括號還沒用完（openCount < n）就可以放左括號。
// 只有在右括號比左括號少（closeCount < openCount）時才能放右括號，這樣任何前綴的左括號數都 ≥ 右括號數，字串一定合法。
// 時間 O(n·C_n)，C_n 是第 n 個卡特蘭數（答案個數）；空間 O(n)（不計答案）。
public class Solution {
    public IList<string> GenerateParenthesis(int n) {
        List<string> answer = new List<string>();
        char[] path = new char[2 * n];
        Dfs(n, 0, 0, path, answer);
        return answer;
    }

    private void Dfs(int n, int openCount, int closeCount, char[] path, List<string> answer) {
        if (closeCount == n) {
            answer.Add(new string(path));
            return;
        }
        int position = openCount + closeCount;
        if (openCount < n) {
            path[position] = '(';
            Dfs(n, openCount + 1, closeCount, path, answer);
        }
        if (closeCount < openCount) {
            path[position] = ')';
            Dfs(n, openCount, closeCount + 1, path, answer);
        }
    }
}
