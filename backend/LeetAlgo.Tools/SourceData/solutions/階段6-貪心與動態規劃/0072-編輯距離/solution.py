# f[i][j] 表示把 word1 的前 i 個字元變成 word2 的前 j 個字元最少要幾次操作。
# 最後一個字元相同就不用動，f[i][j] = f[i - 1][j - 1]；
# 不同就看最後一步是刪除 f[i - 1][j]、插入 f[i][j - 1] 還是替換 f[i - 1][j - 1]，取最小再加 1。
# 邊界：f[i][0] = i（全部刪掉），f[0][j] = j（全部插入）。
# 每一列只依賴上一列，所以只留一個長度 m + 1 的一維陣列 f：更新 f[j] 前它還是 f[i - 1][j]，f[j - 1] 已經是 f[i][j - 1]，
# 左上角的 f[i - 1][j - 1] 會被蓋掉，先用 pre 存起來。
# 編輯距離是對稱的（操作反過來做就是另一個方向），所以先交換讓 word2 是較短的字串，陣列長度只跟較短的有關。
# 時間 O(nm)，空間 O(min(n, m))。
class Solution:
    def minDistance(self, word1: str, word2: str) -> int:
        if len(word2) > len(word1):
            word1, word2 = word2, word1
        n = len(word1)
        m = len(word2)
        f = list(range(m + 1))

        for i in range(1, n + 1):
            pre = f[0]
            f[0] = i
            for j in range(1, m + 1):
                temp = f[j]
                if word1[i - 1] == word2[j - 1]:
                    f[j] = pre
                else:
                    f[j] = min(f[j], f[j - 1], pre) + 1
                pre = temp
        return f[m]
