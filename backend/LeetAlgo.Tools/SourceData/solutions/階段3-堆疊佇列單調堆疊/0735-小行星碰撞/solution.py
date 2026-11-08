# 由左往右處理，堆疊裡放目前還活著的小行星。
# 只有「堆疊頂端往右飛（正）、新的往左飛（負）」才會相撞：
# 頂端比較小就爆掉、繼續跟下一個比；一樣大就同歸於盡；頂端比較大就是新的爆掉。
# 新的小行星撐到最後沒爆，才放進堆疊。
# 每顆小行星最多進出堆疊一次，時間 O(n)，空間 O(n)。
class Solution:
    def asteroidCollision(self, asteroids: list[int]) -> list[int]:
        stack = []
        for asteroid in asteroids:
            alive = True
            while alive and asteroid < 0 and stack and stack[-1] > 0:
                if stack[-1] < -asteroid:
                    stack.pop()
                elif stack[-1] == -asteroid:
                    stack.pop()
                    alive = False
                else:
                    alive = False
            if alive:
                stack.append(asteroid)
        return stack
