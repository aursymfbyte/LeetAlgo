# 每個節點有 26 個子節點（對應 a 到 z）和一個 is_end，標記是否有單字在這裡結束。
# insert 沿著字母往下走，沒有的子節點就建立，最後把結尾節點標成 is_end。
# search 和 startsWith 都是沿著字母往下找節點：找不到就是 False；
# 找到了，startsWith 直接回傳 True，search 還要看結尾節點的 is_end。
# 每個操作 O(L)，L 是字串長度；空間 O(所有插入字串的總長度 × 26)。
class TrieNode:
    def __init__(self):
        self.children = [None] * 26
        self.is_end = False


class Trie:

    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            index = ord(ch) - ord("a")
            if node.children[index] is None:
                node.children[index] = TrieNode()
            node = node.children[index]
        node.is_end = True

    def find_node(self, text: str) -> TrieNode | None:
        node = self.root
        for ch in text:
            index = ord(ch) - ord("a")
            if node.children[index] is None:
                return None
            node = node.children[index]
        return node

    def search(self, word: str) -> bool:
        node = self.find_node(word)
        return node is not None and node.is_end

    def startsWith(self, prefix: str) -> bool:
        return self.find_node(prefix) is not None
