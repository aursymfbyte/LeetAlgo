# 枚舉每根柱子當矩形的高度，矩形能往左右延伸到「第一根比它矮的柱子」為止。
# 用單調堆疊各掃一次：left[i] 是左邊第一根比它矮的柱子下標（沒有就是 -1），
# right[i] 是右邊第一根比它矮的柱子下標（沒有就是 n），寬度就是 right[i] - left[i] - 1。
# 堆疊裡的高度由底到頂嚴格遞增，比目前柱子高或一樣高的都彈出，剩下的頂端就是第一根更矮的。
# 時間 O(n)，空間 O(n)。
class Solution:
    def largestRectangleArea(self, heights: list[int]) -> int:
        n = len(heights)

        left = [-1] * n
        stack = []
        for i in range(n):
            while stack and heights[stack[-1]] >= heights[i]:
                stack.pop()
            if stack:
                left[i] = stack[-1]
            stack.append(i)

        right = [n] * n
        stack = []
        for i in range(n - 1, -1, -1):
            while stack and heights[stack[-1]] >= heights[i]:
                stack.pop()
            if stack:
                right[i] = stack[-1]
            stack.append(i)

        answer = 0
        for i in range(n):
            width = right[i] - left[i] - 1
            answer = max(answer, heights[i] * width)
        return answer
