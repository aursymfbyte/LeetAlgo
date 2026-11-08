# s1 的某個排列是 s2 的子字串，等於 s2 裡有一段長度為 len(s1)、字母計數跟 s1 完全相同的視窗（跟 438 題一樣）。
# 用定長滑動視窗維護 26 個字母的計數，每一步：進 s2[right]；長度到了就比對計數，相同直接回傳 True；出 s2[left]。
# 時間 O(26n)，空間 O(26)。
class Solution:
    def checkInclusion(self, s1: str, s2: str) -> bool:
        target_count = [0] * 26
        for c in s1:
            target_count[ord(c) - ord("a")] += 1

        window_count = [0] * 26
        window_size = len(s1)
        for right, c in enumerate(s2):
            window_count[ord(c) - ord("a")] += 1
            left = right - window_size + 1
            if left < 0:
                continue
            if window_count == target_count:
                return True
            window_count[ord(s2[left]) - ord("a")] -= 1
        return False
