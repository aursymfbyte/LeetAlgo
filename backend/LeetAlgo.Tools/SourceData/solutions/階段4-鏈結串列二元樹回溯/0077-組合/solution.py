# 回溯（枚舉下一個選哪個數）：dfs(start) 表示下一個數只能從 start 開始選。
# 只往後選，同一組數字就只會以遞增順序出現一次，不會重複。
# 剪枝：還要選 need 個數時，起點最大只能到 n - need + 1，再往後剩下的數不夠湊滿 k 個。
# 時間 O(k·C(n, k))，空間 O(k)（不計答案）。
class Solution:
    def combine(self, n: int, k: int) -> list[list[int]]:
        answer = []
        path = []

        def dfs(start: int) -> None:
            need = k - len(path)
            if need == 0:
                answer.append(path.copy())
                return
            for number in range(start, n - need + 2):
                path.append(number)
                dfs(number + 1)
                path.pop()

        dfs(1)
        return answer
