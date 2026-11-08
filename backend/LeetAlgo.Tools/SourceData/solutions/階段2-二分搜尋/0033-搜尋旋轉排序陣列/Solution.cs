// 先用 153 題的方法找出最小值的位置 minIndex，它把陣列切成兩段各自遞增：[0, minIndex) 和 [minIndex, n)。
// 前段的數都比最後一個數大，所以 target > nums[n - 1] 時只可能在前段，否則只可能在後段。
// 在那一段裡找第一個 >= target 的位置，再檢查它是不是 target。
// 兩次二分都用開區間 (left, right)。
// 時間 O(log n)，空間 O(1)。
public class Solution {
    public int Search(int[] nums, int target) {
        int n = nums.Length;
        int minIndex = FindMinIndex(nums);
        int index;
        if (target > nums[n - 1]) {
            index = LowerBound(nums, -1, minIndex, target);
        } else {
            index = LowerBound(nums, minIndex - 1, n, target);
        }

        if (index < n && nums[index] == target) {
            return index;
        }
        return -1;
    }

    private int FindMinIndex(int[] nums) {
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
        return right;
    }

    private int LowerBound(int[] nums, int left, int right, int target) {
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
