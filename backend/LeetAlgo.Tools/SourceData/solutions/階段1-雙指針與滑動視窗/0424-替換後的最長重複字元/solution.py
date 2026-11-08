# 一段子字串能全部換成同一個字母的條件：視窗長度 - 視窗內出現最多的字母個數 <= k（其餘字母都換掉）。
# 不定長滑動視窗求最長：右端點每進一個字母，就更新它的計數和 max_count；條件不成立就移出左端點的字母。
# max_count 在左端點右移時不用調小：答案要變長，一定要出現更大的 max_count，
# 用舊的 max_count 只會讓視窗維持原長度往右滑，不會算出錯誤的更長答案。
# 時間 O(n)，空間 O(26)。
class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = [0] * 26
        max_count = 0
        answer = 0
        left = 0
        for right, c in enumerate(s):
            index = ord(c) - ord("A")
            count[index] += 1
            max_count = max(max_count, count[index])
            while right - left + 1 - max_count > k:
                count[ord(s[left]) - ord("A")] -= 1
                left += 1
            answer = max(answer, right - left + 1)
        return answer
