# 先排序，再回溯：dfs(start, remaining) 表示下一個數從 candidates[start] 開始選，還要湊出 remaining。
# 選了 candidates[i] 之後，下一層仍從 i 開始（不是 i + 1），所以同一個數可以重複選。
# 只往後選不回頭，[2,2,3] 和 [2,3,2] 這種順序不同的重複組合就不會出現。
# 排序後一旦 candidates[i] > remaining，後面的數只會更大，直接停止。
# 時間取決於答案的數量與長度（指數級），空間 O(target)（遞迴深度最多 target / 2）。
class Solution:
    def combinationSum(self, candidates: list[int], target: int) -> list[list[int]]:
        candidates.sort()
        answer = []
        path = []

        def dfs(start: int, remaining: int) -> None:
            if remaining == 0:
                answer.append(path.copy())
                return
            for i in range(start, len(candidates)):
                if candidates[i] > remaining:
                    break
                path.append(candidates[i])
                dfs(i, remaining - candidates[i])
                path.pop()

        dfs(0, target)
        return answer
