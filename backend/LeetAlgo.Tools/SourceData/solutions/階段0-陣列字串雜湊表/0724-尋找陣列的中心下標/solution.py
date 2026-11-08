# 先算出總和，再從左往右累加左邊的和；右邊的和就是 總和 - 左邊 - nums[i]，兩邊相等就是答案。
# 時間 O(n)，空間 O(1)。
class Solution:
    def pivotIndex(self, nums: list[int]) -> int:
        total = sum(nums)
        left_sum = 0
        for i, num in enumerate(nums):
            right_sum = total - left_sum - num
            if left_sum == right_sum:
                return i
            left_sum += num
        return -1
