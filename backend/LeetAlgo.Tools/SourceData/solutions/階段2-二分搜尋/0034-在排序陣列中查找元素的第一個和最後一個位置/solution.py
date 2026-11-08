# 寫一個 lower_bound 找第一個 >= target 的位置，其他比較都轉成它：
# 開始位置 = lower_bound(target)；結束位置 = 第一個 > target 的位置 - 1 = lower_bound(target + 1) - 1。
# 如果開始位置超出陣列，或那個數不是 target，代表 target 不存在。
# lower_bound 用開區間 (left, right) 二分，保持 nums[left] < target、nums[right] >= target。
# 時間 O(log n)，空間 O(1)。
class Solution:
    def searchRange(self, nums: list[int], target: int) -> list[int]:
        start = self.lower_bound(nums, target)
        if start == len(nums) or nums[start] != target:
            return [-1, -1]
        end = self.lower_bound(nums, target + 1) - 1
        return [start, end]

    def lower_bound(self, nums: list[int], target: int) -> int:
        left = -1
        right = len(nums)
        while left + 1 < right:
            mid = (left + right) // 2
            if nums[mid] >= target:
                right = mid
            else:
                left = mid
        return right
