# 劃分型 DP：f[i] 表示 s 的前 i 個字元能不能拆成字典裡的單字，f[0] = True（空字串）。
# 枚舉最後一段是哪個單字 word：如果前 i 個字元剛好以 word 結尾，且 f[i - len(word)] 為真，f[i] 就為真。
# 時間 O(n · D · L)，n 是 s 的長度、D 是單字數、L 是單字最大長度；空間 O(n)。
class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        n = len(s)
        f = [False] * (n + 1)
        f[0] = True
        for i in range(1, n + 1):
            for word in wordDict:
                start = i - len(word)
                if start >= 0 and f[start] and s[start:i] == word:
                    f[i] = True
                    break
        return f[n]
