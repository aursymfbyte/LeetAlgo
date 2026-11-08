# 單調堆疊：堆疊裡放「還沒等到更暖天氣」的日子下標，由底到頂溫度遞減。
# 走到第 i 天時，只要今天比堆疊頂端那天熱，那天的答案就是 i - 那天，把它彈出；
# 彈完之後再把今天放進堆疊。最後還留在堆疊裡的日子都等不到，答案維持 0。
# 每個下標最多進出堆疊一次，時間 O(n)，空間 O(n)。
class Solution:
    def dailyTemperatures(self, temperatures: list[int]) -> list[int]:
        n = len(temperatures)
        answer = [0] * n
        stack = []
        for i in range(n):
            while stack and temperatures[i] > temperatures[stack[-1]]:
                previous_day = stack.pop()
                answer[previous_day] = i - previous_day
            stack.append(i)
        return answer
