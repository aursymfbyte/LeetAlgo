# Manacher 演算法。先在每個字元的前後插入 '#'，例如 "aba" 變成 "#a#b#a#"，
# 這樣不論原本的回文長度是奇數還是偶數，在新字串裡都會變成以某個位置為中心的奇數長度回文。
# radius[i] 表示在新字串中以 i 為中心，往左右各能延伸幾個字元仍然是回文；
# 換算回原字串，這段回文的長度剛好是 radius[i]，起點是 (i - radius[i]) // 2。
# 從左到右計算 radius，同時記錄目前「右端點最遠」的回文：中心是 center，右端點是 right_boundary。
# 如果 i 在 right_boundary 之內，i 對於 center 的鏡像位置 mirror = 2 * center - i 已經算過，
# 因為大回文左右對稱，i 附近的樣子和 mirror 附近一樣，所以 radius[i] 至少是
# min(radius[mirror], right_boundary - i)，可以直接從這個長度開始，不用從 0 重新比對。
# 接著再一個一個字元往外擴；如果擴出了 right_boundary，就把 center 和 right_boundary 更新成 i 這段。
# right_boundary 只會往右移、不會往回，所以往外擴的總次數是 O(n)。
# 時間 O(n)，空間 O(n)。
class Solution:
    def longestPalindrome(self, s: str) -> str:
        transformed = "#" + "#".join(s) + "#"
        m = len(transformed)
        radius = [0] * m
        center = 0
        right_boundary = 0
        best_start = 0
        best_length = 0
        for i in range(m):
            current_radius = 0
            if i < right_boundary:
                mirror = 2 * center - i
                current_radius = min(radius[mirror], right_boundary - i)
            while (i - current_radius - 1 >= 0 and i + current_radius + 1 < m
                   and transformed[i - current_radius - 1] == transformed[i + current_radius + 1]):
                current_radius += 1
            radius[i] = current_radius
            if i + current_radius > right_boundary:
                center = i
                right_boundary = i + current_radius
            if current_radius > best_length:
                best_length = current_radius
                best_start = (i - current_radius) // 2
        return s[best_start:best_start + best_length]
