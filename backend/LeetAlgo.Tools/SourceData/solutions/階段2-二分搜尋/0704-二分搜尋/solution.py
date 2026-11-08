# 用開區間 (left, right) 二分：一開始 left = -1、right = n，
# 過程中保持 nums[left] < target、nums[right] >= target（把 nums[-1] 當成 -∞、nums[n] 當成 +∞）。
# 區間變空時 right 就是第一個 >= target 的位置，再檢查它是不是 target。
# 時間 O(log n)，空間 O(1)。
class Solution:
    def search(self, nums: list[int], target: int) -> int:
        left = -1
        right = len(nums)
        while left + 1 < right:
            mid = (left + right) // 2
            if nums[mid] >= target:
                right = mid
            else:
                left = mid

        if right < len(nums) and nums[right] == target:
            return right
        return -1
