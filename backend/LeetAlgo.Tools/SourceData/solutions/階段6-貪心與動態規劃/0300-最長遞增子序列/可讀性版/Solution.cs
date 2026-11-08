// f[i] 表示以 nums[i] 結尾的最長嚴格遞增子序列長度。
// 往前找所有比 nums[i] 小的 nums[j]（j < i），把 nums[i] 接在它後面，f[i] = max(f[j]) + 1；
// 找不到就是只有自己，f[i] = 1。答案是所有 f[i] 的最大值。
// 時間 O(n^2)，空間 O(n)。
public class Solution {
    public int LengthOfLIS(int[] nums) {
        int n = nums.Length;
        int[] f = new int[n];
        int answer = 0;
        for (int i = 0; i < n; i++) {
            f[i] = 1;
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    f[i] = Math.Max(f[i], f[j] + 1);
                }
            }
            answer = Math.Max(answer, f[i]);
        }
        return answer;
    }
}
