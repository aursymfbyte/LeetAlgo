// Kadane 演算法：current 表示「以目前這個數結尾」的最大子陣列和。
// 如果前面累積的 current 是負的，接上去只會變小，不如從目前這個數重新開始，
// 所以 current = max(current, 0) + num；答案就是過程中出現過的最大 current。
// 時間 O(n)，空間 O(1)。
public class Solution {
    public int MaxSubArray(int[] nums) {
        int answer = int.MinValue;
        int current = 0;
        foreach (int num in nums) {
            current = Math.Max(current, 0) + num;
            answer = Math.Max(answer, current);
        }
        return answer;
    }
}
