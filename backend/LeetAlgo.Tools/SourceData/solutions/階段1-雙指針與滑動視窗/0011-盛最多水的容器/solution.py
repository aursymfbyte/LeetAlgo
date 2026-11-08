# 左右指針從兩端開始，面積 = 寬度 × 兩條線中較短的那條。
# 每次移動較短的那條：如果移動較長的，寬度變小，高度仍被短板限制住，面積不可能變大，
# 所以短板跟中間任何一條線都圍不出更大的面積，可以直接排除。
# 時間 O(n)，空間 O(1)。
class Solution:
    def maxArea(self, height: list[int]) -> int:
        left = 0
        right = len(height) - 1
        answer = 0
        while left < right:
            area = (right - left) * min(height[left], height[right])
            answer = max(answer, area)
            if height[left] < height[right]:
                left += 1
            else:
                right -= 1
        return answer
