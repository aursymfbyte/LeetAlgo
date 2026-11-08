// 不定長滑動視窗求最短：右端點每次往右擴一格，把 nums[right] 加進視窗和。
// 只要視窗和 >= target，就先用目前長度更新答案，再把左端點右移縮小視窗，試試更短的。
// 數字都是正數，視窗縮小和一定變小，所以左端點只會往右走，不用回頭。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public int MinSubArrayLen(int target, int[] nums) {
        int n = nums.Length;
        int answer = n + 1;
        int windowSum = 0;
        int left = 0;
        for (int right = 0; right < n; right++) {
            windowSum += nums[right];
            while (windowSum >= target) {
                answer = Math.Min(answer, right - left + 1);
                windowSum -= nums[left];
                left++;
            }
        }
        if (answer > n) {
            return 0;
        }
        return answer;
    }
}
