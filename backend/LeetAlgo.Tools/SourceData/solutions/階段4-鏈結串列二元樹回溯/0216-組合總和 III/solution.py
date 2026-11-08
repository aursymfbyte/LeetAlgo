# 回溯（枚舉下一個選哪個數）：dfs(start, remaining) 表示下一個數從 start 開始選，還要湊出 remaining。
# 只往後選，每個數最多用一次，也不會出現重複的組合。
# 剪枝一（個數）：還要選 need 個數時，起點最大只能到 9 - need + 1，否則剩下的數不夠。
# 剪枝二（總和）：數字是由小到大枚舉，一旦 number > remaining，後面更大的數也不可能，直接停止。
# 時間 O(k·C(9, k))，空間 O(k)（不計答案）。
class Solution:
    def combinationSum3(self, k: int, n: int) -> list[list[int]]:
        answer = []
        path = []

        def dfs(start: int, remaining: int) -> None:
            need = k - len(path)
            if need == 0:
                if remaining == 0:
                    answer.append(path.copy())
                return
            for number in range(start, 9 - need + 2):
                if number > remaining:
                    break
                path.append(number)
                dfs(number + 1, remaining - number)
                path.pop()

        dfs(1, n)
        return answer
