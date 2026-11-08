// 先排序，再回溯：Dfs(start, remaining) 表示下一個數從 candidates[start] 開始選，還要湊出 remaining。
// 選了 candidates[i] 之後，下一層仍從 i 開始（不是 i + 1），所以同一個數可以重複選。
// 只往後選不回頭，[2,2,3] 和 [2,3,2] 這種順序不同的重複組合就不會出現。
// 排序後一旦 candidates[i] > remaining，後面的數只會更大，直接停止。
// 時間取決於答案的數量與長度（指數級），空間 O(target)（遞迴深度最多 target / 2）。
public class Solution {
    public IList<IList<int>> CombinationSum(int[] candidates, int target) {
        Array.Sort(candidates);
        IList<IList<int>> answer = new List<IList<int>>();
        List<int> path = new List<int>();
        Dfs(candidates, 0, target, path, answer);
        return answer;
    }

    private void Dfs(int[] candidates, int start, int remaining, List<int> path, IList<IList<int>> answer) {
        if (remaining == 0) {
            answer.Add(new List<int>(path));
            return;
        }
        for (int i = start; i < candidates.Length; i++) {
            if (candidates[i] > remaining) {
                break;
            }
            path.Add(candidates[i]);
            Dfs(candidates, i, remaining - candidates[i], path, answer);
            path.RemoveAt(path.Count - 1);
        }
    }
}
