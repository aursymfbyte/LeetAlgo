# 回溯（排列型）：dfs(position) 負責決定排列的第 position 個位置放哪個數。
# 用 used[i] 記錄 nums[i] 是否已經放進排列；每個位置都從還沒用過的數裡挑一個。
# 遞迴回來後把 used[i] 改回 False（恢復現場），讓這個數可以放在別的位置。
# 時間 O(n·n!)，空間 O(n)（不計答案）。
class Solution:
    def permute(self, nums: list[int]) -> list[list[int]]:
        n = len(nums)
        answer = []
        path = [0] * n
        used = [False] * n

        def dfs(position: int) -> None:
            if position == n:
                answer.append(path.copy())
                return
            for i in range(n):
                if not used[i]:
                    used[i] = True
                    path[position] = nums[i]
                    dfs(position + 1)
                    used[i] = False

        dfs(0)
        return answer
