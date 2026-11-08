# 不定長滑動視窗求最短：右端點每次往右擴一格，把 nums[right] 加進視窗和。
# 只要視窗和 >= target，就先用目前長度更新答案，再把左端點右移縮小視窗，試試更短的。
# 數字都是正數，視窗縮小和一定變小，所以左端點只會往右走，不用回頭。
# 時間 O(n)，空間 O(1)。
class Solution:
    def minSubArrayLen(self, target: int, nums: list[int]) -> int:
        n = len(nums)
        answer = n + 1
        window_sum = 0
        left = 0
        for right, num in enumerate(nums):
            window_sum += num
            while window_sum >= target:
                answer = min(answer, right - left + 1)
                window_sum -= nums[left]
                left += 1
        if answer > n:
            return 0
        return answer
