# 房子圍成一圈，第一間和最後一間不能同時偷，所以拆成兩種情況各做一次 198 題的線性打家劫舍：
# 不偷最後一間（只看 nums[0] 到 nums[n - 2]），或不偷第一間（只看 nums[1] 到 nums[n - 1]），兩者取大。
# 線性部分：f[i] 表示前 i 間房子最多能偷多少，f[i] = max(f[i - 1], f[i - 2] + 第 i 間的錢)。
# f[i] 只依賴前兩項，所以只用 f0、f1 兩個變數記住 f[i - 2]、f[i - 1]；直接在原陣列上用 first、last 指定範圍，不複製子陣列。
# 只有一間房子時沒有相鄰問題，直接偷。
# 時間 O(n)，空間 O(1)。
class Solution:
    def rob(self, nums: list[int]) -> int:
        n = len(nums)
        if n == 1:
            return nums[0]
        return max(self.rob_range(nums, 0, n - 2), self.rob_range(nums, 1, n - 1))

    def rob_range(self, nums: list[int], first: int, last: int) -> int:
        f0 = 0
        f1 = nums[first]
        for i in range(first + 1, last + 1):
            new_f = max(f1, f0 + nums[i])
            f0 = f1
            f1 = new_f
        return f1
