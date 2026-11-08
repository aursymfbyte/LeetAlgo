# 用集合記錄看過的數字，遇到已經在集合裡的數字就代表有重複。
# 時間 O(n)，空間 O(n)。
class Solution:
    def containsDuplicate(self, nums: list[int]) -> bool:
        seen = set()
        for num in nums:
            if num in seen:
                return True
            seen.add(num)
        return False
