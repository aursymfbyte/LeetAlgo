# 用雜湊表記錄看過的數字和它的下標，每走到一個數，就查 target - num 有沒有出現過。
# 先查再存，才不會把同一個元素用兩次。
# 時間 O(n)，空間 O(n)。
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        index_of = {}
        for i, num in enumerate(nums):
            need = target - num
            if need in index_of:
                return [index_of[need], i]
            index_of[num] = i
        return []
