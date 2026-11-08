# 把 potions 由小到大排序後，對同一個咒語 spell，乘積 >= success 的藥水會是排序後的一段後綴。
# 對每個咒語用開區間 (left, right) 二分，找第一個 spell * potions[mid] >= success 的位置 index，
# 成功的藥水數就是 m - index。
# 時間 O((n + m) log m)；不算排序和回傳陣列，空間 O(1)。
class Solution:
    def successfulPairs(self, spells: list[int], potions: list[int], success: int) -> list[int]:
        potions.sort()
        m = len(potions)
        pairs = []
        for spell in spells:
            index = self.first_success_index(potions, spell, success)
            pairs.append(m - index)
        return pairs

    def first_success_index(self, potions: list[int], spell: int, success: int) -> int:
        left = -1
        right = len(potions)
        while left + 1 < right:
            mid = (left + right) // 2
            if spell * potions[mid] >= success:
                right = mid
            else:
                left = mid
        return right
