# 兩個子集和相等，代表要從 nums 選出一些數，總和恰好是全部總和的一半（總和是奇數就不可能）。
# 0-1 背包可行性：f[c] 表示目前看過的數中，能不能選出總和恰好為 c 的數，f[0] = True；
# 每個數 num 讓 f[c] = f[c] or f[c - num]。容量倒序枚舉，確保每個數最多選一次。
# 時間 O(n · sum)，空間 O(sum)。
class Solution:
    def canPartition(self, nums: list[int]) -> bool:
        total = sum(nums)
        if total % 2 == 1:
            return False
        half = total // 2

        f = [False] * (half + 1)
        f[0] = True
        for num in nums:
            for c in range(half, num - 1, -1):
                f[c] = f[c] or f[c - num]
        return f[half]
