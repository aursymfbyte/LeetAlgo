# 選或不選：f[i] 表示只考慮前 i 間房子（nums[0] 到 nums[i - 1]）最多能偷多少。
# 不偷第 i 間就是 f[i - 1]；偷第 i 間就不能偷第 i - 1 間，是 f[i - 2] + nums[i - 1]，兩者取大。
# 起點 f[0] = 0、f[1] = nums[0]，答案是 f[n]。
# f[i] 只依賴前兩項，所以只用 f0、f1 兩個變數記住 f[i - 2]、f[i - 1]，算完 f[i] 後往前挪一格。
# 時間 O(n)，空間 O(1)。
class Solution:
    def rob(self, nums: list[int]) -> int:
        n = len(nums)
        f0 = 0
        f1 = nums[0]
        for i in range(2, n + 1):
            new_f = max(f1, f0 + nums[i - 1])
            f0 = f1
            f1 = new_f
        return f1
