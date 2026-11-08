# 先用單調堆疊算出 nums2 每個數的下一個更大元素：堆疊裡放還沒找到答案的數，由底到頂遞減，
# 新來的數比頂端大，頂端的答案就是它，彈出並記到雜湊表；沒被彈出的數答案就是 -1。
# 因為所有數字都不重複，可以直接用數值當雜湊表的 key，nums1 的每個查詢就是查表。
# 時間 O(m + n)，空間 O(n)，n 是 nums2 的長度，m 是 nums1 的長度。
class Solution:
    def nextGreaterElement(self, nums1: list[int], nums2: list[int]) -> list[int]:
        next_greater_of = {}
        stack = []
        for num in nums2:
            while stack and num > stack[-1]:
                next_greater_of[stack.pop()] = num
            stack.append(num)

        answer = []
        for num in nums1:
            answer.append(next_greater_of.get(num, -1))
        return answer
