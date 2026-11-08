# 先排序，枚舉第一個數 nums[i]，剩下兩個數在 i 右邊用相向雙指針找（跟 167 題一樣）。
# 去重：nums[i] 跟前一個數相同就跳過；找到一組答案後，左右指針也要跳過相同的數。
# 剪枝一：nums[i] 加上它後面最小的兩個數已經 > 0，之後的 i 只會更大，直接結束。
# 剪枝二：nums[i] 加上最大的兩個數仍然 < 0，這個 i 不可能湊出 0，換下一個 i。
# 時間 O(n^2)，空間 O(1)（不計排序和輸出）。
class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        n = len(nums)
        answer = []
        for i in range(n - 2):
            first = nums[i]
            if i > 0 and first == nums[i - 1]:
                continue
            if first + nums[i + 1] + nums[i + 2] > 0:
                break
            if first + nums[n - 2] + nums[n - 1] < 0:
                continue

            left = i + 1
            right = n - 1
            while left < right:
                total = first + nums[left] + nums[right]
                if total > 0:
                    right -= 1
                elif total < 0:
                    left += 1
                else:
                    answer.append([first, nums[left], nums[right]])
                    left += 1
                    while left < right and nums[left] == nums[left - 1]:
                        left += 1
                    right -= 1
                    while left < right and nums[right] == nums[right + 1]:
                        right -= 1
        return answer
