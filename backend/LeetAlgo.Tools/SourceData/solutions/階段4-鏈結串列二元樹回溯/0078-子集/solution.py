# 回溯（選或不選）：dfs(i) 決定 nums[i] 要不要放進子集。
# 不選就直接看下一個數；選就先放進 path，遞迴回來後再拿掉（恢復現場）。
# 每個數都決定完（i == n）時，path 就是一個子集。
# 時間 O(n·2^n)，空間 O(n)（不計答案）。
class Solution:
    def subsets(self, nums: list[int]) -> list[list[int]]:
        n = len(nums)
        answer = []
        path = []

        def dfs(index: int) -> None:
            if index == n:
                answer.append(path.copy())
                return
            dfs(index + 1)
            path.append(nums[index])
            dfs(index + 1)
            path.pop()

        dfs(0)
        return answer
