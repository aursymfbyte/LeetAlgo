# 陣列已排序，左指針指最小、右指針指最大。
# 兩數和太大時，右邊這個數跟剩下任何數相加都太大，可以把它排除（右指針左移）；
# 和太小時，左邊這個數跟剩下任何數相加都太小，排除它（左指針右移）。每一步都排除一個數。
# 時間 O(n)，空間 O(1)。
class Solution:
    def twoSum(self, numbers: list[int], target: int) -> list[int]:
        left = 0
        right = len(numbers) - 1
        while True:
            total = numbers[left] + numbers[right]
            if total == target:
                return [left + 1, right + 1]
            if total > target:
                right -= 1
            else:
                left += 1
