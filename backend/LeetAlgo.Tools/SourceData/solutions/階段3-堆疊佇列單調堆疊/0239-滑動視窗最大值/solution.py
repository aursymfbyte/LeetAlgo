# 單調佇列：雙端佇列裡放下標，對應的值由前到後嚴格遞減，最前面就是目前視窗的最大值。
# 新元素 nums[i] 進來時，從尾端彈出所有 <= 它的元素，因為它們比 nums[i] 早離開又不比它大，不可能再當最大值。
# 前端的下標如果已經滑出視窗（<= i - k），就從前端彈出。
# 視窗湊滿 k 個之後，每一步的答案就是前端對應的值。
# 每個下標最多進出佇列一次，時間 O(n)，空間 O(k)。
from collections import deque


class Solution:
    def maxSlidingWindow(self, nums: list[int], k: int) -> list[int]:
        window = deque()
        answer = []
        for i, num in enumerate(nums):
            while window and nums[window[-1]] <= num:
                window.pop()
            window.append(i)

            if window[0] <= i - k:
                window.popleft()

            if i >= k - 1:
                answer.append(nums[window[0]])
        return answer
