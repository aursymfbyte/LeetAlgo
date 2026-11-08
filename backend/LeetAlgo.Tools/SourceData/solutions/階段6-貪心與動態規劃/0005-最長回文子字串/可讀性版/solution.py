# 中心擴展：回文串以中心左右對稱，長度為奇數時中心是一個字元，偶數時中心在兩個字元之間，
# 所以長度 n 的字串共有 2n - 1 個中心。center 為偶數時從 (center // 2, center // 2) 開始，
# 奇數時從 (center // 2, center // 2 + 1) 開始，兩端字元相同就往外擴，記錄擴到最長的那一段。
# 時間 O(n^2)，空間 O(1)（不算回傳的字串）。
class Solution:
    def longestPalindrome(self, s: str) -> str:
        n = len(s)
        best_start = 0
        best_length = 0
        for center in range(2 * n - 1):
            left = center // 2
            right = left + center % 2
            while left >= 0 and right < n and s[left] == s[right]:
                left -= 1
                right += 1
            length = right - left - 1
            if length > best_length:
                best_length = length
                best_start = left + 1
        return s[best_start:best_start + best_length]
