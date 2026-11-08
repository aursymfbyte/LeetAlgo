# need[c] 表示視窗還欠幾個 c（負數代表有多的），missing_kinds 是還沒湊齊的字母種類數。
# 右端點每進一個字母就把它的 need 減一，剛好減到 0 代表這種字母湊齊了，missing_kinds 減一。
# missing_kinds 變成 0 時視窗已涵蓋 t：先用它更新最短答案，再移出左端點的字母縮小視窗；
# 移出的字母如果原本 need 剛好是 0，移出後就不夠了，missing_kinds 加一，停止縮小。
# 每個字母最多進出視窗各一次，時間 O(m + n)，空間 O(字元集大小)。
from collections import Counter


class Solution:
    def minWindow(self, s: str, t: str) -> str:
        need = Counter(t)
        missing_kinds = len(need)
        best_left = -1
        best_right = len(s)
        left = 0
        for right, c in enumerate(s):
            need[c] -= 1
            if need[c] == 0:
                missing_kinds -= 1
            while missing_kinds == 0:
                if right - left < best_right - best_left:
                    best_left = left
                    best_right = right
                out = s[left]
                if need[out] == 0:
                    missing_kinds += 1
                need[out] += 1
                left += 1
        if best_left < 0:
            return ""
        return s[best_left:best_right + 1]
