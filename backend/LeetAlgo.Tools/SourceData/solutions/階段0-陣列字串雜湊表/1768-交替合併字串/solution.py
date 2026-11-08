# 用同一個下標 i 同時走兩個字串，每輪各取一個字元；較短的字串用完後，只取另一個。
# 時間 O(m + n)，空間 O(m + n)。
class Solution:
    def mergeAlternately(self, word1: str, word2: str) -> str:
        result = []
        i = 0
        while i < len(word1) or i < len(word2):
            if i < len(word1):
                result.append(word1[i])
            if i < len(word2):
                result.append(word2[i])
            i += 1
        return "".join(result)
