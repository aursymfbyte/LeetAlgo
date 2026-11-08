// 旋轉後的陣列分成兩段遞增：前段的數都比最後一個數大，後段（從最小值開始）的數都 <= 最後一個數。
// 拿 nums[mid] 跟最後一個數比：nums[mid] < nums[n - 1] 代表 mid 在後段，最小值在 mid 或它左邊；否則最小值在 mid 右邊。
// 用開區間 (left, right) 二分，left = -1、right = n - 1（最後一個數一定在後段），
// 保持 left 在前段、right 在後段，區間變空時 right 就是後段的第一個數，也就是最小值。
// 時間 O(log n)，空間 O(1)。
public class Solution {
    public int FindMin(int[] nums) {
        int n = nums.Length;
        int left = -1;
        int right = n - 1;
        while (left + 1 < right) {
            int mid = left + (right - left) / 2;
            if (nums[mid] < nums[n - 1]) {
                right = mid;
            } else {
                left = mid;
            }
        }
        return nums[right];
    }
}
