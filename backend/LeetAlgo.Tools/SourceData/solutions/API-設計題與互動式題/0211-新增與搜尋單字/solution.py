# 用字典樹存所有加入的單字，每個節點有 26 個子節點和 is_end 標記。
# 搜尋時用回溯：dfs(node, index) 表示從 node 開始，能不能配對 word[index:]。
# 遇到一般字母只走對應的子節點；遇到 '.' 就把每個存在的子節點都試一次，任何一條成功就是 True。
# 走完整個 word 時，要停在 is_end 的節點才算有這個單字。
# addWord O(L)；search 最壞 O(26^d × L)，d 是 '.' 的個數（最多 2）；空間 O(所有單字總長度 × 26)。
class TrieNode:
    def __init__(self):
        self.children = [None] * 26
        self.is_end = False


class WordDictionary:

    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word: str) -> None:
        node = self.root
        for ch in word:
            index = ord(ch) - ord("a")
            if node.children[index] is None:
                node.children[index] = TrieNode()
            node = node.children[index]
        node.is_end = True

    def search(self, word: str) -> bool:
        return self.dfs(self.root, word, 0)

    def dfs(self, node: TrieNode, word: str, index: int) -> bool:
        if index == len(word):
            return node.is_end
        ch = word[index]
        if ch == ".":
            for child in node.children:
                if child is not None and self.dfs(child, word, index + 1):
                    return True
            return False
        child = node.children[ord(ch) - ord("a")]
        return child is not None and self.dfs(child, word, index + 1)
