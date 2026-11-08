# 把每個單字當成節點，只差一個字母的兩個單字之間有邊，題目就變成在這張隱含圖上求最短路，用 BFS。
# 不先把圖建出來，而是走到一個單字時，把它每個位置換成 a 到 z，看換完的字在不在字典裡，在的話就是鄰居。
# 字典裡的字被走到就從集合移除，等於標記走過，之後不會再進佇列。
# 時間 O(N * L^2 * 26)，空間 O(N * L)，N 是字典大小、L 是單字長度。
from collections import deque


class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: list[str]) -> int:
        unvisited = set(wordList)
        if endWord not in unvisited:
            return 0
        unvisited.discard(beginWord)

        queue = deque([beginWord])
        word_count = 1
        while queue:
            word_count += 1
            for _ in range(len(queue)):
                word = queue.popleft()
                for position in range(len(word)):
                    for letter in "abcdefghijklmnopqrstuvwxyz":
                        next_word = word[:position] + letter + word[position + 1:]
                        if next_word not in unvisited:
                            continue
                        if next_word == endWord:
                            return word_count
                        unvisited.remove(next_word)
                        queue.append(next_word)
        return 0
