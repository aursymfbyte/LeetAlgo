# 從左往右走，維護目前最遠能到達的位置 max_reach。
# 如果走到下標 i 時 i > max_reach，代表 i 根本到不了，後面也都到不了，回傳 False；
# 否則用 i + nums[i] 更新 max_reach。能走完整個陣列就代表最後一格到得了。
# 時間 O(n)，空間 O(1)。
class Solution:
    def canJump(self, nums: list[int]) -> bool:
        max_reach = 0
        for i, jump in enumerate(nums):
            if i > max_reach:
                return False
            max_reach = max(max_reach, i + jump)
        return True
