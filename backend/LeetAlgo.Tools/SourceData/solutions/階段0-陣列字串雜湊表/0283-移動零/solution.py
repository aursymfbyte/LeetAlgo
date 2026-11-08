# 用 write 指向下一個要放非零數的位置，把非零數依序往前覆寫，最後把剩下的位置補 0。
# 時間 O(n)，空間 O(1)。
class Solution:
    def moveZeroes(self, nums: list[int]) -> None:
        write = 0
        for num in nums:
            if num != 0:
                nums[write] = num
                write += 1

        for i in range(write, len(nums)):
            nums[i] = 0
