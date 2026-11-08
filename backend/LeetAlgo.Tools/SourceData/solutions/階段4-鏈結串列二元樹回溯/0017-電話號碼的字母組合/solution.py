# 回溯：path[i] 代表第 i 個數字選了哪個字母，dfs(i) 負責填第 i 格。
# 每一格都把該數字對應的字母試一遍，填滿 n 格就得到一個組合。
# 因為每次都是直接覆蓋 path[i]，不需要額外的「撤銷」動作。
# 時間 O(n·4^n)，空間 O(n)（不計答案）。
PHONE_LETTERS = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]


class Solution:
    def letterCombinations(self, digits: str) -> list[str]:
        n = len(digits)
        answer = []
        path = [""] * n

        def dfs(index: int) -> None:
            if index == n:
                answer.append("".join(path))
                return
            for letter in PHONE_LETTERS[int(digits[index])]:
                path[index] = letter
                dfs(index + 1)

        dfs(0)
        return answer
