// 回溯（選或不選）：Dfs(i) 決定 nums[i] 要不要放進子集。
// 不選就直接看下一個數；選就先放進 path，遞迴回來後再拿掉（恢復現場）。
// 每個數都決定完（i == n）時，path 就是一個子集。
// 時間 O(n·2^n)，空間 O(n)（不計答案）。
public class Solution {
    public IList<IList<int>> Subsets(int[] nums) {
        IList<IList<int>> answer = new List<IList<int>>();
        List<int> path = new List<int>();
        Dfs(nums, 0, path, answer);
        return answer;
    }

    private void Dfs(int[] nums, int index, List<int> path, IList<IList<int>> answer) {
        if (index == nums.Length) {
            answer.Add(new List<int>(path));
            return;
        }
        Dfs(nums, index + 1, path, answer);
        path.Add(nums[index]);
        Dfs(nums, index + 1, path, answer);
        path.RemoveAt(path.Count - 1);
    }
}
