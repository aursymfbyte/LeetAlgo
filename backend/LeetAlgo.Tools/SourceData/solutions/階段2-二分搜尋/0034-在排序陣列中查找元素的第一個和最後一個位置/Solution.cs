// 寫一個 LowerBound 找第一個 >= target 的位置，其他比較都轉成它：
// 開始位置 = LowerBound(target)；結束位置 = 第一個 > target 的位置 - 1 = LowerBound(target + 1) - 1。
// 如果開始位置超出陣列，或那個數不是 target，代表 target 不存在。
// LowerBound 用開區間 (left, right) 二分，保持 nums[left] < target、nums[right] >= target。
// 時間 O(log n)，空間 O(1)。
public class Solution {
    public int[] SearchRange(int[] nums, int target) {
        int start = LowerBound(nums, target);
        if (start == nums.Length || nums[start] != target) {
            return new int[] { -1, -1 };
        }
        int end = LowerBound(nums, target + 1) - 1;
        return new int[] { start, end };
    }

    private int LowerBound(int[] nums, int target) {
        int left = -1;
        int right = nums.Length;
        while (left + 1 < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] >= target) {
                right = mid;
            } else {
                left = mid;
            }
        }
        return right;
    }
}
