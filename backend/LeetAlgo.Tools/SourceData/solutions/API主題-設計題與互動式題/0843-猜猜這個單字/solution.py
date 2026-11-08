# 猜了 guess_word 得到 matches 之後，秘密單字和 guess_word 的吻合位置數一定剛好是 matches，
# 所以只留下「和 guess_word 吻合數也等於 matches」的候選字，其他都不可能是答案。
# 每次要猜哪個字：把剩下的候選字依「和這個字的吻合數」分組，最大那組就是猜它之後最壞會剩下的數量，
# 從所有單字中挑最壞情況最小的那個來猜（極小化極大），讓每一次猜測都盡量縮小範圍。
# 先看候選字、再看其他單字，而且只有嚴格更好才換，所以一樣好時會選到還可能是答案的候選字。
# 每次挑字 O(n * m * 6)，m 是剩下的候選字數，最多猜 allowedGuesses 次；空間 O(n)。
class Solution:
    def findSecretWord(self, words: List[str], master: 'Master') -> None:
        candidates = list(words)
        while candidates:
            guess_word = self.pick_guess(words, candidates)
            matches = master.guess(guess_word)
            if matches == 6:
                return
            candidates = [word for word in candidates if self.count_matches(word, guess_word) == matches]

    def pick_guess(self, words: List[str], candidates: List[str]) -> str:
        best_word = candidates[0]
        best_worst_case = len(candidates) + 1
        for word in candidates + words:
            worst_case = self.worst_case_remaining(word, candidates)
            if worst_case < best_worst_case:
                best_worst_case = worst_case
                best_word = word
        return best_word

    def worst_case_remaining(self, word: str, candidates: List[str]) -> int:
        group_sizes = [0] * 7
        for other in candidates:
            group_sizes[self.count_matches(word, other)] += 1
        return max(group_sizes)

    def count_matches(self, first: str, second: str) -> int:
        matches = 0
        for i in range(6):
            if first[i] == second[i]:
                matches += 1
        return matches
