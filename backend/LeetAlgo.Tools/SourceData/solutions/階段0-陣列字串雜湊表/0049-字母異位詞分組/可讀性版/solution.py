# 互為異位詞的字串，把字母排序後會變成同一個字串，拿它當雜湊表的鍵來分組。
# 時間 O(n·k log k)，空間 O(n·k)，n 是字串數量，k 是最長字串的長度。
class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        groups = {}
        for word in strs:
            key = "".join(sorted(word))
            if key not in groups:
                groups[key] = []
            groups[key].append(word)
        return list(groups.values())
