# 先用 153 題的方法找出最小值的位置 min_index，它把陣列切成兩段各自遞增：[0, min_index) 和 [min_index, n)。
# 前段的數都比最後一個數大，所以 target > nums[n - 1] 時只可能在前段，否則只可能在後段。
# 在那一段裡找第一個 >= target 的位置，再檢查它是不是 target。
# 兩次二分都用開區間 (left, right)。
# 時間 O(log n)，空間 O(1)。
class Solution:
    def search(self, nums: list[int], target: int) -> int:
        n = len(nums)
        min_index = self.find_min_index(nums)
        if target > nums[n - 1]:
            index = self.lower_bound(nums, -1, min_index, target)
        else:
            index = self.lower_bound(nums, min_index - 1, n, target)

        if index < n and nums[index] == target:
            return index
        return -1

    def find_min_index(self, nums: list[int]) -> int:
        n = len(nums)
        left = -1
        right = n - 1
        while left + 1 < right:
            mid = (left + right) // 2
            if nums[mid] < nums[n - 1]:
                right = mid
            else:
                left = mid
        return right

    def lower_bound(self, nums: list[int], left: int, right: int, target: int) -> int:
        while left + 1 < right:
            mid = (left + right) // 2
            if nums[mid] >= target:
                right = mid
            else:
                left = mid
        return right
