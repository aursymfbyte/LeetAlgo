# answer[i] = 左邊所有數的乘積 × 右邊所有數的乘積。
# 第一趟從左往右，把左邊乘積寫進 answer；第二趟從右往左，用一個變數累乘右邊乘積再乘上去。
# 時間 O(n)，空間 O(1)（不算答案陣列）。
class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        n = len(nums)
        answer = [1] * n

        left_product = 1
        for i in range(n):
            answer[i] = left_product
            left_product *= nums[i]

        right_product = 1
        for i in range(n - 1, -1, -1):
            answer[i] *= right_product
            right_product *= nums[i]

        return answer
