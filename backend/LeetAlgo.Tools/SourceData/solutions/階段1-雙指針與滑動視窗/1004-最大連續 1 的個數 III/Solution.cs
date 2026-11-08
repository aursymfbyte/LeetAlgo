// 問題等價於：找最長的子陣列，裡面 0 的個數不超過 k（把這些 0 都翻成 1）。
// 不定長滑動視窗求最長：右端點每次進一個數，遇到 0 就把視窗內 0 的個數加一；
// 0 的個數超過 k 時，左端點右移（移出的是 0 就減一），直到又滿足條件，再用視窗長度更新答案。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public int LongestOnes(int[] nums, int k) {
        int zeroCount = 0;
        int answer = 0;
        int left = 0;
        for (int right = 0; right < nums.Length; right++) {
            if (nums[right] == 0) {
                zeroCount++;
            }
            while (zeroCount > k) {
                if (nums[left] == 0) {
                    zeroCount--;
                }
                left++;
            }
            answer = Math.Max(answer, right - left + 1);
        }
        return answer;
    }
}
