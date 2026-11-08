# 左右兩個指針從兩端往中間走，遇到不是字母或數字的字元就跳過，
# 兩邊都停在字母或數字上時，轉成小寫比較，不同就不是回文。
# 時間 O(n)，空間 O(1)。
class Solution:
    def isPalindrome(self, s: str) -> bool:
        left = 0
        right = len(s) - 1
        while left < right:
            if not s[left].isalnum():
                left += 1
            elif not s[right].isalnum():
                right -= 1
            elif s[left].lower() != s[right].lower():
                return False
            else:
                left += 1
                right -= 1
        return True
