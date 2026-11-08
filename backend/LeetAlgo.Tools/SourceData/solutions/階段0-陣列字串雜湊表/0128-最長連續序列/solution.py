# 把數字放進集合。只有當 num - 1 不在集合裡時，num 才是一段連續序列的起點，
# 從起點往上數 num + 1、num + 2…… 直到中斷。每個數最多被數到一次。
# 時間 O(n)，空間 O(n)。
class Solution:
    def longestConsecutive(self, nums: list[int]) -> int:
        num_set = set(nums)
        longest = 0
        for num in num_set:
            if num - 1 in num_set:
                continue

            current = num
            length = 1
            while current + 1 in num_set:
                current += 1
                length += 1
            longest = max(longest, length)
        return longest
