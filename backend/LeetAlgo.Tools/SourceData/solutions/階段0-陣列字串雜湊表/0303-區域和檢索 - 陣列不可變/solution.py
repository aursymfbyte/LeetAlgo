# 建立前綴和 prefix[i] = nums[0] 到 nums[i - 1] 的總和，
# 區間 [left, right] 的和就是 prefix[right + 1] - prefix[left]。
# 建構 O(n)，每次查詢 O(1)，空間 O(n)。
class NumArray:
    def __init__(self, nums: list[int]):
        self.prefix = [0] * (len(nums) + 1)
        for i, num in enumerate(nums):
            self.prefix[i + 1] = self.prefix[i] + num

    def sumRange(self, left: int, right: int) -> int:
        return self.prefix[right + 1] - self.prefix[left]
