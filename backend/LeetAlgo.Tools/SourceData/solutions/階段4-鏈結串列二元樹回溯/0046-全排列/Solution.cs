// 回溯（排列型）：Dfs(position) 負責決定排列的第 position 個位置放哪個數。
// 用 used[i] 記錄 nums[i] 是否已經放進排列；每個位置都從還沒用過的數裡挑一個。
// 遞迴回來後把 used[i] 改回 false（恢復現場），讓這個數可以放在別的位置。
// 時間 O(n·n!)，空間 O(n)（不計答案）。
public class Solution {
    public IList<IList<int>> Permute(int[] nums) {
        IList<IList<int>> answer = new List<IList<int>>();
        int[] path = new int[nums.Length];
        bool[] used = new bool[nums.Length];
        Dfs(nums, 0, path, used, answer);
        return answer;
    }

    private void Dfs(int[] nums, int position, int[] path, bool[] used, IList<IList<int>> answer) {
        if (position == nums.Length) {
            answer.Add(new List<int>(path));
            return;
        }
        for (int i = 0; i < nums.Length; i++) {
            if (!used[i]) {
                used[i] = true;
                path[position] = nums[i];
                Dfs(nums, position + 1, path, used, answer);
                used[i] = false;
            }
        }
    }
}
