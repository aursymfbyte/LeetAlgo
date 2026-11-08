# 用長度 26 的陣列計數：s 的字母加一、t 的字母減一，最後全部歸零才是異位詞。
# 時間 O(n)，空間 O(1)。
class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s) != len(t):
            return False

        count = [0] * 26
        for ch in s:
            count[ord(ch) - ord("a")] += 1
        for ch in t:
            count[ord(ch) - ord("a")] -= 1

        for value in count:
            if value != 0:
                return False
        return True
