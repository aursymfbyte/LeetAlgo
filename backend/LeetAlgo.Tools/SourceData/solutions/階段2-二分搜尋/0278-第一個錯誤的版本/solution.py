# 某個版本之後全部都是壞的，所以 isBadVersion(1..n) 的結果是 false...false true...true，要找第一個 true。
# 用開區間 (left, right) 二分：left = 0 當成好的版本，right = n 一定是壞的（最新版是壞的），
# 過程中保持 left 是好的、right 是壞的，區間變空時 right 就是第一個壞版本。
# 每次呼叫 isBadVersion 都讓區間砍半，總共只呼叫 O(log n) 次。
# 時間 O(log n)，空間 O(1)。
class Solution:
    def firstBadVersion(self, n: int) -> int:
        left = 0
        right = n
        while left + 1 < right:
            mid = (left + right) // 2
            if isBadVersion(mid):
                right = mid
            else:
                left = mid
        return right
