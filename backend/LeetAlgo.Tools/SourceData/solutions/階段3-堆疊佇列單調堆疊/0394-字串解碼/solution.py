# 由左往右掃，current 是目前這一層正在組的字串，count 是正在讀的重複次數（可能有好幾位數）。
# 遇到 '[' 代表進入新的一層：把「外層已組好的字串」和「這層要重複幾次」存進堆疊，再清空重新開始。
# 遇到 ']' 代表這一層結束：從堆疊取回外層字串和次數，外層字串 + current 重複 k 次，就是新的 current。
# 時間 O(答案長度)，空間 O(答案長度)。
class Solution:
    def decodeString(self, s: str) -> str:
        saved_strings = []
        saved_counts = []
        current = ""
        count = 0
        for ch in s:
            if ch.isdigit():
                count = count * 10 + int(ch)
            elif ch == "[":
                saved_strings.append(current)
                saved_counts.append(count)
                current = ""
                count = 0
            elif ch == "]":
                previous = saved_strings.pop()
                repeat = saved_counts.pop()
                current = previous + current * repeat
            else:
                current += ch
        return current
