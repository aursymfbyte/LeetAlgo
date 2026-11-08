# 每個字母從第一次出現到最後一次出現，可以看成一個區間；同一個字母只能在一段裡，所以有重疊的區間必須合併在同一段。
# 先記錄每個字母最後出現的位置 last。
# 從左往右走，end 是目前這一段至少要延伸到的位置，每走到一個字母就用它的 last 更新 end。
# 走到 i == end 時，這一段裡所有字母都不會再出現，可以在這裡切開，記下長度並從 i + 1 開始新的一段。
# 時間 O(n)，空間 O(1)（字母只有 26 種）。
class Solution:
    def partitionLabels(self, s: str) -> list[int]:
        last = {}
        for i, letter in enumerate(s):
            last[letter] = i

        answer = []
        start = 0
        end = 0
        for i, letter in enumerate(s):
            end = max(end, last[letter])
            if i == end:
                answer.append(end - start + 1)
                start = i + 1
        return answer
