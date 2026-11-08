# 回溯（枚舉這一段切到哪裡）：dfs(start) 表示 s[start:] 還沒切。
# 枚舉這一段的結尾 end，只有 s[start..end] 是回文才切下來放進 path，再從 end + 1 繼續切。
# start 走到字串尾端時，path 就是一種切法；遞迴回來後把這一段拿掉（恢復現場）。
# 時間 O(n·2^n)，空間 O(n)（不計答案）。
class Solution:
    def partition(self, s: str) -> list[list[str]]:
        n = len(s)
        answer = []
        path = []

        def is_palindrome(left: int, right: int) -> bool:
            while left < right:
                if s[left] != s[right]:
                    return False
                left += 1
                right -= 1
            return True

        def dfs(start: int) -> None:
            if start == n:
                answer.append(path.copy())
                return
            for end in range(start, n):
                if is_palindrome(start, end):
                    path.append(s[start:end + 1])
                    dfs(end + 1)
                    path.pop()

        dfs(0)
        return answer
