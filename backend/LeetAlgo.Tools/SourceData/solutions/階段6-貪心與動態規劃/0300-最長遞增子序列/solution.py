# 貪心＋二分搜尋：tails[i] 表示「長度為 i + 1 的遞增子序列」中，結尾數字最小可以是多少。
# 結尾越小，後面越容易接上新的數字，而且 tails 一定是嚴格遞增的。
# 每看到一個數 num，用二分搜尋找出 tails 中第一個 >= num 的位置：
# 找不到就代表 num 比所有結尾都大，可以接在最長的那條後面，tails 變長；
# 找到的話就用 num 取代那個結尾，讓同樣長度的子序列結尾變得更小。最後 tails 的長度就是答案。
# 時間 O(n log n)，空間 O(n)。
class Solution:
    def lengthOfLIS(self, nums: list[int]) -> int:
        tails = []
        for num in nums:
            left = 0
            right = len(tails)
            while left < right:
                middle = (left + right) // 2
                if tails[middle] < num:
                    left = middle + 1
                else:
                    right = middle
            if left == len(tails):
                tails.append(num)
            else:
                tails[left] = num
        return len(tails)
