# 先把字典裡的單字全部放進字典樹（Trie）。
# f[i] 表示 s 的前 i 個字元能不能拆成字典裡的單字，f[0] = True（空字串）。
# 從左到右枚舉 i，只要 f[i] 為真，就從 s[i] 開始沿著字典樹往後走：
# 每走到一個單字結尾的節點（對應 s[i..j]），就代表前 j + 1 個字元也能拆，f[j + 1] = True；
# 字典樹走不下去就停，所以每個 i 最多只走 L 步。
# n 是 s 的長度、D 是單字數、L 是單字最大長度。
# 時間 O(n·L + D·L)，空間 O(n + D·L)。
class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False


class Solution:
    def wordBreak(self, s: str, wordDict: list[str]) -> bool:
        root = TrieNode()
        for word in wordDict:
            node = root
            for char in word:
                if char not in node.children:
                    node.children[char] = TrieNode()
                node = node.children[char]
            node.is_end = True

        n = len(s)
        f = [False] * (n + 1)
        f[0] = True
        for i in range(n):
            if not f[i]:
                continue
            node = root
            for j in range(i, n):
                if s[j] not in node.children:
                    break
                node = node.children[s[j]]
                if node.is_end:
                    f[j + 1] = True
        return f[n]
