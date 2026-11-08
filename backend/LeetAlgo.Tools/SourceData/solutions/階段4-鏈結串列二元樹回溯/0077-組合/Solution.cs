// 回溯（枚舉下一個選哪個數）：Dfs(start) 表示下一個數只能從 start 開始選。
// 只往後選，同一組數字就只會以遞增順序出現一次，不會重複。
// 剪枝：還要選 need 個數時，起點最大只能到 n - need + 1，再往後剩下的數不夠湊滿 k 個。
// 時間 O(k·C(n, k))，空間 O(k)（不計答案）。
public class Solution {
    public IList<IList<int>> Combine(int n, int k) {
        IList<IList<int>> answer = new List<IList<int>>();
        List<int> path = new List<int>();
        Dfs(n, k, 1, path, answer);
        return answer;
    }

    private void Dfs(int n, int k, int start, List<int> path, IList<IList<int>> answer) {
        int need = k - path.Count;
        if (need == 0) {
            answer.Add(new List<int>(path));
            return;
        }
        for (int number = start; number <= n - need + 1; number++) {
            path.Add(number);
            Dfs(n, k, number + 1, path, answer);
            path.RemoveAt(path.Count - 1);
        }
    }
}
