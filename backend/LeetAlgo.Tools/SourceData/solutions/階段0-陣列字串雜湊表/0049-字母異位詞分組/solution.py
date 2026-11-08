# 互為異位詞的字串，26 個字母各自出現的次數一定完全相同。
# 數出每個字串裡 26 個字母的出現次數，拿這組次數當雜湊表的鍵來分組，就不用排序字串。
# 時間 O(n·(k + 26))，空間 O(n·(k + 26))，n 是字串數量，k 是最長字串的長度。
class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        groups = {}
        for word in strs:
            counts = [0] * 26
            for letter in word:
                counts[ord(letter) - ord("a")] += 1
            key = tuple(counts)

            if key not in groups:
                groups[key] = []
            groups[key].append(word)
        return list(groups.values())
