# 回溯：一格一格填長度 2n 的字串，dfs(open_count, close_count) 記錄目前已經放了幾個左、右括號。
# 左括號還沒用完（open_count < n）就可以放左括號。
# 只有在右括號比左括號少（close_count < open_count）時才能放右括號，這樣任何前綴的左括號數都 ≥ 右括號數，字串一定合法。
# 時間 O(n·C_n)，C_n 是第 n 個卡特蘭數（答案個數）；空間 O(n)（不計答案）。
class Solution:
    def generateParenthesis(self, n: int) -> list[str]:
        answer = []
        path = [""] * (2 * n)

        def dfs(open_count: int, close_count: int) -> None:
            if close_count == n:
                answer.append("".join(path))
                return
            position = open_count + close_count
            if open_count < n:
                path[position] = "("
                dfs(open_count + 1, close_count)
            if close_count < open_count:
                path[position] = ")"
                dfs(open_count, close_count + 1)

        dfs(0, 0)
        return answer
