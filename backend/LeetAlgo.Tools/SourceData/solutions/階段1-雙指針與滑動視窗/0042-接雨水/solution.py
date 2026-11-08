# 前後綴分解：第 i 格能接的水 = min(左邊含自己的最高, 右邊含自己的最高) - height[i]。
# 改用相向雙指針，邊走邊維護 preMax（左指針以左最高）和 sufMax（右指針以右最高）：
# 若 preMax < sufMax，左指針那格真正的後綴最高一定 >= sufMax > preMax，水量就由 preMax 決定，
# 可以直接算出來再右移左指針；反之，右指針那格的水量由 sufMax 決定，算完左移右指針。
# 時間 O(n)，空間 O(1)。
class Solution:
    def trap(self, height: list[int]) -> int:
        left = 0
        right = len(height) - 1
        pre_max = 0
        suf_max = 0
        answer = 0
        while left < right:
            pre_max = max(pre_max, height[left])
            suf_max = max(suf_max, height[right])
            if pre_max < suf_max:
                answer += pre_max - height[left]
                left += 1
            else:
                answer += suf_max - height[right]
                right -= 1
        return answer
