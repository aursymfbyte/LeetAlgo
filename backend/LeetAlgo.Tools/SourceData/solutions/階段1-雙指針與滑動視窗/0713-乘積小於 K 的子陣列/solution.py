# 不定長滑動視窗求方案數：右端點每次把 nums[right] 乘進視窗乘積，
# 乘積 >= k 時就把左端點的數除掉、左端點右移，直到乘積 < k。
# 這時 [left, right]、[left + 1, right]、……、[right, right] 的乘積都 < k，共 right - left + 1 個，全部加進答案。
# k <= 1 時任何正整數乘積都不會 < k，直接回傳 0（也避免左端點越過右端點）。
# 時間 O(n)，空間 O(1)。
class Solution:
    def numSubarrayProductLessThanK(self, nums: list[int], k: int) -> int:
        if k <= 1:
            return 0
        product = 1
        answer = 0
        left = 0
        for right, num in enumerate(nums):
            product *= num
            while product >= k:
                product //= nums[left]
                left += 1
            answer += right - left + 1
        return answer
