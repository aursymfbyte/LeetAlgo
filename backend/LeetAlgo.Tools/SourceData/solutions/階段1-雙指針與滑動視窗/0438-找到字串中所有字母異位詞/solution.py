# 異位詞就是每個字母出現次數都一樣，所以用長度固定為 len(p) 的滑動視窗，維護視窗內 26 個字母的計數。
# 每一步：進：s[right] 計數加一；更新：視窗長度到 len(p) 時，計數跟 p 的計數完全相同就記下左端點；出：s[left] 計數減一。
# 時間 O(26n)，空間 O(26)。
class Solution:
    def findAnagrams(self, s: str, p: str) -> list[int]:
        target_count = [0] * 26
        for c in p:
            target_count[ord(c) - ord("a")] += 1

        window_count = [0] * 26
        window_size = len(p)
        answer = []
        for right, c in enumerate(s):
            window_count[ord(c) - ord("a")] += 1
            left = right - window_size + 1
            if left < 0:
                continue
            if window_count == target_count:
                answer.append(left)
            window_count[ord(s[left]) - ord("a")] -= 1
        return answer
