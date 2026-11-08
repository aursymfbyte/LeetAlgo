# 把每一列接在上一列後面，就是一個長度 m * n 的遞增一維陣列，第 i 個數是 matrix[i // n][i % n]。
# 在這個一維陣列上找第一個 >= target 的位置，再檢查它是不是 target。
# 用開區間 (left, right) 二分，一開始 left = -1、right = m * n，保持 left 的值 < target、right 的值 >= target。
# 時間 O(log(m * n))，空間 O(1)。
class Solution:
    def searchMatrix(self, matrix: list[list[int]], target: int) -> bool:
        m = len(matrix)
        n = len(matrix[0])
        left = -1
        right = m * n
        while left + 1 < right:
            mid = (left + right) // 2
            if matrix[mid // n][mid % n] >= target:
                right = mid
            else:
                left = mid

        return right < m * n and matrix[right // n][right % n] == target
